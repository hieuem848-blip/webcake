import Ingredient from "../../models/Ingredient.js";
import InventoryLog from "../../models/InventoryLog.js";

export const CATEGORIES = {
  bot_duong: "Bột & Đường",
  chat_long: "Chất lỏng & Dầu",
  trung_sua: "Trứng & Sữa",
  trang_tri: "Trang trí & Hương liệu",
  bao_bi: "Bao bì & Dụng cụ",
  khac: "Khác",
};

// ─── INGREDIENTS ─────────────────────────────────────────────────────────────

// GET /admin/inventory
export const getIngredients = async (req, res) => {
  try {
    const { category, lowStock, search } = req.query;
    const filter = { isDeleted: false };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    const ingredients = await Ingredient.find(filter).sort({ category: 1, name: 1 });

    // Đính kèm thông tin hết hạn gần nhất từ logs
    const now = new Date();
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Lấy log nhập có expiryDate gần nhất cho mỗi nguyên liệu
    const expiryMap = {};
    const expiryLogs = await InventoryLog.find({
      ingredient: { $in: ingredients.map((i) => i._id) },
      type: "import",
      expiryDate: { $ne: null, $gte: now },
    })
      .sort({ expiryDate: 1 })
      .select("ingredient expiryDate batchNote");

    for (const log of expiryLogs) {
      const key = log.ingredient.toString();
      if (!expiryMap[key]) expiryMap[key] = log; // lấy cái hết hạn sớm nhất
    }

    const result = ingredients.map((ing) => {
      const obj = ing.toObject();
      const expLog = expiryMap[ing._id.toString()];
      obj.nearestExpiry = expLog ? expLog.expiryDate : null;
      obj.expiringBatchNote = expLog ? expLog.batchNote : null;
      obj.isExpiringSoon = expLog ? expLog.expiryDate <= in7days : false;
      obj.isLowStock = ing.minThreshold > 0 && ing.stock <= ing.minThreshold;
      return obj;
    });

    // Nếu filter lowStock
    const filtered = lowStock === "1" ? result.filter((i) => i.isLowStock) : result;

    res.json({ ingredients: filtered });
  } catch (error) {
    console.error("getIngredients error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// POST /admin/inventory
export const createIngredient = async (req, res) => {
  try {
    const { name, unit, category, stock, minThreshold, costPrice, supplier, note } = req.body;
    if (!name || !unit) return res.status(400).json({ message: "Thiếu tên hoặc đơn vị" });

    const ingredient = await Ingredient.create({
      name,
      unit,
      category: category || "khac",
      stock: stock || 0,
      minThreshold: minThreshold || 0,
      costPrice: costPrice || 0,
      supplier: supplier || "",
      note: note || "",
    });

    if (stock > 0) {
      await InventoryLog.create({
        ingredient: ingredient._id,
        ingredientName: ingredient.name,
        ingredientUnit: ingredient.unit,
        type: "import",
        quantity: stock,
        costPrice: costPrice || 0,
        supplier: supplier || "",
        reason: "Tồn kho ban đầu khi thêm nguyên liệu",
        stockBefore: 0,
        stockAfter: stock,
        createdBy: req.user?._id,
      });
    }

    res.status(201).json({ ingredient });
  } catch (error) {
    console.error("createIngredient error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// PUT /admin/inventory/:id
export const updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, category, minThreshold, costPrice, supplier, note } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (unit !== undefined) updateFields.unit = unit;
    if (category !== undefined) updateFields.category = category;
    if (minThreshold !== undefined) updateFields.minThreshold = minThreshold;
    if (costPrice !== undefined) updateFields.costPrice = costPrice;
    if (supplier !== undefined) updateFields.supplier = supplier;
    if (note !== undefined) updateFields.note = note;

    if (Object.keys(updateFields).length === 0)
      return res.status(400).json({ message: "Không có trường nào được cập nhật" });

    const ingredient = await Ingredient.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });
    if (!ingredient) return res.status(404).json({ message: "Không tìm thấy nguyên liệu" });
    res.json({ ingredient });
  } catch (error) {
    console.error("updateIngredient error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// DELETE /admin/inventory/:id (soft delete)
export const deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const ingredient = await Ingredient.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!ingredient) return res.status(404).json({ message: "Không tìm thấy nguyên liệu" });
    res.json({ message: "Đã xoá nguyên liệu" });
  } catch (error) {
    console.error("deleteIngredient error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ─── MOVEMENT ────────────────────────────────────────────────────────────────

// POST /admin/inventory/:id/movement
export const recordMovement = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, quantity, reason, costPrice, supplier, expiryDate, batchNote } = req.body;

    if (!["import", "export", "spoilage", "adjust"].includes(type))
      return res.status(400).json({ message: "Loại giao dịch không hợp lệ" });
    if (!quantity || quantity <= 0)
      return res.status(400).json({ message: "Số lượng phải lớn hơn 0" });
    if (type === "spoilage" && !reason)
      return res.status(400).json({ message: "Vui lòng nhập lý do hủy" });

    const ingredient = await Ingredient.findById(id);
    if (!ingredient || ingredient.isDeleted)
      return res.status(404).json({ message: "Không tìm thấy nguyên liệu" });

    const stockBefore = ingredient.stock;

    if (type === "import") {
      ingredient.stock += quantity;
      // Cập nhật giá nhập và nhà cung cấp mới nhất
      if (costPrice > 0) ingredient.costPrice = costPrice;
      if (supplier) ingredient.supplier = supplier;
    } else if (type === "adjust") {
      // Điều chỉnh tồn kho tuyệt đối (kiểm kê)
      ingredient.stock = quantity;
    } else {
      if (ingredient.stock < quantity)
        return res.status(400).json({
          message: `Không đủ tồn kho! Chỉ còn ${ingredient.stock} ${ingredient.unit}`,
        });
      ingredient.stock -= quantity;
    }

    await ingredient.save();

    const log = await InventoryLog.create({
      ingredient: ingredient._id,
      ingredientName: ingredient.name,
      ingredientUnit: ingredient.unit,
      type,
      quantity,
      costPrice: type === "import" ? costPrice || 0 : 0,
      supplier: type === "import" ? supplier || "" : "",
      expiryDate: type === "import" && expiryDate ? new Date(expiryDate) : null,
      batchNote: batchNote || "",
      reason: reason || "",
      stockBefore,
      stockAfter: ingredient.stock,
      createdBy: req.user?._id,
    });

    res.json({ ingredient, log });
  } catch (error) {
    console.error("recordMovement error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ─── LOGS ─────────────────────────────────────────────────────────────────────

// GET /admin/inventory/logs
export const getLogs = async (req, res) => {
  try {
    const {
      ingredientId,
      type,
      fromDate,
      toDate,
      page = 1,
      limit = 30,
    } = req.query;

    const filter = {};
    if (ingredientId) filter.ingredient = ingredientId;
    if (type && type !== "all") filter.type = type;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      InventoryLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("ingredient", "name unit category")
        .populate("createdBy", "displayName"),
      InventoryLog.countDocuments(filter),
    ]);

    res.json({
      logs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("getLogs error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ─── STATS ────────────────────────────────────────────────────────────────────

// GET /admin/inventory/stats
export const getInventoryStats = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({ isDeleted: false });
    const total = ingredients.length;
    const lowStock = ingredients.filter((i) => i.minThreshold > 0 && i.stock <= i.minThreshold).length;

    // Giá trị tồn kho = sum(stock * costPrice)
    const totalValue = ingredients.reduce((sum, i) => sum + i.stock * (i.costPrice || 0), 0);

    // Giao dịch hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTransactions = await InventoryLog.countDocuments({ createdAt: { $gte: today } });

    // Sắp hết hạn (trong 7 ngày)
    const in7days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiringSoon = await InventoryLog.distinct("ingredient", {
      type: "import",
      expiryDate: { $ne: null, $gte: today, $lte: in7days },
    });

    // Nhập/xuất/hủy trong 30 ngày
    const in30days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthlyAgg = await InventoryLog.aggregate([
      { $match: { createdAt: { $gte: in30days } } },
      { $group: { _id: "$type", count: { $sum: 1 }, totalQty: { $sum: "$quantity" } } },
    ]);
    const monthly = { import: 0, export: 0, spoilage: 0 };
    for (const a of monthlyAgg) {
      if (monthly[a._id] !== undefined) monthly[a._id] = a.count;
    }

    res.json({
      total,
      lowStock,
      totalValue,
      todayTransactions,
      expiringSoonCount: expiringSoon.length,
      monthly,
    });
  } catch (error) {
    console.error("getInventoryStats error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ─── EXPIRY ALERTS ────────────────────────────────────────────────────────────

// GET /admin/inventory/expiry-alerts
export const getExpiryAlerts = async (req, res) => {
  try {
    const now = new Date();
    const in14days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const logs = await InventoryLog.find({
      type: "import",
      expiryDate: { $ne: null, $gte: now, $lte: in14days },
    })
      .sort({ expiryDate: 1 })
      .populate("ingredient", "name unit stock")
      .populate("createdBy", "displayName");

    // Group by ingredient
    const grouped = {};
    for (const log of logs) {
      const key = log.ingredient?._id?.toString();
      if (!key) continue;
      if (!grouped[key]) {
        grouped[key] = {
          ingredient: log.ingredient,
          batches: [],
        };
      }
      grouped[key].batches.push({
        _id: log._id,
        quantity: log.quantity,
        expiryDate: log.expiryDate,
        batchNote: log.batchNote,
        daysLeft: Math.ceil((log.expiryDate - now) / (1000 * 60 * 60 * 24)),
      });
    }

    res.json({ alerts: Object.values(grouped) });
  } catch (error) {
    console.error("getExpiryAlerts error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ─── EXPORT CSV ───────────────────────────────────────────────────────────────

// GET /admin/inventory/export-csv
export const exportInventoryCSV = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({ isDeleted: false }).sort({ category: 1, name: 1 });

    const CATEGORY_LABELS = {
      bot_duong: "Bột & Đường",
      chat_long: "Chất lỏng & Dầu",
      trung_sua: "Trứng & Sữa",
      trang_tri: "Trang trí & Hương liệu",
      bao_bi: "Bao bì & Dụng cụ",
      khac: "Khác",
    };

    const rows = [
      ["Tên nguyên liệu", "Danh mục", "Đơn vị", "Tồn kho", "Ngưỡng cảnh báo", "Giá nhập (VNĐ)", "Giá trị tồn (VNĐ)", "Nhà cung cấp", "Ghi chú"],
    ];

    for (const ing of ingredients) {
      rows.push([
        ing.name,
        CATEGORY_LABELS[ing.category] || ing.category,
        ing.unit,
        ing.stock,
        ing.minThreshold,
        ing.costPrice || 0,
        (ing.stock * (ing.costPrice || 0)).toFixed(0),
        ing.supplier || "",
        ing.note || "",
      ]);
    }

    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const bom = "\uFEFF"; // UTF-8 BOM cho Excel đọc tiếng Việt

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="ton-kho-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(bom + csv);
  } catch (error) {
    console.error("exportInventoryCSV error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /admin/inventory/export-logs-csv
export const exportLogsCSV = async (req, res) => {
  try {
    const { fromDate, toDate, type } = req.query;
    const filter = {};
    if (type && type !== "all") filter.type = type;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const logs = await InventoryLog.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "displayName");

    const TYPE_LABELS = { import: "Nhập kho", export: "Xuất kho", spoilage: "Hủy/Hao hụt", adjust: "Điều chỉnh" };

    const rows = [
      ["Thời gian", "Nguyên liệu", "Đơn vị", "Loại", "Số lượng", "Tồn trước", "Tồn sau", "Giá nhập", "Nhà cung cấp", "Ngày HH", "Số lô", "Lý do", "Người thực hiện"],
    ];

    for (const log of logs) {
      rows.push([
        new Date(log.createdAt).toLocaleString("vi-VN"),
        log.ingredientName,
        log.ingredientUnit || "",
        TYPE_LABELS[log.type] || log.type,
        log.quantity,
        log.stockBefore,
        log.stockAfter,
        log.costPrice || 0,
        log.supplier || "",
        log.expiryDate ? new Date(log.expiryDate).toLocaleDateString("vi-VN") : "",
        log.batchNote || "",
        log.reason || "",
        typeof log.createdBy === "object" ? log.createdBy?.displayName || "" : "",
      ]);
    }

    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const bom = "\uFEFF";

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="lich-su-kho-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(bom + csv);
  } catch (error) {
    console.error("exportLogsCSV error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};