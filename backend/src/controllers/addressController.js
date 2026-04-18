import Address from "../models/Address.js";

// GET /api/addresses - lấy danh sách địa chỉ của user
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1 });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// POST /api/addresses - thêm địa chỉ mới
export const createAddress = async (req, res) => {
  try {
    const { receiverName, phone, address, isDefault } = req.body;
    if (!receiverName || !phone || !address)
      return res.status(400).json({ message: "Thiếu thông tin địa chỉ" });

    // Nếu set default thì bỏ default các địa chỉ cũ
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const newAddr = await Address.create({
      user: req.user._id,
      receiverName, phone, address,
      isDefault: isDefault || false,
    });

    res.status(201).json(newAddr);
  } catch (err) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// PUT /api/addresses/:id - sửa địa chỉ
export const updateAddress = async (req, res) => {
  try {
    const addr = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!addr) return res.status(404).json({ message: "Không tìm thấy địa chỉ" });

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    Object.assign(addr, req.body);
    await addr.save();
    res.json(addr);
  } catch (err) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// DELETE /api/addresses/:id - xoá địa chỉ
export const deleteAddress = async (req, res) => {
  try {
    await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Đã xoá địa chỉ" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
