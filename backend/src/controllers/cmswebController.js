 /**
 * =========================================================================
 * BHROSA CAB - UNIFIED CMS & WEBSITE CONTENT CONTROLLER (cmswebController.js)
 * =========================================================================
 * Ye controller public website ke sabhi dynamic sections aur pages ko manage
 * karta hai. Har section ke liye GET (Public website) aur PUT/POST/DELETE (Admin
 * CMS management) methods shamil hain.
 *
 * SECTIONS COVERED:
 * 1. Global Header, Footer & Company Info (SiteHeader, CompanyInfo, FooterTop, FooterMiddle, FooterVehicle)
 * 2. Home Page (HeroSlides, AboutSection, OfferHeading, OfferCards, OnlineBooking, DownloadSection, WhyChooseLeft, RegistrationSection, CtaSection, TaxiCta)
 * 3. About Us Page (AboutBanner, AboutCompany)
 * 4. Services & Pricing (ServiceBanner, ServiceCards, PricingHeading, PricingCards)
 * 5. Event & Franchise (EventGuests, FranchiseBanner, FranchiseBenefits, FranchiseApplications)
 * 6. Contact Us (ContactMap, ContactInfo, ContactMessages)
 * =========================================================================
 */

// Models Import
const SiteHeader = require("../models/SiteHeader");
const CompanyInfo = require("../models/CompanyInfo");
const FooterTop = require("../models/FooterTop");
const FooterMiddle = require("../models/FooterMiddle");
const FooterVehicle = require("../models/FooterVehicle");

const HeroSlide = require("../models/HeroSlide");
const AboutSection = require("../models/AboutSection");
const OfferHeading = require("../models/OfferHeading");
const OfferCard = require("../models/OfferCard");
const OnlineBooking = require("../models/OnlineBooking");
const DownloadSection = require("../models/DownloadSection");
const WhyChooseLeft = require("../models/WhyChooseLeft");
const RegistrationSection = require("../models/RegistrationSection");
const CtaSection = require("../models/CtaSection");
const TaxiCta = require("../models/TaxiCta");

const AboutBanner = require("../models/AboutBanner");
const AboutCompany = require("../models/AboutCompany");

const ServiceBanner = require("../models/ServiceBanner");
const ServiceCard = require("../models/ServiceCard");
const PricingHeading = require("../models/PricingHeading");
const PricingCard = require("../models/PricingCard");

const EventGuest = require("../models/EventGuest");
const FranchiseBanner = require("../models/FranchiseBanner");
const FranchiseBenefits = require("../models/FranchiseBenefits");
const FranchiseApplication = require("../models/FranchiseApplication");

const ContactMap = require("../models/ContactMap");
const ContactInfo = require("../models/ContactInfo");
const ContactMessage = require("../models/ContactMessage");

/* =========================================================================
   SECTION 1: GLOBAL HEADER, FOOTER & COMPANY INFO
========================================================================= */

