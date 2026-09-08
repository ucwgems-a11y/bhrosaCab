const express = require("express");
const router = express.Router();
const carUpload = require("../middleware/carUpload");
const bannerUpload = require("../middleware/bannerUpload");

// Individual Controllers
const {
  getAppBanners,
  getAppBannerById,
  createAppBanner,
  updateAppBanner,
  deleteAppBanner,
} = require("../controllers/appBannerController");

const {
  getEmergencyNumbers,
  getEmergencyNumberById,
  createEmergencyNumber,
  updateEmergencyNumber,
  deleteEmergencyNumber,
} = require("../controllers/emergencyController");

const {
  getContactChannels,
  getContactChannelById,
  createContactChannel,
  updateContactChannel,
  deleteContactChannel,
} = require("../controllers/contactChannelController");

const {
  getPrivacyPolicies,
  getPrivacyPolicyById,
  createPrivacyPolicy,
  updatePrivacyPolicy,
  deletePrivacyPolicy,
} = require("../controllers/privacyPolicyController");

const {
  getTermsConditions,
  getTermsConditionById,
  createTermsCondition,
  updateTermsCondition,
  deleteTermsCondition,
} = require("../controllers/termsConditionController");

const {
  getAboutUsClauses,
  getAboutUsClauseById,
  createAboutUsClause,
  updateAboutUsClause,
  deleteAboutUsClause,
} = require("../controllers/aboutUsClauseController");

//  Emergency Numbers
router.get("/emergency", getEmergencyNumbers);
router.get("/emergency/:id", getEmergencyNumberById);
router.post("/emergency", createEmergencyNumber);
router.put("/emergency/:id", updateEmergencyNumber);
router.delete("/emergency/:id", deleteEmergencyNumber);

//  Contact Channels
router.get("/contact-us", getContactChannels);
router.get("/contact-us/:id", getContactChannelById);
router.post("/contact-us", carUpload.any(), createContactChannel);
router.put("/contact-us/:id", carUpload.any(), updateContactChannel);
router.delete("/contact-us/:id", deleteContactChannel);

//  Privacy Policy
router.get("/privacy-policy", getPrivacyPolicies);
router.get("/privacy-policy/:id", getPrivacyPolicyById);
router.post("/privacy-policy", createPrivacyPolicy);
router.put("/privacy-policy/:id", updatePrivacyPolicy);
router.delete("/privacy-policy/:id", deletePrivacyPolicy);

//  Terms & Conditions
router.get("/terms", getTermsConditions);
router.get("/terms/:id", getTermsConditionById);
router.post("/terms", createTermsCondition);
router.put("/terms/:id", updateTermsCondition);
router.delete("/terms/:id", deleteTermsCondition);

//  About Us
router.get("/about-us", getAboutUsClauses);
router.get("/about-us/:id", getAboutUsClauseById);
router.post("/about-us", createAboutUsClause);
router.put("/about-us/:id", updateAboutUsClause);
router.delete("/about-us/:id", deleteAboutUsClause);

module.exports = router;

// App Banners
router.get("/app-banners", getAppBanners);
router.get("/app-banners/:id", getAppBannerById);
router.post("/app-banners", bannerUpload.any(), createAppBanner);
router.put("/app-banners/:id", bannerUpload.any(), updateAppBanner);
router.delete("/app-banners/:id", deleteAppBanner);
