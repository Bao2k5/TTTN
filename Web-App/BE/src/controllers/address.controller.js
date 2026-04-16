// src/controllers/address.controller.js
const Address = require('../models/address.model');

// GET /api/address - Lấy danh sách địa chỉ của user
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Lấy danh sách địa chỉ thành công',
      data: addresses
    });
  } catch (err) {
    console.error('[getAddresses] Error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách địa chỉ', 
      error: err.message 
    });
  }
};

// POST /api/address - Tạo địa chỉ mới
exports.createAddress = async (req, res) => {
  try {
    const { fullName, phone, province, district, ward, address, isDefault, label } = req.body;

    // Validation
    if (!fullName || !phone || !province || !district || !ward || !address) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin địa chỉ'
      });
    }

    // Nếu user chưa có địa chỉ nào, tự động set địa chỉ đầu tiên làm mặc định
    const existingAddressCount = await Address.countDocuments({ userId: req.user.id });
    const shouldBeDefault = existingAddressCount === 0 ? true : (isDefault || false);

    const newAddress = await Address.create({
      userId: req.user.id,
      fullName,
      phone,
      province,
      district,
      ward,
      address,
      isDefault: shouldBeDefault,
      label: label || 'home'
    });

    res.status(201).json({
      success: true,
      message: 'Thêm địa chỉ mới thành công',
      data: newAddress
    });
  } catch (err) {
    console.error('[createAddress] Error:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi thêm địa chỉ', 
      error: err.message 
    });
  }
};

// PUT /api/address/:id - Cập nhật địa chỉ
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, province, district, ward, address, isDefault, label } = req.body;

    // Kiểm tra địa chỉ có thuộc về user không
    const existingAddress = await Address.findOne({ _id: id, userId: req.user.id });
    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa chỉ hoặc bạn không có quyền truy cập'
      });
    }

    // Update fields
    if (fullName !== undefined) existingAddress.fullName = fullName;
    if (phone !== undefined) existingAddress.phone = phone;
    if (province !== undefined) existingAddress.province = province;
    if (district !== undefined) existingAddress.district = district;
    if (ward !== undefined) existingAddress.ward = ward;
    if (address !== undefined) existingAddress.address = address;
    if (label !== undefined) existingAddress.label = label;
    if (isDefault !== undefined) existingAddress.isDefault = isDefault;

    await existingAddress.save(); // Trigger pre-save middleware

    res.json({
      success: true,
      message: 'Cập nhật địa chỉ thành công',
      data: existingAddress
    });
  } catch (err) {
    console.error('[updateAddress] Error:', err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi cập nhật địa chỉ', 
      error: err.message 
    });
  }
};

// DELETE /api/address/:id - Xóa địa chỉ
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra địa chỉ có thuộc về user không
    const existingAddress = await Address.findOne({ _id: id, userId: req.user.id });
    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa chỉ hoặc bạn không có quyền truy cập'
      });
    }

    // Nếu xóa địa chỉ mặc định, tự động set địa chỉ khác làm mặc định
    if (existingAddress.isDefault) {
      const otherAddress = await Address.findOne({ 
        userId: req.user.id, 
        _id: { $ne: id } 
      }).sort({ createdAt: -1 });
      
      if (otherAddress) {
        otherAddress.isDefault = true;
        await otherAddress.save();
      }
    }

    await Address.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Xóa địa chỉ thành công'
    });
  } catch (err) {
    console.error('[deleteAddress] Error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa địa chỉ', 
      error: err.message 
    });
  }
};

// PUT /api/address/:id/set-default - Đặt địa chỉ làm mặc định
exports.setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra địa chỉ có thuộc về user không
    const existingAddress = await Address.findOne({ _id: id, userId: req.user.id });
    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa chỉ hoặc bạn không có quyền truy cập'
      });
    }

    // Set isDefault = true (pre-save middleware sẽ tự động set các địa chỉ khác về false)
    existingAddress.isDefault = true;
    await existingAddress.save();

    res.json({
      success: true,
      message: 'Đặt địa chỉ mặc định thành công',
      data: existingAddress
    });
  } catch (err) {
    console.error('[setDefaultAddress] Error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi đặt địa chỉ mặc định', 
      error: err.message 
    });
  }
};