// --- 1.1 Site Header (Logo, Nav Links, Call Button) ---
// GET /api/site-header
const getSiteHeader = async (req, res) => {
  try {
    const header = await SiteHeader.findOne();
    res.json(header);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/site-header
const updateSiteHeader = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.logo) {
      data.logo = `/uploads/${req.files.logo[0].filename}`;
    }
    const header = await SiteHeader.findOneAndUpdate({}, data, {
      returnDocument: "after",
      upsert: true,
    });
    res.json(header);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 1.2 Company Info (Global Phone, Email, Office Address) ---
// GET /api/company-info
const getCompanyInfo = async (req, res) => {
  try {
    const info = await CompanyInfo.findOne();
    res.json(info);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/company-info
const updateCompanyInfo = async (req, res) => {
  try {
    const info = await CompanyInfo.findOneAndUpdate({}, req.body, {
      returnDocument: "after",
      upsert: true,
    });
    res.json(info);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 1.3 Footer Top (Newsletter & Social Links) ---
// GET /api/footer-top
const getFooterTop = async (req, res) => {
  try {
    const footer = await FooterTop.findOne();
    res.json(footer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/footer-top
const updateFooterTop = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.logo) {
      data.logo = `/uploads/${req.files.logo[0].filename}`;
    }
    const footer = await FooterTop.findOneAndUpdate({}, data, {
      returnDocument: "after",
      upsert: true,
    });
    res.json(footer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 1.4 Footer Middle (Quick Links & Info) ---
// GET /api/footer-middle
const getFooterMiddle = async (req, res) => {
  try {
    let footer = await FooterMiddle.findOne();
    if (!footer) {
      footer = await FooterMiddle.create({
        address: "Aviva building, JP infra, Vinay Nagar, Mira Road, Mumbai.",
        email: "servicesupport@bhrosacabs.com",
        links: [
          { label: "About Us", url: "/about" },
          { label: "Contact Us", url: "/contact" },
          { label: "Privacy & Policy", url: "/privacy-policy" },
          { label: "Refund Policy", url: "/refund-policy" },
          { label: "Terms & Conditions", url: "/terms-and-conditions" },
        ],
      });
    }
    res.json(footer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/footer-middle
const updateFooterMiddle = async (req, res) => {
  try {
    const data = { ...req.body };
    if (typeof data.links === "string") {
      try {
        data.links = JSON.parse(data.links);
      } catch (e) {
        console.error("Failed to parse links JSON:", e);
      }
    }
    const footer = await FooterMiddle.findOneAndUpdate({}, data, {
      returnDocument: "after",
      upsert: true,
    });
    res.json(footer);
  } catch (error) {
    console.error("updateFooterMiddle error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 1.5 Footer Vehicles (Fleet Showcase) ---
// GET /api/footer-vehicles
const getFooterVehicles = async (req, res) => {
  try {
    const vehicles = await FooterVehicle.find().sort({ order: 1, createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/footer-vehicles
const createFooterVehicle = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) {
      data.image = `/uploads/${req.files.image[0].filename}`;
    }
    const vehicle = await FooterVehicle.create(data);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/footer-vehicles/:id
const updateFooterVehicle = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) {
      data.image = `/uploads/${req.files.image[0].filename}`;
    }
    const vehicle = await FooterVehicle.findByIdAndUpdate(req.params.id, data, { returnDocument: "after" });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/footer-vehicles/:id
const deleteFooterVehicle = async (req, res) => {
  try {
    const vehicle = await FooterVehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* =========================================================================
   SECTION 2: HOME PAGE CMS SECTIONS
========================================================================= */

// --- 2.1 Hero Slider (Carousel Slides) ---
// GET /api/hero-slides
const getHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/hero-slides
const createHeroSlide = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = `/uploads/${req.files.image[0].filename}`;
    if (req.files?.bg) data.bg = `/uploads/${req.files.bg[0].filename}`;
    if (req.files?.car) data.car = `/uploads/${req.files.car[0].filename}`;
    const slide = await HeroSlide.create(data);
    res.status(201).json(slide);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/hero-slides/:id
const updateHeroSlide = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = `/uploads/${req.files.image[0].filename}`;
    if (req.files?.bg) data.bg = `/uploads/${req.files.bg[0].filename}`;
    if (req.files?.car) data.car = `/uploads/${req.files.car[0].filename}`;
    const slide = await HeroSlide.findByIdAndUpdate(req.params.id, data, { returnDocument: "after" });
    if (!slide) return res.status(404).json({ message: "Slide not found" });
    res.json(slide);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/hero-slides/:id
const deleteHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ message: "Slide not found" });
    res.json({ message: "Slide removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 2.2 About Section (Home Page Snippet) ---
// GET /api/about-section
const getAboutSection = async (req, res) => {
  try {
    const about = await AboutSection.findOne();
    res.json(about);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/about-section
const updateAboutSection = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image1) data.image1 = `/uploads/${req.files.image1[0].filename}`;
    if (req.files?.image2) data.image2 = `/uploads/${req.files.image2[0].filename}`;
    const about = await AboutSection.findOneAndUpdate({}, data, { returnDocument: "after", upsert: true });
    res.json(about);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 2.3 Offer Heading (Cab Offers Title & Badge) ---
// GET /api/offer-heading
const getOfferHeading = async (req, res) => {
  try {
    const heading = await OfferHeading.findOne();
    res.json(heading);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/offer-heading
const updateOfferHeading = async (req, res) => {
  try {
    const heading = await OfferHeading.findOneAndUpdate({}, req.body, { returnDocument: "after", upsert: true });
    res.json(heading);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 2.4 Offer Cards (Discount Cards) ---
// GET /api/offer-cards
const getOfferCards = async (req, res) => {
  try {
    const cards = await OfferCard.find().sort({ createdAt: -1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/offer-cards
const createOfferCard = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = `/uploads/${req.files.image[0].filename}`;
    const card = await OfferCard.create(data);
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/offer-cards/:id
const updateOfferCard = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = `/uploads/${req.files.image[0].filename}`;
    const card = await OfferCard.findByIdAndUpdate(req.params.id, data, { returnDocument: "after" });
    if (!card) return res.status(404).json({ message: "Card not found" });
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/offer-cards/:id
const deleteOfferCard = async (req, res) => {
  try {
    const card = await OfferCard.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });
    res.json({ message: "Card removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 2.5 Online Booking (Features & Steps) ---
// GET /api/online-booking
const getOnlineBooking = async (req, res) => {
  try {
    const data = await OnlineBooking.findOne();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/online-booking
const updateOnlineBooking = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = `/uploads/${req.files.image[0].filename}`;
    const result = await OnlineBooking.findOneAndUpdate({}, data, { returnDocument: "after", upsert: true });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 2.6 Download Section (Play Store / App Store CTA) ---
// GET /api/download-section
const getDownloadSection = async (req, res) => {
  try {
    const data = await DownloadSection.findOne();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/download-section
const updateDownloadSection = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = `/uploads/${req.files.image[0].filename}`;
    const result = await DownloadSection.findOneAndUpdate({}, data, { returnDocument: "after", upsert: true });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 2.7 Why Choose Us (Benefits Section) ---
// GET /api/why-choose-left
const getWhyChooseLeft = async (req, res) => {
  try {
    const data = await WhyChooseLeft.findOne();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/why-choose-left
const updateWhyChooseLeft = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = `/uploads/${req.files.image[0].filename}`;
    const result = await WhyChooseLeft.findOneAndUpdate({}, data, { returnDocument: "after", upsert: true });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 2.8 Registration Section (Driver/Partner Banner) ---
// GET /api/registration-section
const getRegistrationSection = async (req, res) => {
  try {
    const data = await RegistrationSection.findOne();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/registration-section
const updateRegistrationSection = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = `/uploads/${req.files.image[0].filename}`;
    const result = await RegistrationSection.findOneAndUpdate({}, data, { returnDocument: "after", upsert: true });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 2.9 Call To Action (Booking Banner Strip) ---
// GET /api/cta-section
const getCtaSection = async (req, res) => {
  try {
    const data = await CtaSection.findOne();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/cta-section
const updateCtaSection = async (req, res) => {
  try {
    const data = await CtaSection.findOneAndUpdate({}, req.body, { returnDocument: "after", upsert: true });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 2.10 Taxi CTA (Quick Taxi Booking Strip) ---
// GET /api/taxi-cta
const getTaxiCta = async (req, res) => {
  try {
    const data = await TaxiCta.findOne();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/taxi-cta
const updateTaxiCta = async (req, res) => {
  try {
    const data = await TaxiCta.findOneAndUpdate({}, req.body, { returnDocument: "after", upsert: true });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* =========================================================================
   SECTION 3: ABOUT US PAGE CMS SECTIONS
========================================================================= */

// --- 3.1 About Banner (Top Breadcrumb Banner) ---
// GET /api/about-banner
const getAboutBanner = async (req, res) => {
  try {
    const data = await AboutBanner.findOne();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/about-banner
const updateAboutBanner = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.backgroundImage) data.backgroundImage = `/uploads/${req.files.backgroundImage[0].filename}`;
    const result = await AboutBanner.findOneAndUpdate({}, data, { returnDocument: "after", upsert: true });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 3.2 About Company (Story, Mission, Vision, Stats) ---
// GET /api/about-company
const getAboutCompany = async (req, res) => {
  try {
    const data = await AboutCompany.findOne();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/about-company
const updateAboutCompany = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = `/uploads/${req.files.image[0].filename}`;
    const result = await AboutCompany.findOneAndUpdate({}, data, { returnDocument: "after", upsert: true });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* =========================================================================
   SECTION 4: SERVICES & PRICING CMS SECTIONS
========================================================================= */

// --- 4.1 Service Banner (Services Hero Banner) ---
// GET /api/service-banner
const getServiceBanner = async (req, res) => {
  try {
    const data = await ServiceBanner.findOne();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/service-banner
const updateServiceBanner = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.backgroundImage) data.backgroundImage = `/uploads/${req.files.backgroundImage[0].filename}`;
    const result = await ServiceBanner.findOneAndUpdate({}, data, { returnDocument: "after", upsert: true });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 4.2 Service Cards (In-City, Outstation, Airport, etc.) ---
// GET /api/service-cards
const getServiceCards = async (req, res) => {
  try {
    const cards = await ServiceCard.find().sort({ order: 1, createdAt: -1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/service-cards
const createServiceCard = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.bg) data.bg = `/uploads/${req.files.bg[0].filename}`;
    if (req.files?.icon) data.icon = `/uploads/${req.files.icon[0].filename}`;
    const card = await ServiceCard.create(data);
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/service-cards/:id
const updateServiceCard = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.bg) data.bg = `/uploads/${req.files.bg[0].filename}`;
    if (req.files?.icon) data.icon = `/uploads/${req.files.icon[0].filename}`;
    const card = await ServiceCard.findByIdAndUpdate(req.params.id, data, { returnDocument: "after" });
    if (!card) return res.status(404).json({ message: "Service card not found" });
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/service-cards/:id
const deleteServiceCard = async (req, res) => {
  try {
    const card = await ServiceCard.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ message: "Service card not found" });
    res.json({ message: "Service card removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 4.3 Pricing Heading (Pricing Badge & Subtitle) ---
// GET /api/pricing-heading
const getPricingHeading = async (req, res) => {
  try {
    const data = await PricingHeading.findOne();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/pricing-heading
const updatePricingHeading = async (req, res) => {
  try {
    const data = await PricingHeading.findOneAndUpdate({}, req.body, { returnDocument: "after", upsert: true });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 4.4 Pricing Cards (Vehicle Fare Package Cards) ---
// GET /api/pricing-cards
const getPricingCards = async (req, res) => {
  try {
    const cards = await PricingCard.find().sort({ order: 1, createdAt: -1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/pricing-cards
const createPricingCard = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = `/uploads/${req.files.image[0].filename}`;
    const card = await PricingCard.create(data);
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/pricing-cards/:id
const updatePricingCard = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = `/uploads/${req.files.image[0].filename}`;
    const card = await PricingCard.findByIdAndUpdate(req.params.id, data, { returnDocument: "after" });
    if (!card) return res.status(404).json({ message: "Pricing card not found" });
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/pricing-cards/:id
const deletePricingCard = async (req, res) => {
  try {
    const card = await PricingCard.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ message: "Pricing card not found" });
    res.json({ message: "Pricing card removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* =========================================================================
   SECTION 5: EVENT & FRANCHISE CMS SECTIONS
========================================================================= */

// --- 5.1 Event Guests (Chief Guests & Dignitaries) ---
// GET /api/event-guests
const getEventGuests = async (req, res) => {
  try {
    const guests = await EventGuest.find().sort({ order: 1, createdAt: -1 });
    res.json(guests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/event-guests
const createEventGuest = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = `/uploads/${req.files.image[0].filename}`;
    const guest = await EventGuest.create(data);
    res.status(201).json(guest);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/event-guests/:id
const updateEventGuest = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = `/uploads/${req.files.image[0].filename}`;
    const guest = await EventGuest.findByIdAndUpdate(req.params.id, data, { returnDocument: "after" });
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    res.json(guest);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/event-guests/:id
const deleteEventGuest = async (req, res) => {
  try {
    const guest = await EventGuest.findByIdAndDelete(req.params.id);
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    res.json({ message: "Guest removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 5.2 Franchise Banner (Hero Banner) ---
// GET /api/franchise-banner
const getFranchiseBanner = async (req, res) => {
  try {
    const data = await FranchiseBanner.findOne();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/franchise-banner
const updateFranchiseBanner = async (req, res) => {
  try {
    const data = await FranchiseBanner.findOneAndUpdate({}, req.body, { returnDocument: "after", upsert: true });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 5.3 Franchise Benefits (Partnership ROI Points) ---
// GET /api/franchise-benefits
const getFranchiseBenefits = async (req, res) => {
  try {
    const data = await FranchiseBenefits.findOne();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/franchise-benefits
const updateFranchiseBenefits = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = `/uploads/${req.files.image[0].filename}`;
    const result = await FranchiseBenefits.findOneAndUpdate({}, data, { returnDocument: "after", upsert: true });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 5.4 Franchise Applications (Form Submissions) ---
// POST /api/franchise-applications (Public)
const createFranchiseApplication = async (req, res) => {
  try {
    const application = await FranchiseApplication.create(req.body);
    res.status(201).json({ success: true, message: "Application submitted successfully", application });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/franchise-applications (Admin Only)
const getFranchiseApplications = async (req, res) => {
  try {
    const apps = await FranchiseApplication.find().sort({ createdAt: -1 });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/franchise-applications/:id (Admin Only)
const deleteFranchiseApplication = async (req, res) => {
  try {
    const app = await FranchiseApplication.findByIdAndDelete(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    res.json({ message: "Application deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* =========================================================================
   SECTION 6: CONTACT US CMS SECTIONS
========================================================================= */

// --- 6.1 Contact Map (Google Map Coordinates & Embed) ---
// GET /api/contact-map
const getContactMap = async (req, res) => {
  try {
    const data = await ContactMap.findOne();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/contact-map
const updateContactMap = async (req, res) => {
  try {
    const data = await ContactMap.findOneAndUpdate({}, req.body, { returnDocument: "after", upsert: true });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 6.2 Contact Info (Office Details & Timings) ---
// GET /api/contact-info
const getContactInfo = async (req, res) => {
  try {
    const data = await ContactInfo.findOne();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/contact-info
const updateContactInfo = async (req, res) => {
  try {
    const data = await ContactInfo.findOneAndUpdate({}, req.body, { returnDocument: "after", upsert: true });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- 6.3 Contact Messages (Inquiries Form) ---
// POST /api/contact-messages (Public)
const createContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.create(req.body);
    res.status(201).json({ success: true, message: "Message sent successfully", data: message });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/contact-messages (Admin Only)
const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/contact-messages/:id (Admin Only)
const deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  // 1. Header, Footer & Company
  getSiteHeader,
  updateSiteHeader,
  getCompanyInfo,
  updateCompanyInfo,
  getFooterTop,
  updateFooterTop,
  getFooterMiddle,
  updateFooterMiddle,
  getFooterVehicles,
  createFooterVehicle,
  updateFooterVehicle,
  deleteFooterVehicle,

  // 2. Home Page
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  getAboutSection,
  updateAboutSection,
  getOfferHeading,
  updateOfferHeading,
  getOfferCards,
  createOfferCard,
  updateOfferCard,
  deleteOfferCard,
  getOnlineBooking,
  updateOnlineBooking,
  getDownloadSection,
  updateDownloadSection,
  getWhyChooseLeft,
  updateWhyChooseLeft,
  getRegistrationSection,
  updateRegistrationSection,
  getCtaSection,
  updateCtaSection,
  getTaxiCta,
  updateTaxiCta,

  // 3. About Us Page
  getAboutBanner,
  updateAboutBanner,
  getAboutCompany,
  updateAboutCompany,

  // 4. Services & Pricing
  getServiceBanner,
  updateServiceBanner,
  getServiceCards,
  createServiceCard,
  updateServiceCard,
  deleteServiceCard,
  getPricingHeading,
  updatePricingHeading,
  getPricingCards,
  createPricingCard,
  updatePricingCard,
  deletePricingCard,

  // 5. Event & Franchise
  getEventGuests,
  createEventGuest,
  updateEventGuest,
  deleteEventGuest,
  getFranchiseBanner,
  updateFranchiseBanner,
  getFranchiseBenefits,
  updateFranchiseBenefits,
  createFranchiseApplication,
  getFranchiseApplications,
  deleteFranchiseApplication,

  // 6. Contact Us
  getContactMap,
  updateContactMap,
  getContactInfo,
  updateContactInfo,
  createContactMessage,
  getContactMessages,
  deleteContactMessage,
};
