const express = require("express");
const router = express.Router();
const carUpload = require("../middleware/carUpload");
const bannerUpload = require("../middleware/bannerUpload");
const verifyAdmin = require("../middleware/verifyAdmin");

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
router.post("/emergency", verifyAdmin, createEmergencyNumber);
router.put("/emergency/:id", verifyAdmin, updateEmergencyNumber);
router.delete("/emergency/:id", verifyAdmin, deleteEmergencyNumber);

//  Contact Channels
router.get("/contact-us", getContactChannels);
router.get("/contact-us/:id", getContactChannelById);
router.post("/contact-us", verifyAdmin, carUpload.any(), createContactChannel);
router.put("/contact-us/:id", verifyAdmin, carUpload.any(), updateContactChannel);
router.delete("/contact-us/:id", verifyAdmin, deleteContactChannel);

//  Privacy Policy
router.get("/privacy-policy", getPrivacyPolicies);
router.get("/privacy-policy/:id", getPrivacyPolicyById);
router.post("/privacy-policy", verifyAdmin, createPrivacyPolicy);
router.put("/privacy-policy/:id", verifyAdmin, updatePrivacyPolicy);
router.delete("/privacy-policy/:id", verifyAdmin, deletePrivacyPolicy);

//  Terms & Conditions
router.get("/terms", getTermsConditions);
router.get("/terms/:id", getTermsConditionById);
router.post("/terms", verifyAdmin, createTermsCondition);
router.put("/terms/:id", verifyAdmin, updateTermsCondition);
router.delete("/terms/:id", verifyAdmin, deleteTermsCondition);

//  About Us
router.get("/about-us", getAboutUsClauses);
router.get("/about-us/:id", getAboutUsClauseById);
router.post("/about-us", verifyAdmin, createAboutUsClause);
router.put("/about-us/:id", verifyAdmin, updateAboutUsClause);
router.delete("/about-us/:id", verifyAdmin, deleteAboutUsClause);

// App Banners
router.get("/app-banners", getAppBanners);
router.get("/app-banners/:id", getAppBannerById);
router.post("/app-banners", verifyAdmin, bannerUpload.any(), createAppBanner);
router.put("/app-banners/:id", verifyAdmin, bannerUpload.any(), updateAppBanner);
router.delete("/app-banners/:id", verifyAdmin, deleteAppBanner);

module.exports = router;
