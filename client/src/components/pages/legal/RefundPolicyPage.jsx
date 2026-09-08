import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./legalPages.css";

export default function RefundPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="legal-page-wrapper">
      <div className="legal-page-container">
        <button className="legal-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1>Bhrosa Cab – Refund Policy</h1>
        <p className="legal-effective-date"><strong>Effective Date:</strong> 7 August 2025</p>

        <div className="legal-section">
          <h2>1. Overview</h2>
          <p>This Refund Policy explains how refunds are handled for rides booked through the Bhrosa Cab app.</p>
        </div>

        <div className="legal-section">
          <h2>2. Refund Eligibility</h2>
          <ul>
            <li>Ride cancelled by driver</li>
            <li>Ride not completed</li>
            <li>Incorrect fare charged</li>
            <li>Technical payment failure</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>3. Non-Refundable Cases</h2>
          <ul>
            <li>User cancels ride after driver assignment</li>
            <li>No-show by user</li>
            <li>Valid ride completed successfully</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>4. Cancellation Charges</h2>
          <p>Cancellation charges may apply depending on timing and distance.</p>
        </div>

        <div className="legal-section">
          <h2>5. Refund Process</h2>
          <ul>
            <li>Refunds are processed to original payment method</li>
            <li>Processing time: 5–7 business days</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>6. Payment Gateway</h2>
          <p>All payments are processed via Razorpay or other secure gateways.</p>
          <p>Refund timelines may vary depending on bank/payment provider.</p>
        </div>

        <div className="legal-section">
          <h2>7. Dispute Resolution</h2>
          <p>If you face any issues, contact support within 48 hours of the ride.</p>
        </div>

        <div className="legal-section">
          <h2>8. Changes to Policy</h2>
          <p>We may update this policy anytime.</p>
        </div>

        <div className="legal-contact-box">
          <h2>9. Contact Us</h2>
          <p>Email: support@bhrosacab.com</p>
          <p>Phone: +91 7039000097</p>
        </div>
      </div>
    </div>
  );
}