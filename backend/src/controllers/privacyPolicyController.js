const PrivacyPolicyClause = require("../models/PrivacyPolicyClause");

exports.getPrivacyPolicies = async (req, res) => {
  try {
    const list = await PrivacyPolicyClause.find().sort({ createdAt: 1 });
    const formatted = list.map((item, idx) => ({
      id: item._id,
      _id: item._id,
      srNo: idx + 1,
      title: item.title,
      description: item.description,
      status: item.status,
    }));
    return res.status(200).json({ success: true, count: formatted.length, data: formatted, list: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPrivacyPolicyById = async (req, res) => {
  try {
    const item = await PrivacyPolicyClause.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Privacy policy clause not found" });
    return res.status(200).json({ success: true, data: item, item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPrivacyPolicy = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }
    const item = await PrivacyPolicyClause.create({ title: title.trim(), description: description.trim() });
    return res.status(201).json({ success: true, message: "Privacy policy clause created successfully", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePrivacyPolicy = async (req, res) => {
  try {
    const { title, description } = req.body;
    const item = await PrivacyPolicyClause.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Privacy policy clause not found" });
    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    await item.save();
    return res.status(200).json({ success: true, message: "Privacy policy clause updated successfully", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePrivacyPolicy = async (req, res) => {
  try {
    await PrivacyPolicyClause.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Privacy policy clause deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Helper function to build 100% inline-styled, mobile-responsive HTML for Privacy Policy
// Helper function to build 100% inline-styled, mobile-responsive HTML body content for Privacy Policy
function generateResponsivePrivacyHtml(dbClauses = []) {
  const dynamicSections = (dbClauses && dbClauses.length > 0)
    ? dbClauses.map((c) => `
        <div style="background:#ffffff;border-radius:10px;padding:18px 16px;margin-bottom:14px;border-left:4px solid #29b6e8;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
          <h2 style="font-size:17px;font-weight:700;color:#1e293b;margin:0 0 8px;">${c.title}</h2>
          <p style="font-size:14px;line-height:1.65;color:#334155;margin:0;">${c.description}</p>
        </div>
      `).join("")
    : "";

  return `<div class="bhrosa-legal-container" style="padding:16px 12px;max-width:680px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;-webkit-text-size-adjust:100%;">

    <!-- Header -->
    <div style="background-color:#0f172a;padding:20px 16px;text-align:center;border-radius:10px;margin-bottom:16px;border-bottom:3px solid #29b6e8;">
      <h1 style="color:#29b6e8;font-size:20px;font-weight:800;margin:0 0 6px;letter-spacing:-0.3px;">Bhrosa Cab – Privacy Policy</h1>
      <p style="color:#cbd5e1;font-size:12px;margin:0;font-weight:500;">Effective Date: 7 August 2025</p>
    </div>

    <!-- Intro -->
    <div style="background:#ffffff;border-radius:10px;padding:18px 16px;margin-bottom:14px;border-left:4px solid #29b6e8;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <h2 style="font-size:17px;font-weight:700;color:#1e293b;margin:0 0 8px;">Introduction</h2>
      <p style="font-size:14px;line-height:1.65;color:#334155;margin:0;">
        We value your privacy and are committed to protecting your personal data in accordance with applicable laws and Google Play Console / Apple App Store guidelines.
      </p>
    </div>

    <!-- Company Info -->
    <div style="background:#ffffff;border-radius:10px;padding:18px 16px;margin-bottom:14px;border-left:4px solid #29b6e8;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <h2 style="font-size:17px;font-weight:700;color:#1e293b;margin:0 0 8px;">Company Information</h2>
      <p style="font-size:14px;line-height:1.65;color:#334155;margin:0 0 6px;">
        This app is owned and operated by <strong style="color:#0f172a;">Omninos Technology Private Limited</strong>.
      </p>
      <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0;">
        Address: Omninos Technologies International Pvt Ltd, SCO 454 to 460, TDI South X2, Sector 117, Backside Star Hospital Mohali, Punjab, India.
      </p>
    </div>

    <!-- Information Collected -->
    <div style="background:#ffffff;border-radius:10px;padding:18px 16px;margin-bottom:14px;border-left:4px solid #29b6e8;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <h2 style="font-size:17px;font-weight:700;color:#1e293b;margin:0 0 8px;">Information We Collect</h2>
      <ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
        <li style="margin-bottom:4px;">Name, contact number, and email address.</li>
        <li style="margin-bottom:4px;">Real-time GPS location data (foreground and background for driver tracking & trip safety).</li>
        <li style="margin-bottom:4px;">Payment and transaction records.</li>
        <li style="margin-bottom:0;">Driver KYC verification documents and vehicle registration images.</li>
      </ul>
    </div>

    <!-- App Permissions -->
    <div style="background:#ffffff;border-radius:10px;padding:18px 16px;margin-bottom:14px;border-left:4px solid #29b6e8;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <h2 style="font-size:17px;font-weight:700;color:#1e293b;margin:0 0 8px;">Device Permissions</h2>
      <ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
        <li style="margin-bottom:4px;"><strong style="color:#0f172a;">Location:</strong> Ride navigation, driver matching, and safety tracking.</li>
        <li style="margin-bottom:4px;"><strong style="color:#0f172a;">Camera / Media:</strong> KYC documentation and vehicle photo uploads.</li>
        <li style="margin-bottom:0;"><strong style="color:#0f172a;">Notifications:</strong> Ride updates, OTPs, and alerts via Firebase Cloud Messaging.</li>
      </ul>
    </div>

    <!-- Account Deletion & Rights -->
    <div style="background:#ffffff;border-radius:10px;padding:18px 16px;margin-bottom:14px;border-left:4px solid #29b6e8;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <h2 style="font-size:17px;font-weight:700;color:#1e293b;margin:0 0 8px;">Data Retention &amp; Account Deletion</h2>
      <p style="font-size:14px;line-height:1.65;color:#334155;margin:0 0 8px;">
        Users and Drivers can delete their account directly within the app settings or by writing to <a href="mailto:support@bhrosacab.com" style="color:#2563eb;text-decoration:none;font-weight:600;">support@bhrosacab.com</a>.
      </p>
      <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0;">
        Account deletion requests are processed in full compliance with GDPR and Google Play Store policies.
      </p>
    </div>

    <!-- Dynamic DB Clauses if any -->
    ${dynamicSections}

    <!-- Support Box -->
    <div style="background:#0f172a;color:#ffffff;border-radius:10px;padding:18px 16px;margin-top:20px;text-align:center;">
      <h2 style="color:#29b6e8;font-size:16px;font-weight:700;margin:0 0 8px;">Bhrosa Cab Support Team</h2>
      <p style="font-size:13px;color:#cbd5e1;margin:0 0 4px;">📧 Email: <a href="mailto:support@bhrosacab.com" style="color:#29b6e8;text-decoration:none;font-weight:600;">support@bhrosacab.com</a></p>
      <p style="font-size:13px;color:#cbd5e1;margin:0;">📞 Phone: <a href="tel:+919115513232" style="color:#29b6e8;text-decoration:none;font-weight:600;">+919115513232</a></p>
    </div>

  </div>`;
}

/**
 * Mobile App Privacy Policy Endpoint
 * Equivalent to PHP: Route::any('get-privacy-policy', 'fourteen')
 */
exports.getPrivacyPolicyMobile = async (req, res) => {
  try {
    const data = await PrivacyPolicyClause.find().sort({ createdAt: 1 });
    const html = generateResponsivePrivacyHtml(data);

    // Support both direct HTML view via browser/webview and JSON format for mobile SDKs
    const acceptsHtml = req.headers.accept && req.headers.accept.includes("text/html");
    if (req.query.format === "html" || (acceptsHtml && !req.query.format)) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(html);
    }

    return res.status(200).json({
      success: true,
      message: "Data Retrieved Successfully",
      html: html,
      details: data || [],
    });
  } catch (ex) {
    return res.status(500).json({
      success: false,
      message: "Error",
      details: ex.message,
    });
  }
};


