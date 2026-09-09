const Driver = require("../models/Driver");
const BharatVerifyJwtService = require("./bharatVerifyJwtService");

class BharatVerifyDlService {
  /**
   * Verify Driving License via BharatVerify API
   * @param {string} dlNumber
   * @param {string} dob
   * @returns {Promise<Object>}
   */
  static async verify(dlNumber, dob) {
    try {
      // 1. Check if driver with this license_number already exists in database
      const exists = await Driver.exists({ license_number: dlNumber });
      if (exists) {
        return {
          status: false,
          message: "Driving License already registered",
        };
      }

      // 2. Generate fresh JWT token
      const jwtToken = BharatVerifyJwtService.generateToken();
      const dlUrl = process.env.BHARATVERIFY_DL_URL || "https://api.bharateverify.com/api/v1/dl-verification";

      // 3. Call BharatVerify API with 30-second timeout
      const response = await fetch(dlUrl, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "jwt-token": jwtToken,
        },
        body: JSON.stringify({
          dl_number: dlNumber,
          dob: dob,
        }),
        signal: AbortSignal.timeout(30000),
      });

      let resData;
      try {
        resData = await response.json();
      } catch (e) {
        resData = await response.text();
      }

      if (!response.ok) {
        return {
          status: false,
          http_code: response.status,
          response: resData,
        };
      }

      return resData;
    } catch (error) {
      return {
        status: false,
        message: error.message || "Failed to verify Driving License",
      };
    }
  }

  /**
   * Verify Aadhaar via BharatVerify API
   * @param {string} aadhaarNumber
   * @returns {Promise<Object>}
   */
  static async verifyAadhaar(aadhaarNumber) {
    try {
      // 1. Generate fresh JWT token
      const jwtToken = BharatVerifyJwtService.generateToken();
      const aadhaarUrl = process.env.BHARATVERIFY_AADHAAR_URL || "https://api.bharateverify.com/api/v4/aadhaar-validation";
      const partnerId = process.env.BHARATVERIFY_PARTNER_ID || "";

      // 2. Call BharatVerify Aadhaar Validation API with 30-second timeout
      const response = await fetch(aadhaarUrl, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "jwt-token": jwtToken,
          "partnerId": partnerId,
        },
        body: JSON.stringify({
          id_number: aadhaarNumber,
        }),
        signal: AbortSignal.timeout(30000),
      });

      let resData;
      try {
        resData = await response.json();
      } catch (e) {
        resData = await response.text();
      }

      if (!response.ok) {
        return {
          status: false,
          http_code: response.status,
          response: resData,
        };
      }

      return resData;
    } catch (error) {
      return {
        status: false,
        message: error.message || "Failed to verify Aadhaar",
      };
    }
  }
}

module.exports = BharatVerifyDlService;
