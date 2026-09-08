/**
 * =========================================================================
 * BHROSA CAB - UNIFIED CMS & WEBSITE CONTENT ROUTES (cmswebRoutes.js)
 * =========================================================================
 * Ye route file website ke sabhi public sections aur unke corresponding admin
 * CMS content editors ke endpoints ko single clean interface me mount karti hai.
 * =========================================================================
 */

const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/verifyAdmin");
const upload = require("../middleware/upload");
const cmswebController = require("../controllers/cmswebController");

// =========================================================================
// 1. GLOBAL HEADER, FOOTER & COMPANY INFO ROUTES
// =========================================================================

// Site Header (Logo, Nav Links, Call Button)
router.get("/site-header", cmswebController.getSiteHeader);
router.put(
  "/site-header",
  verifyAdmin,
  upload.fields([{ name: "logo", maxCount: 1 }]),
  cmswebController.updateSiteHeader
);

// Company Info (Phone, Email, Address across Header/Footer/Contact)
router.get("/company-info", cmswebController.getCompanyInfo);
router.put("/company-info", verifyAdmin, cmswebController.updateCompanyInfo);

// Footer Top Banner & Socials
router.get("/footer-top", cmswebController.getFooterTop);
router.put(
  "/footer-top",
  verifyAdmin,
  upload.fields([{ name: "logo", maxCount: 1 }]),
  cmswebController.updateFooterTop
);

// Footer Middle Columns & Links
router.get("/footer-middle", cmswebController.getFooterMiddle);
router.put("/footer-middle", verifyAdmin, cmswebController.updateFooterMiddle);

// Footer Vehicle Fleet Showcase
router.get("/footer-vehicles", cmswebController.getFooterVehicles);
router.post(
  "/footer-vehicles",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  cmswebController.createFooterVehicle
);
router.put(
  "/footer-vehicles/:id",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  cmswebController.updateFooterVehicle
);
router.delete("/footer-vehicles/:id", verifyAdmin, cmswebController.deleteFooterVehicle);

// =========================================================================
// 2. HOME PAGE CMS SECTIONS ROUTES
// =========================================================================

// Hero Carousel Slider
router.get("/hero-slides", cmswebController.getHeroSlides);
router.post(
  "/hero-slides",
  verifyAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "bg", maxCount: 1 },
    { name: "car", maxCount: 1 },
  ]),
  cmswebController.createHeroSlide
);
router.put(
  "/hero-slides/:id",
  verifyAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "bg", maxCount: 1 },
    { name: "car", maxCount: 1 },
  ]),
  cmswebController.updateHeroSlide
);
router.delete("/hero-slides/:id", verifyAdmin, cmswebController.deleteHeroSlide);

// About Section Snippet on Home
router.get("/about-section", cmswebController.getAboutSection);
router.put(
  "/about-section",
  verifyAdmin,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
  ]),
  cmswebController.updateAboutSection
);

// Cab Offer Heading
router.get("/offer-heading", cmswebController.getOfferHeading);
router.put("/offer-heading", verifyAdmin, cmswebController.updateOfferHeading);

// Cab Offer Cards
router.get("/offer-cards", cmswebController.getOfferCards);
router.post(
  "/offer-cards",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  cmswebController.createOfferCard
);
router.put(
  "/offer-cards/:id",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  cmswebController.updateOfferCard
);
router.delete("/offer-cards/:id", verifyAdmin, cmswebController.deleteOfferCard);

// Online Booking Steps & Features
router.get("/online-booking", cmswebController.getOnlineBooking);
router.put(
  "/online-booking",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  cmswebController.updateOnlineBooking
);

// Mobile App Download CTA
router.get("/download-section", cmswebController.getDownloadSection);
router.put(
  "/download-section",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  cmswebController.updateDownloadSection
);

// Why Choose Us Highlights
router.get("/why-choose-left", cmswebController.getWhyChooseLeft);
router.put(
  "/why-choose-left",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  cmswebController.updateWhyChooseLeft
);

// Registration Section Banner
router.get("/registration-section", cmswebController.getRegistrationSection);
router.put(
  "/registration-section",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  cmswebController.updateRegistrationSection
);

