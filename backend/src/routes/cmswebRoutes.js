/**
 * CMS & Website Content Routes
 * Endpoints for public website sections and admin CMS management.
 */

const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/verifyAdmin");
const upload = require("../middleware/upload");
const bhrosawebController = require("../controllers/bhrosawebController");

// =========================================================================
// 1. GLOBAL HEADER, FOOTER & COMPANY INFO ROUTES
// =========================================================================

// Site Header (Logo, Nav Links, Call Button)
router.get("/site-header", bhrosawebController.getSiteHeader);
router.put(
  "/site-header",
  verifyAdmin,
  upload.fields([{ name: "logo", maxCount: 1 }]),
  bhrosawebController.updateSiteHeader
);

// Company Info (Phone, Email, Address across Header/Footer/Contact)
router.get("/company-info", bhrosawebController.getCompanyInfo);
router.put("/company-info", verifyAdmin, bhrosawebController.updateCompanyInfo);

// Footer Top Banner & Socials
router.get("/footer-top", bhrosawebController.getFooterTop);
router.put(
  "/footer-top",
  verifyAdmin,
  upload.fields([{ name: "logo", maxCount: 1 }]),
  bhrosawebController.updateFooterTop
);

// Footer Middle Columns & Links
router.get("/footer-middle", bhrosawebController.getFooterMiddle);
router.put("/footer-middle", verifyAdmin, bhrosawebController.updateFooterMiddle);

// Footer Vehicle Fleet Showcase
router.get("/footer-vehicles", bhrosawebController.getFooterVehicles);
router.post(
  "/footer-vehicles",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  bhrosawebController.createFooterVehicle
);
router.put(
  "/footer-vehicles/:id",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  bhrosawebController.updateFooterVehicle
);
router.delete("/footer-vehicles/:id", verifyAdmin, bhrosawebController.deleteFooterVehicle);

// =========================================================================
// 2. HOME PAGE CMS SECTIONS ROUTES
// =========================================================================

// Hero Carousel Slider
router.get("/hero-slides", bhrosawebController.getHeroSlides);
router.post(
  "/hero-slides",
  verifyAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "bg", maxCount: 1 },
    { name: "car", maxCount: 1 },
  ]),
  bhrosawebController.createHeroSlide
);
router.put(
  "/hero-slides/:id",
  verifyAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "bg", maxCount: 1 },
    { name: "car", maxCount: 1 },
  ]),
  bhrosawebController.updateHeroSlide
);
router.delete("/hero-slides/:id", verifyAdmin, bhrosawebController.deleteHeroSlide);

// About Section Snippet on Home
router.get("/about-section", bhrosawebController.getAboutSection);
router.put(
  "/about-section",
  verifyAdmin,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
  ]),
  bhrosawebController.updateAboutSection
);

// Cab Offer Heading
router.get("/offer-heading", bhrosawebController.getOfferHeading);
router.put("/offer-heading", verifyAdmin, bhrosawebController.updateOfferHeading);

// Cab Offer Cards
router.get("/offer-cards", bhrosawebController.getOfferCards);
router.post(
  "/offer-cards",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  bhrosawebController.createOfferCard
);
router.put(
  "/offer-cards/:id",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  bhrosawebController.updateOfferCard
);
router.delete("/offer-cards/:id", verifyAdmin, bhrosawebController.deleteOfferCard);

// Online Booking Steps & Features
router.get("/online-booking", bhrosawebController.getOnlineBooking);
router.put(
  "/online-booking",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  bhrosawebController.updateOnlineBooking
);

// Mobile App Download CTA
router.get("/download-section", bhrosawebController.getDownloadSection);
router.put(
  "/download-section",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  bhrosawebController.updateDownloadSection
);

// Why Choose Us Highlights
router.get("/why-choose-left", bhrosawebController.getWhyChooseLeft);
router.put(
  "/why-choose-left",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  bhrosawebController.updateWhyChooseLeft
);

// Registration Section Banner
router.get("/registration-section", bhrosawebController.getRegistrationSection);
router.put(
  "/registration-section",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  bhrosawebController.updateRegistrationSection
);

// Call to Action Strip
router.get("/cta-section", bhrosawebController.getCtaSection);
router.put("/cta-section", verifyAdmin, bhrosawebController.updateCtaSection);

