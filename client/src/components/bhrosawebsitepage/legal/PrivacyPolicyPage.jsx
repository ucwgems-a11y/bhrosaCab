import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./legalPages.css";

// Static legal page — content is fixed by the company and not meant to be
// admin-editable, so no API call here (unlike other Settings pages).
export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="legal-page-wrapper">
      <div className="legal-page-container">
        <button className="legal-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1>Bhrosa Cab – Privacy Policy</h1>
        <p className="legal-effective-date"><strong>Effective Date:</strong> 7 August 2025</p>
        <p className="legal-intro-text">
          We value your privacy and are committed to protecting your personal data.
        </p>

        <div className="legal-section">
          <h2>App Scope</h2>
          <p>
            Currently, this application is designed for driver onboarding and management.
            Customer (rider) features will be introduced in future updates.
          </p>
        </div>

        <div className="legal-section">
          <h2>Company Information</h2>
          <p>This app is owned by <strong>Omninos Technology Private Limited</strong>.</p>
          <p>
            Address: Omninos Technologies International Pvt Ltd SCO 454 to 460, TDI South X2,
            Sector 117, Backside Star Hospital Mohali
          </p>
        </div>

        <div className="legal-section">
          <h2>Information We Collect</h2>
          <ul>
            <li>Name, phone number, and email address</li>
            <li>Location data (real-time and background)</li>
            <li>Payment information</li>
            <li>Ride and activity history</li>
            <li>Driver documents and vehicle details</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>How We Use Data</h2>
          <ul>
            <li>Provide and manage ride services</li>
            <li>Process payments securely</li>
            <li>Improve app performance and features</li>
            <li>Provide customer support</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>App Permissions</h2>
          <ul>
            <li><strong>Location:</strong> Used for ride tracking and navigation (foreground and background)</li>
            <li><strong>Camera:</strong> To upload driver documents</li>
            <li><strong>Storage:</strong> To save and access images</li>
            <li><strong>Contacts:</strong> Used only for referral features (optional)</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>Location Access</h2>
          <p>
            We collect location data even when the app is closed or not in use to enable
            real-time driver tracking, safety features, and ride functionality.
          </p>
          <ul>
            <li>Drivers: real-time and background tracking</li>
            <li>Customers: pickup, drop, and route optimization</li>
            <li>Used via Mappls and Google services</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>Third-Party Services</h2>
          <ul>
            <li>Mappls (MapmyIndia) – maps and navigation</li>
            <li>Google Services – APIs and ML Kit</li>
            <li>Firebase – notifications and analytics</li>
            <li>Razorpay – secure payment processing</li>
          </ul>
          <p>
            <a href="https://www.mappls.com/privacy-policy" target="_blank" rel="noreferrer">Mappls Policy</a><br />
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google Policy</a><br />
            <a href="https://razorpay.com/privacy/" target="_blank" rel="noreferrer">Razorpay Policy</a>
          </p>
        </div>

        <div className="legal-section">
          <h2>Data Sharing</h2>
          <p>
            We do not sell your personal data. However, we may share data with trusted
            third-party services such as payment providers, mapping services, and cloud
            services strictly for app functionality and service delivery.
          </p>
        </div>

        <div className="legal-section">
          <h2>Security</h2>
          <ul>
            <li>Data encryption and secure transmission</li>
            <li>Secure servers and access control</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>Your Rights</h2>
          <ul>
            <li>Access and update your personal data</li>
            <li>Request account deletion</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>Data Retention &amp; Deletion</h2>
          <p>
            You can request account deletion by contacting us at support@bhrosacab.com.
            Your data will be permanently deleted within 7 days of request.
          </p>
        </div>

        <div className="legal-section">
          <h2>Children Policy</h2>
          <p>This app is not intended for children under the age of 13.</p>
        </div>

        <div className="legal-section">
          <h2>User Consent</h2>
          <p>By using this app, you agree to this privacy policy.</p>
        </div>

        <div className="legal-contact-box">
          <h2>Contact</h2>
          <p>Email: support@bhrosacab.com</p>
          <p>Phone: +91 7039000097</p>
        </div>
      </div>
    </div>
  );
}