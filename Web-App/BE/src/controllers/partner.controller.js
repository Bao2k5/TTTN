const Partner = require('../models/partner.model');
const asyncHandler = require('express-async-handler');

// @desc    Get all active partners (for frontend display)
// @route   GET /api/partners
// @access  Public
const getPartners = asyncHandler(async (req, res) => {
  const now = new Date();
  
  // Lấy partners có displayFrom <= ngày hôm nay && (displayTo = null hoặc displayTo >= ngày hôm nay)
  const partners = await Partner.find({
    isActive: true,
    displayFrom: { $lte: now },
    $or: [
      { displayTo: null },
      { displayTo: { $gte: now } }
    ]
  })
    .sort({ position: 1 })
    .lean();

  res.json({
    success: true,
    data: partners,
  });
});

// @desc    Get all partners (admin view)
// @route   GET /api/admin/partners
// @access  Admin
const getAllPartners = asyncHandler(async (req, res) => {
  const partners = await Partner.find()
    .populate('createdBy', 'name email')
    .sort({ position: 1 });

  res.json({
    success: true,
    data: partners,
  });
});

// @desc    Create partner
// @route   POST /api/admin/partners
// @access  Admin
const createPartner = asyncHandler(async (req, res) => {
  const { name, logo, url, description, displayFrom, displayTo, isActive, position } = req.body;

  // Validation
  if (!name || !logo) {
    return res.status(400).json({
      success: false,
      message: 'Tên và logo là bắt buộc',
    });
  }

  const partner = new Partner({
    name,
    logo,
    url: url || '#',
    description,
    displayFrom: displayFrom ? new Date(displayFrom) : new Date(),
    displayTo: displayTo ? new Date(displayTo) : null,
    isActive: isActive !== false,
    position: position || 0,
    createdBy: req.user?.id,
  });

  await partner.save();

  res.status(201).json({
    success: true,
    message: 'Tạo partner thành công',
    data: partner,
  });
});

// @desc    Update partner
// @route   PUT /api/admin/partners/:id
// @access  Admin
const updatePartner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, logo, url, description, displayFrom, displayTo, isActive, position } = req.body;

  let partner = await Partner.findById(id);

  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Partner không tìm thấy',
    });
  }

  // Update fields
  if (name) partner.name = name;
  if (logo) partner.logo = logo;
  if (url) partner.url = url;
  if (description) partner.description = description;
  if (displayFrom) partner.displayFrom = new Date(displayFrom);
  if (displayTo !== undefined) partner.displayTo = displayTo ? new Date(displayTo) : null;
  if (isActive !== undefined) partner.isActive = isActive;
  if (position !== undefined) partner.position = position;

  await partner.save();

  res.json({
    success: true,
    message: 'Cập nhật partner thành công',
    data: partner,
  });
});

// @desc    Delete partner
// @route   DELETE /api/admin/partners/:id
// @access  Admin
const deletePartner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const partner = await Partner.findByIdAndDelete(id);

  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Partner không tìm thấy',
    });
  }

  res.json({
    success: true,
    message: 'Xóa partner thành công',
    data: partner,
  });
});

// @desc    Bulk update partners position
// @route   PUT /api/admin/partners/bulk-position
// @access  Admin
const bulkUpdatePosition = asyncHandler(async (req, res) => {
  const { partners } = req.body;

  if (!Array.isArray(partners)) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
    });
  }

  // Update tất cả partners
  const updatePromises = partners.map(({ id, position }) =>
    Partner.findByIdAndUpdate(id, { position }, { new: true })
  );

  await Promise.all(updatePromises);

  res.json({
    success: true,
    message: 'Cập nhật vị trí thành công',
  });
});

module.exports = {
  getPartners,
  getAllPartners,
  createPartner,
  updatePartner,
  deletePartner,
  bulkUpdatePosition,
};
