const BharatVerifyDlService = require("../services/bharatVerifyDlService");
const BharatVerifyJwtService = require("../services/bharatVerifyJwtService");

/**
 * Driving License Verification Endpoint
 * POST /driving-license/verify
 */
const verifyDl = async (req, res) => {
  try {
    const { dl_number, dob } = req.body || {};

    if (!dl_number || !dob) {
      return res.status(400).json({
        status: false,
        message: "dl_number and dob are required",
      });
    }

    const result = await BharatVerifyDlService.verify(
      String(dl_number).trim(),
      String(dob).trim()
    );

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error during Driving License verification",
    });
  }
};

/**
 * Aadhaar Verification Endpoint
 * POST /verify-aadhaar
 */
const verifyAadhaar = async (req, res) => {
  try {
    const { aadhaar_number } = req.body || {};
    const cleanAadhaar = aadhaar_number ? String(aadhaar_number).trim() : "";

    if (!cleanAadhaar || !/^\d{12}$/.test(cleanAadhaar)) {
      return res.status(400).json({
        status: false,
        message: "aadhaar_number is required and must contain exactly 12 digits",
      });
    }

    const result = await BharatVerifyDlService.verifyAadhaar(cleanAadhaar);

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error during Aadhaar verification",
    });
  }
};

/**
 * BharatVerify JWT Token Endpoint
 * GET /bharatverify/token
 */
const generateToken = async (req, res) => {
  try {
    const token = BharatVerifyJwtService.generateToken();

    return res.json({
      status: true,
      token: token,
      expires_in_seconds: 300,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to generate BharatVerify token",
    });
  }
};

module.exports = {
  verifyDl,
  verifyAadhaar,
  generateToken,
};