// Taxi CTA Quick Call
router.get("/taxi-cta", bhrosawebController.getTaxiCta);
router.put("/taxi-cta", verifyAdmin, bhrosawebController.updateTaxiCta);

// =========================================================================
// 3. ABOUT US PAGE CMS SECTIONS ROUTES
// =========================================================================

// About Top Banner
router.get("/about-banner", bhrosawebController.getAboutBanner);
router.put(
  "/about-banner",
  verifyAdmin,
  upload.fields([{ name: "backgroundImage", maxCount: 1 }]),
  bhrosawebController.updateAboutBanner
);

// About Company Story, Vision, Mission
router.get("/about-company", bhrosawebController.getAboutCompany);
router.put(
  "/about-company",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  bhrosawebController.updateAboutCompany
);

// =========================================================================
// 4. SERVICES & PRICING CMS SECTIONS ROUTES
// =========================================================================

// Services Top Hero Banner
router.get("/service-banner", bhrosawebController.getServiceBanner);
router.put(
  "/service-banner",
  verifyAdmin,
  upload.fields([{ name: "backgroundImage", maxCount: 1 }]),
  bhrosawebController.updateServiceBanner
);

// Services Cards (In-City, Outstation, Airport, etc.)
router.get("/service-cards", bhrosawebController.getServiceCards);
router.post(
  "/service-cards",
  verifyAdmin,
  upload.fields([
    { name: "bg", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  bhrosawebController.createServiceCard
);
router.put(
  "/service-cards/:id",
  verifyAdmin,
  upload.fields([
    { name: "bg", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  bhrosawebController.updateServiceCard
);
router.delete("/service-cards/:id", verifyAdmin, bhrosawebController.deleteServiceCard);

// Pricing Heading
router.get("/pricing-heading", bhrosawebController.getPricingHeading);
router.put("/pricing-heading", verifyAdmin, bhrosawebController.updatePricingHeading);

// Pricing Cards
router.get("/pricing-cards", bhrosawebController.getPricingCards);
router.post(
  "/pricing-cards",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  bhrosawebController.createPricingCard
);
router.put(
  "/pricing-cards/:id",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  bhrosawebController.updatePricingCard
);
router.delete("/pricing-cards/:id", verifyAdmin, bhrosawebController.deletePricingCard);

// =========================================================================
// 5. EVENT & FRANCHISE CMS SECTIONS ROUTES
// =========================================================================

// Event Guests & Dignitaries
router.get("/event-guests", bhrosawebController.getEventGuests);
router.post(
  "/event-guests",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  bhrosawebController.createEventGuest
);
router.put(
  "/event-guests/:id",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  bhrosawebController.updateEventGuest
);
router.delete("/event-guests/:id", verifyAdmin, bhrosawebController.deleteEventGuest);

// Franchise Top Banner
router.get("/franchise-banner", bhrosawebController.getFranchiseBanner);
router.put("/franchise-banner", verifyAdmin, bhrosawebController.updateFranchiseBanner);

// Franchise Partnership Benefits
router.get("/franchise-benefits", bhrosawebController.getFranchiseBenefits);
router.put(
  "/franchise-benefits",
  verifyAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  bhrosawebController.updateFranchiseBenefits
);

// Franchise Application Form Submissions
router.post("/franchise-applications", bhrosawebController.createFranchiseApplication);
router.get("/franchise-applications", verifyAdmin, bhrosawebController.getFranchiseApplications);
router.delete("/franchise-applications/:id", verifyAdmin, bhrosawebController.deleteFranchiseApplication);

// =========================================================================
// 6. CONTACT US CMS SECTIONS ROUTES
// =========================================================================

// Google Maps Embed Coordinates
router.get("/contact-map", bhrosawebController.getContactMap);
router.put("/contact-map", verifyAdmin, bhrosawebController.updateContactMap);

// Contact Information & Timings
router.get("/contact-info", bhrosawebController.getContactInfo);
router.put("/contact-info", verifyAdmin, bhrosawebController.updateContactInfo);

// Contact Form Inquiries Submissions
router.post("/contact-messages", bhrosawebController.createContactMessage);
router.get("/contact-messages", verifyAdmin, bhrosawebController.getContactMessages);
router.delete("/contact-messages/:id", verifyAdmin, bhrosawebController.deleteContactMessage);

module.exports = router;
