const HeroBanner = require('../models/heroBanner.model');

// @desc    Get all hero banners (Admin)
// @route   GET /api/hero-banners/admin
// @access  Private/Admin
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await HeroBanner.find().sort({ order: 1, createdAt: -1 });
    res.json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    console.error('Get all banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách banner',
      error: error.message
    });
  }
};

// @desc    Get active hero banners (Public)
// @route   GET /api/hero-banners/active
// @access  Public
exports.getActiveBanners = async (req, res) => {
  try {
    const now = new Date();
    
    const banners = await HeroBanner.find({
      isActive: true,
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: { $gte: now } }
      ]
    }).sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    console.error('Get active banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy banner đang hoạt động',
      error: error.message
    });
  }
};

// @desc    Get single banner by ID
// @route   GET /api/hero-banners/:id
// @access  Private/Admin
exports.getBannerById = async (req, res) => {
  try {
    const banner = await HeroBanner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner'
      });
    }

    res.json({
      success: true,
      data: banner
    });
  } catch (error) {
    console.error('Get banner by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin banner',
      error: error.message
    });
  }
};

// @desc    Create new hero banner
// @route   POST /api/hero-banners
// @access  Private/Admin
exports.createBanner = async (req, res) => {
  try {
    const { title, subtitle, description, image, buttonText, buttonLink, isActive, startDate, endDate, order } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tiêu đề banner'
      });
    }
    // Remove image validation - cho phép tạo banner mà không cần ảnh

    const banner = await HeroBanner.create({
      title,
      subtitle,
      description,
      image,
      buttonText: buttonText || 'Khám phá ngay',
      buttonLink: buttonLink || '/products',
      isActive: isActive || false,
      startDate: startDate || null,
      endDate: endDate || null,
      order: order || 0
    });

    res.status(201).json({
      success: true,
      message: 'Tạo banner thành công',
      data: banner
    });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo banner',
      error: error.message
    });
  }
};

// @desc    Update hero banner
// @route   PUT /api/hero-banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res) => {
  try {
    const { title, subtitle, description, image, buttonText, buttonLink, isActive, startDate, endDate, order } = req.body;

    let banner = await HeroBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner'
      });
    }

    // Update fields
    if (title) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (description !== undefined) banner.description = description;
    if (image) banner.image = image;
    if (buttonText !== undefined) banner.buttonText = buttonText;
    if (buttonLink !== undefined) banner.buttonLink = buttonLink;
    if (isActive !== undefined) banner.isActive = isActive;
    if (startDate !== undefined) banner.startDate = startDate;
    if (endDate !== undefined) banner.endDate = endDate;
    if (order !== undefined) banner.order = order;

    await banner.save();

    res.json({
      success: true,
      message: 'Cập nhật banner thành công',
      data: banner
    });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật banner',
      error: error.message
    });
  }
};

// @desc    Delete hero banner
// @route   DELETE /api/hero-banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await HeroBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner'
      });
    }

    await banner.deleteOne();

    res.json({
      success: true,
      message: 'Xóa banner thành công'
    });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa banner',
      error: error.message
    });
  }
};

// @desc    Toggle banner active status
// @route   PATCH /api/hero-banners/:id/toggle
// @access  Private/Admin
exports.toggleBannerStatus = async (req, res) => {
  try {
    const banner = await HeroBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner'
      });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json({
      success: true,
      message: `${banner.isActive ? 'Kích hoạt' : 'Tắt'} banner thành công`,
      data: banner
    });
  } catch (error) {
    console.error('Toggle banner status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thay đổi trạng thái banner',
      error: error.message
    });
  }
};
