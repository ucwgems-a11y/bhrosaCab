const express = require("express");
const router = express.Router();
const bharatVerifyController = require("../controllers/bharatVerifyController");

// Driving License Verification Endpoint
router.post("/driving-license/verify", bharatVerifyController.verifyDl);

// BharatVerify JWT Token Generation Endpoint
router.get("/bharatverify/token", bharatVerifyController.generateToken);

// Aadhaar Verification Endpoint
router.post("/verify-aadhaar", bharatVerifyController.verifyAadhaar);

module.exports = router;
