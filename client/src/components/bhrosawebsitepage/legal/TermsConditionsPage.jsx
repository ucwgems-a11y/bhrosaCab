import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./TermsConditionsPage.css";

export default function TermsConditionsPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      if (window.pageYOffset > 250) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="policy-page-wrapper">
      {/* Header with Skyline Background */}
      <header className="policy-header">
        <div className="header-content">
          <h1>Bhrosa Cab Term &amp; Conditions / Refund Policy</h1>
          <p>Effective Date: 7 August 2025</p>
        </div>
      </header>

      {/* Sticky Navigation */}
      <div className="nav-container">
        <div className="policy-nav">
          <Link to="/" className="home-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
              style={{ marginRight: "4px" }}
            >
              <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4H2.5z" />
            </svg>
            Go to Home
          </Link>

          <button
            className="back-to-top"
            onClick={scrollToTop}
            style={{
              opacity: showBackToTop ? 1 : 0.4,
              visibility: "visible",
            }}
          >
            Back to Top
          </button>
        </div>
      </div>

      {/* Policy Content Sections */}
      <main className="policy-content">
        {/* Introduction */}
        <div className="policy-section">
          <h2>Introduction</h2>
          <p>
            This Refund Policy (&quot;Policy&quot;) sets forth the terms and conditions under which Bhrosa Cab
            (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) will process and approve refund requests from
            Customers and Drivers who use the Bhrosa Cab mobile application and related services (&quot;Platform&quot;).
          </p>
          <p>
            This Policy is to be read in conjunction with the Terms of Service and Privacy Policy of Bhrosa Cab. By using our services, you acknowledge and agree to the terms of this Policy.
          </p>
          <div className="divider"></div>
        </div>

        {/* 1. Definitions */}
        <div className="policy-section">
          <h2>1. Definitions</h2>
          <p>For the purposes of this Policy:</p>
          <ul>
            <li><strong>&quot;Customer&quot;</strong> means a registered user of the Platform who books and/or pays for a transportation service.</li>
            <li><strong>&quot;Driver&quot;</strong> means a registered user of the Platform who provides transportation services through the Bhrosa Cab app.</li>
            <li><strong>&quot;Ride&quot;</strong> means a transportation booking initiated through the Bhrosa Cab app.</li>
            <li><strong>&quot;Top-Up&quot;</strong> means a prepaid fee paid by Drivers to access unlimited ride requests for a fixed time duration.</li>
            <li><strong>&quot;Service Failure&quot;</strong> means a proven instance where the ride service was not delivered as per booking confirmation.</li>
          </ul>
          <div className="divider"></div>
        </div>

        {/* 2. General Principles */}
        <div className="policy-section">
          <h2>2. General Principles</h2>
          <ul>
            <li>Refunds will only be issued in accordance with this Policy and applicable laws of India.</li>
            <li>All refund requests are subject to verification and approval by the Company.</li>
            <li>The Company reserves the right to deny a refund request if sufficient proof or valid reason is not provided.</li>
            <li>All decisions made by the Company regarding refunds shall be final and binding.</li>
          </ul>
          <div className="divider"></div>
        </div>

        {/* 3. Refund Eligibility for Customers */}
        <div className="policy-section">
          <h2>3. Refund Eligibility for Customers</h2>
          <h3>Refundable Scenarios:</h3>
          <ul>
            <li><strong>Driver No-Show</strong> – The driver did not arrive at the pickup location and the ride was cancelled by the Customer.</li>
            <li><strong>Driver Cancellation</strong> – The assigned driver cancelled the ride without providing a valid reason.</li>
            <li><strong>Duplicate Payment</strong> – The Customer was charged more than once for the same ride.</li>
            <li><strong>Overcharging Due to System Error</strong> – The fare charged exceeded the displayed fare estimate due to a technical fault.</li>
            <li><strong>Service Not Rendered</strong> – The trip was marked as completed but was not actually provided.</li>
            <li><strong>Technical Failure</strong> – Payment was deducted from the Customer&apos;s account but booking confirmation failed due to a system error.</li>
          </ul>

          <h3>Non-Refundable Scenarios:</h3>
          <ul>
            <li>Ride cancelled by the Customer after the driver has reached the pickup location.</li>
            <li>Delays in service due to traffic, weather conditions, roadblocks, or any factor beyond the Company&apos;s control.</li>
            <li>Dissatisfaction with the driver or ride experience after the trip is completed, except in proven cases of service failure.</li>
          </ul>
          <div className="divider"></div>
        </div>

        {/* 4. Refund Eligibility for Drivers */}
        <div className="policy-section">
          <h2>4. Refund Eligibility for Drivers</h2>
          <h3>Refundable Scenarios:</h3>
          <ul>
            <li><strong>Wrong Commission Deduction</strong> – Commission charged for a ride that was cancelled or did not occur.</li>
            <li><strong>Technical Payment Errors</strong> – Payment gateway errors causing incorrect deductions.</li>
            <li><strong>Wrongful Top-Up Deduction</strong> – A Top-Up amount was deducted without activation of ride request services.</li>
          </ul>

          <h3>Top-Up Charges and Validity:</h3>
          <div className="table-responsive">
            <table className="legal-price-table">
              <thead>
                <tr>
                  <th style={{ color: "#ffffff", backgroundColor: "#111827", padding: "14px 18px" }}>Vehicle Type</th>
                  <th style={{ color: "#ffffff", backgroundColor: "#111827", padding: "14px 18px" }}>Top-Up Amount</th>
                  <th style={{ color: "#ffffff", backgroundColor: "#111827", padding: "14px 18px" }}>Validity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>Bike</td>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>₹50</td>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>12 hours</td>
                </tr>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>Auto</td>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>₹75</td>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>12 hours</td>
                </tr>
                <tr>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>Hatchback</td>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>₹100</td>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>12 hours</td>
                </tr>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>Sedan</td>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>₹125</td>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>12 hours</td>
                </tr>
                <tr>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>SUV</td>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>₹150</td>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>12 hours</td>
                </tr>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>Premium/Luxury</td>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>₹400</td>
                  <td style={{ color: "#111827", fontWeight: 600, padding: "13px 18px" }}>12 hours</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="note-box">
            <strong>Conditions:</strong>
            <ul>
              <li>Top-Up charges are non-refundable once activated, except in proven cases of technical failure or duplicate deduction.</li>
              <li>Validity is calculated from the exact time of activation and expires automatically after 12 hours.</li>
            </ul>
          </div>
          <div className="divider"></div>
        </div>

        {/* 5. Refund Process */}
        <div className="policy-section">
          <h2>5. Refund Process</h2>
          <h3>Initiating a Request</h3>
          <p>All refund requests must be submitted via official Bhrosa Cab support channels:</p>
          <ul>
            <li>📧 Email: support@bhrosacab.com</li>
            <li>📞 Phone: +919115513232</li>
            <li>🕒 Support Hours: 24×7</li>
          </ul>

          <h3>Information Required:</h3>
          <ul>
            <li>Ride ID or Transaction ID</li>
            <li>Date and time of transaction</li>
            <li>Reason for refund request</li>
            <li>Proof of payment or supporting documents (e.g., screenshots, receipts)</li>
          </ul>

          <h3>Processing Time:</h3>
          <p>Upon verification, approved refunds will be credited within 7–10 business days to the original payment method.</p>
          <div className="divider"></div>
        </div>

        {/* 6. Company's Rights */}
        <div className="policy-section">
          <h2>6. Company&apos;s Rights</h2>
          <p>The Company reserves the right to:</p>
          <ul>
            <li>Verify all claims before processing refunds.</li>
            <li>Reject any refund request deemed fraudulent, abusive, or in violation of Bhrosa Cab&apos;s Terms of Service.</li>
            <li>Make the final determination in all refund-related matters.</li>
          </ul>
          <div className="divider"></div>
        </div>

        {/* 7. Amendments to Policy */}
        <div className="policy-section">
          <h2>7. Amendments to Policy</h2>
          <ul>
            <li>This Policy may be updated from time to time without prior notice.</li>
            <li>The latest version will always be available on the Bhrosa Cab app and website.</li>
          </ul>
          <div className="divider"></div>
        </div>

        {/* 8. Governing Law & Jurisdiction */}
        <div className="policy-section">
          <h2>8. Governing Law &amp; Jurisdiction</h2>
          <ul>
            <li>This Policy shall be governed by the laws of India.</li>
            <li>Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.</li>
          </ul>
          <div className="divider"></div>
        </div>

        {/* Contact Information Box */}
        <div className="contact-info">
          <h2>Bhrosa Cab Support Team</h2>
          <p>📧 Email: <a href="mailto:hr@bhrosacab.com">hr@bhrosacab.com</a></p>
          <p>📞 Phone: <a href="tel:+919115513232">+919115513232</a></p>
          <p>🏢 Address: VIP Road, Zirakpur</p>
        </div>

        {/* Bottom Return Button */}
        <div className="bottom-cta-wrap">
          <Link to="/" className="home-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
              style={{ marginRight: "4px" }}
            >
              <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4H2.5z" />
            </svg>
            Return to Homepage
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="policy-footer">
        <p>© 2025 Bhrosa Cab. All rights reserved.</p>
      </footer>
    </div>
  );
}
