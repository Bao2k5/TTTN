// BE/src/utils/vnpay.js
const crypto = require('crypto');
const querystring = require('querystring');

/**
 * Sort object keys for VNPay signature
 * CRITICAL: Do NOT encode here - encoding happens in querystring.stringify
 */
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key]; // Keep original value - NO encoding
  });
  return sorted;
}

/**
 * Build VNPay secure hash for payment request
 * Spec: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html#tao-url-thanh-toan
 */
function buildVnpaySecureHash(params, hashSecret) {
  // Remove hash fields if present
  const cleanParams = { ...params };
  delete cleanParams.vnp_SecureHash;
  delete cleanParams.vnp_SecureHashType;

  // Sort params
  const sortedParams = sortObject(cleanParams);

  // Build sign data with URL encoding (must match final URL encoding)
  const signData = querystring.stringify(sortedParams, { encode: true });

  // Hash with HMAC-SHA512
  const hmac = crypto.createHmac('sha512', hashSecret);
  return hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
}

/**
 * Verify VNPay secure hash from IPN/return callback
 */
function verifyVnpaySecureHash(params, hashSecret) {
  const receivedHash = params.vnp_SecureHash;
  if (!receivedHash) return false;

  const expectedHash = buildVnpaySecureHash(params, hashSecret);

  // Case-insensitive comparison (VNPay may return uppercase)
  return expectedHash.toUpperCase() === receivedHash.toUpperCase();
}

module.exports = {
  sortObject,
  buildVnpaySecureHash,
  verifyVnpaySecureHash,
};
