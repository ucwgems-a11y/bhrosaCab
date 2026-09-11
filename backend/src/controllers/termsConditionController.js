const TermsConditionClause = require("../models/TermsConditionClause");

exports.getTermsConditions = async (req, res) => {
  try {
    const list = await TermsConditionClause.find().sort({ createdAt: 1 });
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

exports.getTermsConditionById = async (req, res) => {
  try {
    const item = await TermsConditionClause.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Terms & Conditions clause not found" });
    return res.status(200).json({ success: true, data: item, item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTermsCondition = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }
    const item = await TermsConditionClause.create({ title: title.trim(), description: description.trim() });
    return res.status(201).json({ success: true, message: "Terms & Conditions clause created successfully", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTermsCondition = async (req, res) => {
  try {
    const { title, description } = req.body;
    const item = await TermsConditionClause.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Terms & Conditions clause not found" });
    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    await item.save();
    return res.status(200).json({ success: true, message: "Terms & Conditions clause updated successfully", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTermsCondition = async (req, res) => {
  try {
    await TermsConditionClause.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Terms & Conditions clause deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Helper function to build 100% inline-styled, mobile-responsive HTML for Terms & Refund Policy
// Helper function to build 100% inline-styled, mobile-responsive HTML body content for Terms & Refund Policy
function generateResponsiveTermsHtml(dbClauses = []) {
  const dynamicSections = (dbClauses && dbClauses.length > 0)
    ? dbClauses.map((c) => `
        <div style="background:#ffffff;border-radius:10px;padding:18px 16px;margin-bottom:14px;border-left:4px solid #f6c000;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
          <h2 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px;">${c.title}</h2>
          <p style="font-size:14px;line-height:1.65;color:#374151;margin:0;">${c.description}</p>
        </div>
      `).join("")
    : "";

  return `<div class="bhrosa-legal-container" style="padding:16px 12px;max-width:680px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-text-size-adjust:100%;">

    <!-- Mobile Header -->
    <div style="background-color:#111827;padding:20px 16px;text-align:center;border-radius:10px;margin-bottom:16px;border-bottom:3px solid #f6c000;">
      <h1 style="color:#f6c000;font-size:20px;font-weight:800;margin:0 0 6px;letter-spacing:-0.3px;">Bhrosa Cab Term &amp; Conditions / Refund Policy</h1>
      <p style="color:#e2e8f0;font-size:12px;margin:0;font-weight:500;">Effective Date: 7 August 2025</p>
    </div>

    <!-- Introduction -->
    <div style="background:#ffffff;border-radius:10px;padding:18px 16px;margin-bottom:14px;border-left:4px solid #f6c000;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <h2 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 10px;">Introduction</h2>
      <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 10px;">
        This Refund Policy (&quot;Policy&quot;) sets forth the terms and conditions under which Bhrosa Cab (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) will process and approve refund requests from Customers and Drivers who use the Bhrosa Cab mobile application and related services (&quot;Platform&quot;).
      </p>
      <p style="font-size:14px;line-height:1.65;color:#374151;margin:0;">
        This Policy is to be read in conjunction with the Terms of Service and Privacy Policy of Bhrosa Cab. By using our services, you acknowledge and agree to the terms of this Policy.
      </p>
    </div>

    <!-- 1. Definitions -->
    <div style="background:#ffffff;border-radius:10px;padding:18px 16px;margin-bottom:14px;border-left:4px solid #f6c000;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <h2 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 10px;">1. Definitions</h2>
      <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.7;">
        <li style="margin-bottom:6px;"><strong style="color:#111827;">&quot;Customer&quot;</strong>: A registered user booking or paying for transportation.</li>
        <li style="margin-bottom:6px;"><strong style="color:#111827;">&quot;Driver&quot;</strong>: A registered partner providing transport via Bhrosa Cab.</li>
        <li style="margin-bottom:6px;"><strong style="color:#111827;">&quot;Ride&quot;</strong>: A booking initiated through the Bhrosa Cab app.</li>
        <li style="margin-bottom:6px;"><strong style="color:#111827;">&quot;Top-Up&quot;</strong>: Prepaid fee paid by Drivers for unlimited ride access.</li>
        <li style="margin-bottom:0;"><strong style="color:#111827;">&quot;Service Failure&quot;</strong>: Proven instance where ride was not delivered as confirmed.</li>
      </ul>
    </div>

    <!-- 2. General Principles -->
    <div style="background:#ffffff;border-radius:10px;padding:18px 16px;margin-bottom:14px;border-left:4px solid #f6c000;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <h2 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 10px;">2. General Principles</h2>
      <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.7;">
        <li style="margin-bottom:6px;">Refunds will only be issued in accordance with this Policy and Indian law.</li>
        <li style="margin-bottom:6px;">All refund requests are subject to verification and company approval.</li>
        <li style="margin-bottom:6px;">The Company reserves the right to deny requests lacking sufficient proof.</li>
        <li style="margin-bottom:0;">All company decisions regarding refunds shall be final and binding.</li>
      </ul>
    </div>

    <!-- 3. Refund Eligibility for Customers -->
    <div style="background:#ffffff;border-radius:10px;padding:18px 16px;margin-bottom:14px;border-left:4px solid #f6c000;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <h2 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px;">3. Refund Eligibility for Customers</h2>
      <h3 style="font-size:15px;font-weight:700;color:#1f2937;margin:12px 0 6px;">Refundable Scenarios:</h3>
      <ul style="margin:0 0 12px;padding-left:18px;color:#374151;font-size:14px;line-height:1.7;">
        <li style="margin-bottom:4px;"><strong style="color:#111827;">Driver No-Show</strong>: Driver did not arrive and rider cancelled.</li>
        <li style="margin-bottom:4px;"><strong style="color:#111827;">Driver Cancellation</strong>: Driver cancelled without valid reason.</li>
        <li style="margin-bottom:4px;"><strong style="color:#111827;">Duplicate Payment</strong>: Charged multiple times for same trip.</li>
        <li style="margin-bottom:4px;"><strong style="color:#111827;">System Overcharging</strong>: Fares exceeded estimate due to technical bug.</li>
        <li style="margin-bottom:0;"><strong style="color:#111827;">Technical Failure</strong>: Amount deducted but booking not confirmed.</li>
      </ul>
      <h3 style="font-size:15px;font-weight:700;color:#1f2937;margin:12px 0 6px;">Non-Refundable Scenarios:</h3>
      <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.7;">
        <li style="margin-bottom:4px;">Cancellation after driver arrives at pickup.</li>
        <li style="margin-bottom:4px;">Traffic or weather delays outside company control.</li>
        <li style="margin-bottom:0;">Completed trips without proven service failure.</li>
      </ul>
    </div>

    <!-- 4. Refund Eligibility for Drivers & Top-Up Pricing -->
    <div style="background:#ffffff;border-radius:10px;padding:18px 16px;margin-bottom:14px;border-left:4px solid #f6c000;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <h2 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px;">4. Driver Eligibility &amp; Top-Up Charges</h2>
      <p style="font-size:14px;line-height:1.6;color:#374151;margin:0 0 10px;">
        Wrong commission deductions or technical errors are refundable within 48 hours.
      </p>
      
      <!-- Responsive Table Container -->
      <div style="width:100%;overflow-x:auto;margin:12px 0;border-radius:8px;border:1px solid #e5e7eb;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;background:#ffffff;">
          <thead>
            <tr style="background:#111827;color:#ffffff;">
              <th style="padding:10px 12px;font-weight:700;border:none;">Vehicle Type</th>
              <th style="padding:10px 12px;font-weight:700;border:none;">Amount</th>
              <th style="padding:10px 12px;font-weight:700;border:none;">Validity</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:10px 12px;color:#111827;font-weight:600;">Bike</td>
              <td style="padding:10px 12px;color:#111827;font-weight:600;">₹50</td>
              <td style="padding:10px 12px;color:#111827;font-weight:600;">12 hours</td>
            </tr>
            <tr style="background:#f8fafc;border-bottom:1px solid #e5e7eb;">
              <td style="padding:10px 12px;color:#111827;font-weight:600;">Auto</td>
              <td style="padding:10px 12px;color:#111827;font-weight:600;">₹75</td>
              <td style="padding:10px 12px;color:#111827;font-weight:600;">12 hours</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:10px 12px;color:#111827;font-weight:600;">Hatchback</td>
              <td style="padding:10px 12px;color:#111827;font-weight:600;">₹100</td>
              <td style="padding:10px 12px;color:#111827;font-weight:600;">12 hours</td>
            </tr>
            <tr style="background:#f8fafc;border-bottom:1px solid #e5e7eb;">
              <td style="padding:10px 12px;color:#111827;font-weight:600;">Sedan</td>
              <td style="padding:10px 12px;color:#111827;font-weight:600;">₹125</td>
              <td style="padding:10px 12px;color:#111827;font-weight:600;">12 hours</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:10px 12px;color:#111827;font-weight:600;">SUV</td>
              <td style="padding:10px 12px;color:#111827;font-weight:600;">₹150</td>
              <td style="padding:10px 12px;color:#111827;font-weight:600;">12 hours</td>
            </tr>
            <tr style="background:#f8fafc;">
              <td style="padding:10px 12px;color:#111827;font-weight:600;">Premium/Luxury</td>
              <td style="padding:10px 12px;color:#111827;font-weight:600;">₹400</td>
              <td style="padding:10px 12px;color:#111827;font-weight:600;">12 hours</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="background:#fffbeb;border-left:3px solid #f59e0b;padding:10px 12px;border-radius:6px;margin-top:10px;">
        <strong style="color:#92400e;font-size:13px;display:block;margin-bottom:4px;">Conditions:</strong>
        <p style="color:#78350f;font-size:12px;line-height:1.5;margin:0;">
          Top-Up fees are non-refundable once activated. Validity starts at activation and expires automatically after 12 hours.
        </p>
      </div>
    </div>

    <!-- 5. Refund Process -->
    <div style="background:#ffffff;border-radius:10px;padding:18px 16px;margin-bottom:14px;border-left:4px solid #f6c000;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <h2 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px;">5. Refund Process &amp; Timeline</h2>
      <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 10px;">
        Submit requests with Ride ID, Transaction ID, and proof of payment. Approved refunds are credited to original payment method within <strong style="color:#111827;">7–10 business days</strong>.
      </p>
    </div>

    <!-- Dynamic DB Clauses if any -->
    ${dynamicSections}

    <!-- Support Box -->
    <div style="background:#111827;color:#ffffff;border-radius:10px;padding:18px 16px;margin-top:20px;text-align:center;">
      <h2 style="color:#f6c000;font-size:16px;font-weight:700;margin:0 0 8px;">Bhrosa Cab Support Team</h2>
      <p style="font-size:13px;color:#e2e8f0;margin:0 0 4px;">📧 Email: <a href="mailto:support@bhrosacab.com" style="color:#f6c000;text-decoration:none;font-weight:600;">support@bhrosacab.com</a></p>
      <p style="font-size:13px;color:#e2e8f0;margin:0;">📞 Phone: <a href="tel:+919115513232" style="color:#f6c000;text-decoration:none;font-weight:600;">+919115513232</a></p>
    </div>

  </div>`;
}

// @desc    Get Terms & Conditions for Mobile App (PHP: ApiController::twentytwo)
// @route   GET /api/get-terms-conditions
exports.getTermsConditionsMobile = async (req, res) => {
  try {
    const data = await TermsConditionClause.find().sort({ createdAt: 1 });
    const html = generateResponsiveTermsHtml(data);

    // Support both direct HTML view via browser/webview and JSON format for mobile SDKs
    const acceptsHtml = req.headers.accept && req.headers.accept.includes("text/html");
    if (req.query.format === "html" || (acceptsHtml && !req.query.format)) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(html);
    }

    return res.status(200).json({
      success: true,
      message: "Bhrosa Cab Term & Conditions / Refund Policy",
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

