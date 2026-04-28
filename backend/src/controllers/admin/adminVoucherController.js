import Voucher from "../../models/Voucher.js";

// GET /admin/vouchers
export const getAllVouchers = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    const filter = {};
    if (search) filter.code = { $regex: search.toUpperCase(), $options: "i" };
    if (isActive !== undefined && isActive !== "") filter.isActive = isActive === "true";

    const vouchers = await Voucher.find(filter).sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (error) {
    console.error("getAllVouchers error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /admin/vouchers/:id
export const getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Voucher không tồn tại" });
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// POST /admin/vouchers
export const createVoucher = async (req, res) => {
  try {
    const {
      code, description, discountType, discountValue,
      minOrderValue, maxDiscountAmount, usageLimit,
      startDate, endDate, isActive,
    } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const existing = await Voucher.findOne({ code: code.trim().toUpperCase() });
    if (existing) return res.status(400).json({ message: "Mã voucher đã tồn tại" });

    const voucher = await Voucher.create({
      code: code.trim().toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      usageLimit: usageLimit || null,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ message: "Tạo voucher thành công", voucher });
  } catch (error) {
    console.error("createVoucher error:", error);
    if (error.code === 11000) return res.status(400).json({ message: "Mã voucher đã tồn tại" });
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// PUT /admin/vouchers/:id
export const updateVoucher = async (req, res) => {
  try {
    const {
      description, discountType, discountValue,
      minOrderValue, maxDiscountAmount, usageLimit,
      startDate, endDate, isActive,
    } = req.body;

    const voucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      {
        description,
        discountType,
        discountValue,
        minOrderValue: minOrderValue || 0,
        maxDiscountAmount: maxDiscountAmount || null,
        usageLimit: usageLimit || null,
        startDate: startDate || new Date(),
        endDate: endDate || null,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!voucher) return res.status(404).json({ message: "Voucher không tồn tại" });
    res.json({ message: "Cập nhật voucher thành công", voucher });
  } catch (error) {
    console.error("updateVoucher error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// DELETE /admin/vouchers/:id
export const deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Voucher không tồn tại" });
    res.json({ message: "Xóa voucher thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// PATCH /admin/vouchers/:id/toggle
export const toggleVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Voucher không tồn tại" });
    voucher.isActive = !voucher.isActive;
    await voucher.save();
    res.json({ message: `Voucher đã ${voucher.isActive ? "bật" : "tắt"}`, isActive: voucher.isActive });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};