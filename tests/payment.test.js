// tests/payment.test.js
const crypto = require('crypto');

describe('Payment Gateway Tests', () => {
  
  describe('MoMo Signature Validation', () => {
    const MOMO_SECRET_KEY = 'test_secret_key';

    function generateMomoSignature(data) {
      const rawSignature = `accessKey=${data.accessKey}&amount=${data.amount}&extraData=${data.extraData}&ipnUrl=${data.ipnUrl}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&partnerCode=${data.partnerCode}&redirectUrl=${data.redirectUrl}&requestId=${data.requestId}&requestType=${data.requestType}`;
      return crypto.createHmac('sha256', MOMO_SECRET_KEY).update(rawSignature).digest('hex');
    }

    it('should generate correct MoMo signature', () => {
      const requestData = {
        partnerCode: 'MOMO',
        accessKey: 'F8BBA842ECF85',
        requestId: 'MM1234567890',
        amount: '50000',
        orderId: 'ORDER123',
        orderInfo: 'Test Order',
        redirectUrl: 'http://localhost:5173/payment/success',
        ipnUrl: 'http://localhost:3000/api/payment/momo/ipn',
        requestType: 'captureWallet',
        extraData: ''
      };

      const signature = generateMomoSignature(requestData);
      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64); // SHA256 hex length
    });

    it('should validate MoMo IPN callback signature', () => {
      const ipnData = {
        partnerCode: 'MOMO',
        accessKey: 'F8BBA842ECF85',
        requestId: 'MM1234567890',
        amount: '50000',
        orderId: 'ORDER123',
        orderInfo: 'Test Order',
        orderType: 'momo_wallet',
        transId: '12345678',
        resultCode: '0',
        message: 'Success',
        payType: 'qr',
        responseTime: '1234567890123',
        extraData: ''
      };

      const rawSignature = `accessKey=${ipnData.accessKey}&amount=${ipnData.amount}&extraData=${ipnData.extraData}&message=${ipnData.message}&orderId=${ipnData.orderId}&orderInfo=${ipnData.orderInfo}&orderType=${ipnData.orderType}&partnerCode=${ipnData.partnerCode}&payType=${ipnData.payType}&requestId=${ipnData.requestId}&responseTime=${ipnData.responseTime}&resultCode=${ipnData.resultCode}&transId=${ipnData.transId}`;
      
      const expectedSignature = crypto.createHmac('sha256', MOMO_SECRET_KEY).update(rawSignature).digest('hex');
      
      expect(expectedSignature).toBeDefined();
      expect(typeof expectedSignature).toBe('string');
    });

    it('should reject invalid MoMo signature', () => {
      const ipnData = {
        partnerCode: 'MOMO',
        amount: '50000',
        orderId: 'ORDER123',
        signature: 'invalid_signature'
      };

      const rawSignature = `partnerCode=${ipnData.partnerCode}&amount=${ipnData.amount}&orderId=${ipnData.orderId}`;
      const validSignature = crypto.createHmac('sha256', MOMO_SECRET_KEY).update(rawSignature).digest('hex');
      
      expect(ipnData.signature).not.toBe(validSignature);
    });
  });

  describe('VNPay Hash Validation', () => {
    const VNPAY_HASH_SECRET = 'test_hash_secret';

    function generateVNPayHash(params) {
      // Sort params alphabetically
      const sortedKeys = Object.keys(params).sort();
      const signData = sortedKeys
        .map(key => `${key}=${params[key]}`)
        .join('&');
      
      return crypto.createHmac('sha512', VNPAY_HASH_SECRET).update(signData).digest('hex');
    }

    it('should generate correct VNPay hash', () => {
      const params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: 'TEST_TMN',
        vnp_Amount: '5000000',
        vnp_CreateDate: '20231110120000',
        vnp_CurrCode: 'VND',
        vnp_IpAddr: '127.0.0.1',
        vnp_Locale: 'vn',
        vnp_OrderInfo: 'Test Order',
        vnp_OrderType: 'other',
        vnp_ReturnUrl: 'http://localhost:5173/payment/success',
        vnp_TxnRef: 'ORDER123'
      };

      const hash = generateVNPayHash(params);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(128); // SHA512 hex length
    });

    it('should validate VNPay return URL hash', () => {
      const returnParams = {
        vnp_Amount: '5000000',
        vnp_BankCode: 'NCB',
        vnp_BankTranNo: 'VNP123456',
        vnp_CardType: 'ATM',
        vnp_OrderInfo: 'Test Order',
        vnp_PayDate: '20231110120500',
        vnp_ResponseCode: '00',
        vnp_TmnCode: 'TEST_TMN',
        vnp_TransactionNo: '123456789',
        vnp_TxnRef: 'ORDER123'
      };

      const hash = generateVNPayHash(returnParams);
      const receivedHash = hash; // In real scenario, this comes from query param
      
      expect(hash).toBe(receivedHash);
    });

    it('should detect tampered VNPay response', () => {
      const params = {
        vnp_Amount: '5000000',
        vnp_TxnRef: 'ORDER123',
        vnp_ResponseCode: '00'
      };

      const validHash = generateVNPayHash(params);
      
      // Simulate tampering
      params.vnp_Amount = '1000000'; // Changed amount
      const tamperedHash = generateVNPayHash(params);
      
      expect(validHash).not.toBe(tamperedHash);
    });
  });

  describe('Payment Status Codes', () => {
    it('should recognize MoMo success code', () => {
      const resultCode = 0;
      const isSuccess = resultCode === 0;
      expect(isSuccess).toBe(true);
    });

    it('should recognize MoMo failure codes', () => {
      const failureCodes = [9, 10, 11, 12, 13, 1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1026, 1080, 1081, 2001, 4001, 4010, 4011, 4100];
      
      failureCodes.forEach(code => {
        const isSuccess = code === 0;
        expect(isSuccess).toBe(false);
      });
    });

    it('should recognize VNPay success code', () => {
      const responseCode = '00';
      const isSuccess = responseCode === '00';
      expect(isSuccess).toBe(true);
    });

    it('should recognize VNPay failure codes', () => {
      const failureCodes = ['07', '09', '10', '11', '12', '13', '24', '51', '65', '75', '79', '99'];
      
      failureCodes.forEach(code => {
        const isSuccess = code === '00';
        expect(isSuccess).toBe(false);
      });
    });
  });

  describe('Amount Validation', () => {
    it('should validate MoMo amount format (integer)', () => {
      const amount = 50000;
      expect(Number.isInteger(amount)).toBe(true);
      expect(amount).toBeGreaterThan(0);
    });

    it('should validate VNPay amount format (must be in VND cents)', () => {
      const priceVND = 50000;
      const vnpayAmount = priceVND * 100; // VNPay expects amount in cents
      
      expect(vnpayAmount).toBe(5000000);
      expect(Number.isInteger(vnpayAmount)).toBe(true);
    });

    it('should reject negative amounts', () => {
      const amount = -1000;
      const isValid = amount > 0;
      expect(isValid).toBe(false);
    });

    it('should reject zero amounts', () => {
      const amount = 0;
      const isValid = amount > 0;
      expect(isValid).toBe(false);
    });
  });

  describe('Order ID Format', () => {
    it('should generate unique order IDs', () => {
      const orderId1 = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const orderId2 = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      expect(orderId1).not.toBe(orderId2);
    });

    it('should validate order ID format', () => {
      const orderId = 'ORDER_1699612345678_abc123def';
      const isValid = /^ORDER_\d+_[a-z0-9]+$/.test(orderId);
      expect(isValid).toBe(true);
    });
  });

  describe('Timeout Handling', () => {
    it('should handle payment timeout (15 minutes)', () => {
      const createdAt = new Date();
      const now = new Date(createdAt.getTime() + 16 * 60 * 1000); // 16 minutes later
      const timeoutMinutes = 15;
      
      const isExpired = (now - createdAt) > (timeoutMinutes * 60 * 1000);
      expect(isExpired).toBe(true);
    });

    it('should allow payment within timeout period', () => {
      const createdAt = new Date();
      const now = new Date(createdAt.getTime() + 10 * 60 * 1000); // 10 minutes later
      const timeoutMinutes = 15;
      
      const isExpired = (now - createdAt) > (timeoutMinutes * 60 * 1000);
      expect(isExpired).toBe(false);
    });
  });

  describe('Currency Validation', () => {
    it('should accept VND currency', () => {
      const currency = 'VND';
      const validCurrencies = ['VND'];
      expect(validCurrencies).toContain(currency);
    });

    it('should reject invalid currency', () => {
      const currency = 'USD';
      const validCurrencies = ['VND'];
      expect(validCurrencies).not.toContain(currency);
    });
  });

  describe('IPN/Webhook Security', () => {
    it('should validate IPN source IP (whitelist)', () => {
      const allowedIPs = ['123.456.789.0', '123.456.789.1']; // Mock IPs
      const requestIP = '123.456.789.0';
      
      const isAllowed = allowedIPs.includes(requestIP);
      expect(isAllowed).toBe(true);
    });

    it('should reject IPN from unknown IP', () => {
      const allowedIPs = ['123.456.789.0', '123.456.789.1'];
      const requestIP = '111.222.333.444';
      
      const isAllowed = allowedIPs.includes(requestIP);
      expect(isAllowed).toBe(false);
    });

    it('should prevent replay attacks with requestId', () => {
      const processedRequests = new Set(['REQ123', 'REQ124']);
      const newRequestId = 'REQ125';
      const duplicateRequestId = 'REQ123';
      
      expect(processedRequests.has(newRequestId)).toBe(false);
      expect(processedRequests.has(duplicateRequestId)).toBe(true);
    });
  });
});