// Call to Action Strip
router.get("/cta-section", cmswebController.getCtaSection);
router.put("/cta-section", verifyAdmin, cmswebController.updateCtaSection);

// Taxi CTA Quick Call
router.get("/taxi-cta", cmswebController.getTaxiCta);
router.put("/taxi-cta", verifyAdmin, cmswebController.updateTaxiCta);

// =========================================================================
// 3. ABOUT US PAGE CMS SECTIONS ROUTES
// =========================================================================

// About Top Banner
router.get("/about-banner", cmswebController.getAboutBanner);
router.put(
  "/about-banner",
  verifyAdmin,
  upload.fields([{ name: "backgroundImage", maxCount: 1 }]),
  cmswebController.updateAboutBanner
);

// About Company Story, Vision, Mission
router.get("/about-company", cmswebController.getAboutCompany);
router.put(
  "/about-company",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  cmswebController.updateAboutCompany
);

// =========================================================================
// 4. SERVICES & PRICING CMS SECTIONS ROUTES
// =========================================================================

// Services Top Hero Banner
router.get("/service-banner", cmswebController.getServiceBanner);
router.put(
  "/service-banner",
  verifyAdmin,
  upload.fields([{ name: "backgroundImage", maxCount: 1 }]),
  cmswebController.updateServiceBanner
);

// Services Cards (In-City, Outstation, Airport, etc.)
router.get("/service-cards", cmswebController.getServiceCards);
router.post(
  "/service-cards",
  verifyAdmin,
  upload.fields([
    { name: "bg", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  cmswebController.createServiceCard
);
router.put(
  "/service-cards/:id",
  verifyAdmin,
  upload.fields([
    { name: "bg", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  cmswebController.updateServiceCard
);
router.delete("/service-cards/:id", verifyAdmin, cmswebController.deleteServiceCard);

// Pricing Heading
router.get("/pricing-heading", cmswebController.getPricingHeading);
router.put("/pricing-heading", verifyAdmin, cmswebController.updatePricingHeading);

// Pricing Cards
router.get("/pricing-cards", cmswebController.getPricingCards);
router.post(
  "/pricing-cards",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  cmswebController.createPricingCard
);
router.put(
  "/pricing-cards/:id",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  cmswebController.updatePricingCard
);
router.delete("/pricing-cards/:id", verifyAdmin, cmswebController.deletePricingCard);

// =========================================================================
// 5. EVENT & FRANCHISE CMS SECTIONS ROUTES
// =========================================================================

// Event Guests & Dignitaries
router.get("/event-guests", cmswebController.getEventGuests);
router.post(
  "/event-guests",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  cmswebController.createEventGuest
);
router.put(
  "/event-guests/:id",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  cmswebController.updateEventGuest
);
router.delete("/event-guests/:id", verifyAdmin, cmswebController.deleteEventGuest);

// Franchise Top Banner
router.get("/franchise-banner", cmswebController.getFranchiseBanner);
router.put("/franchise-banner", verifyAdmin, cmswebController.updateFranchiseBanner);

// Franchise Partnership Benefits
router.get("/franchise-benefits", cmswebController.getFranchiseBenefits);
router.put(
  "/franchise-benefits",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  cmswebController.updateFranchiseBenefits
);

// Franchise Application Form Submissions
router.post("/franchise-applications", cmswebController.createFranchiseApplication);
router.get("/franchise-applications", verifyAdmin, cmswebController.getFranchiseApplications);
router.delete("/franchise-applications/:id", verifyAdmin, cmswebController.deleteFranchiseApplication);

// =========================================================================
// 6. CONTACT US CMS SECTIONS ROUTES
// =========================================================================

// Google Maps Embed Coordinates
router.get("/contact-map", cmswebController.getContactMap);
router.put("/contact-map", verifyAdmin, cmswebController.updateContactMap);

// Contact Information & Timings
router.get("/contact-info", cmswebController.getContactInfo);
router.put("/contact-info", verifyAdmin, cmswebController.updateContactInfo);

// Contact Form Inquiries Submissions
router.post("/contact-messages", cmswebController.createContactMessage);
router.get("/contact-messages", verifyAdmin, cmswebController.getContactMessages);
router.delete("/contact-messages/:id", verifyAdmin, cmswebController.deleteContactMessage);

module.exports = router;
