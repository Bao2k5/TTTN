// BE/src/utils/momo.js
const crypto = require('crypto');

/**
 * Build MoMo signature for payment request
 * Spec: https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method-by-app-qr-code
 */
function buildMomoSignature(payload, secretKey) {
  // MoMo requires params sorted alphabetically
  const rawSignature = [
    `accessKey=${payload.accessKey}`,
    `amount=${payload.amount}`,
    `extraData=${payload.extraData || ''}`,
    `ipnUrl=${payload.ipnUrl}`,
    `orderId=${payload.orderId}`,
    `orderInfo=${payload.orderInfo}`,
    `partnerCode=${payload.partnerCode}`,
    `redirectUrl=${payload.redirectUrl}`,
    `requestId=${payload.requestId}`,
    `requestType=${payload.requestType}`,
  ].join('&');

  return crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');
}

/**
 * Verify MoMo IPN signature
 * IPN uses different params than payment request
 */
function verifyMomoIpnSignature(body, secretKey) {
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature: receivedSignature,
  } = body;

  // Build signature string (sorted alphabetically)
  const rawSignature = [
    `accessKey=${process.env.MOMO_ACCESS_KEY}`,
    `amount=${amount}`,
    `extraData=${extraData || ''}`,
    `message=${message}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `orderType=${orderType}`,
    `partnerCode=${partnerCode}`,
    `payType=${payType}`,
    `requestId=${requestId}`,
    `responseTime=${responseTime}`,
    `resultCode=${resultCode}`,
    `transId=${transId}`,
  ].join('&');

  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  return expectedSignature === receivedSignature;
}

/**
 * Verify MoMo callback signature (redirect URL)
 */
function verifyMomoCallbackSignature(query, secretKey) {
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature: receivedSignature,
  } = query;

  // Same as IPN signature
  const rawSignature = [
    `accessKey=${process.env.MOMO_ACCESS_KEY}`,
    `amount=${amount}`,
    `extraData=${extraData || ''}`,
    `message=${message}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `orderType=${orderType}`,
    `partnerCode=${partnerCode}`,
    `payType=${payType}`,
    `requestId=${requestId}`,
    `responseTime=${responseTime}`,
    `resultCode=${resultCode}`,
    `transId=${transId}`,
  ].join('&');

  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  return expectedSignature === receivedSignature;
}

module.exports = {
  buildMomoSignature,
  verifyMomoIpnSignature,
  verifyMomoCallbackSignature,
};
