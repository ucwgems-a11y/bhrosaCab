const jwt = require("jsonwebtoken");
const crypto = require("crypto");

class BharatVerifyJwtService {
  /**
   * Generate BharatVerify JWT Token using HS256 algorithm
   * @returns {string} JWT Token
   */
  static generateToken() {
    const partnerId = process.env.BHARATVERIFY_PARTNER_ID || "";
    const partnerSecret = process.env.BHARATVERIFY_PARTNER_SECRET || "";

    if (!partnerSecret) {
      throw new Error("BHARATVERIFY_PARTNER_SECRET is missing in environment variables.");
    }

    const uniqueId = crypto.randomUUID ? crypto.randomUUID() : Date.now() + "_" + Math.random().toString(36).substring(2, 9);

    const payload = {
      timestamp: Math.floor(Date.now() / 1000),
      partnerId: partnerId,
      reqid: `req_${uniqueId}`,
    };

    return jwt.sign(payload, partnerSecret, { algorithm: "HS256" });
  }
}

module.exports = BharatVerifyJwtService;
