// src/controllers/vietqr.controller.js
// Tích hợp VietQR - Thanh toán chuyển khoản ngân hàng qua QR

/**
 * VietQR API Documentation: https://www.vietqr.io/
 * Format QR: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<template>.jpg?amount=<AMOUNT>&addInfo=<MESSAGE>
 */

// Cấu hình tài khoản ngân hàng nhận tiền
const BANK_CONFIG = {
  bankId: 'MB',  // Mã ngân hàng (MB Bank, VCB, TCB, ACB, etc.)
  bankName: 'MB Bank',
  accountNo: '0326895012',  // Số tài khoản nhận tiền
  accountName: 'LE DUONG BAO',  // Tên chủ tài khoản
  template: 'compact2'  // Template QR: compact, compact2, qr_only, print
};

// Danh sách mã ngân hàng VietQR
const BANK_LIST = {
  'VCB': 'Vietcombank',
  'TCB': 'Techcombank', 
  'MB': 'MB Bank',
  'ACB': 'ACB',
  'VPB': 'VPBank',
  'TPB': 'TPBank',
  'BIDV': 'BIDV',
  'VIB': 'VIB',
  'SHB': 'SHB',
  'MSB': 'MSB',
  'STB': 'Sacombank',
  'OCB': 'OCB',
  'HDB': 'HDBank',
  'NAB': 'Nam A Bank',
  'EIB': 'Eximbank'
};

// @desc    Generate VietQR code for payment
// @route   POST /api/payment/vietqr/generate
exports.generateQR = async (req, res) => {
  try {
    const { orderId, amount, customerName } = req.body;
    
    if (!orderId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin đơn hàng' 
      });
    }
    
    // Tạo nội dung chuyển khoản
    const transferContent = `HM${orderId}`.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Tạo URL QR từ VietQR
    const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-${BANK_CONFIG.template}.jpg?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;
    
    res.json({
      success: true,
      data: {
        qrUrl,
        bankInfo: {
          bankId: BANK_CONFIG.bankId,
          bankName: BANK_CONFIG.bankName,
          accountNo: BANK_CONFIG.accountNo,
          accountName: BANK_CONFIG.accountName
        },
        paymentInfo: {
          amount,
          transferContent,
          orderId
        },
        instructions: [
          '1. Mở app ngân hàng của bạn',
          '2. Chọn "Quét QR" hoặc "Chuyển khoản"',
          '3. Quét mã QR hoặc nhập thông tin',
          '4. Kiểm tra nội dung chuyển khoản',
          '5. Xác nhận thanh toán'
        ]
      }
    });
  } catch (error) {
    console.error('Generate VietQR error:', error);
    res.status(500).json({ success: false, message: 'Lỗi tạo mã QR' });
  }
};

// @desc    Get bank list
// @route   GET /api/payment/vietqr/banks
exports.getBanks = async (req, res) => {
  try {
    const banks = Object.entries(BANK_LIST).map(([id, name]) => ({ id, name }));
    res.json({ success: true, data: banks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current bank config (for display)
// @route   GET /api/payment/vietqr/config
exports.getBankConfig = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        bankId: BANK_CONFIG.bankId,
        bankName: BANK_CONFIG.bankName,
        accountNo: BANK_CONFIG.accountNo,
        accountName: BANK_CONFIG.accountName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify payment (manual or webhook from bank)
// @route   POST /api/payment/vietqr/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, transactionId } = req.body;
    
    // NOTE: Để tự động xác nhận thanh toán, cần tích hợp:
    // 1. Casso.vn - Webhook tự động từ ngân hàng
    // 2. SePay - API kiểm tra giao dịch
    // 3. Hoặc admin xác nhận thủ công
    
    // Tạm thời: Admin sẽ xác nhận thủ công
    res.json({
      success: true,
      message: 'Đã ghi nhận. Vui lòng đợi xác nhận từ hệ thống.',
      note: 'Thanh toán sẽ được xác nhận trong 5-10 phút'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
