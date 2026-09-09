import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import adminFavicon from "../assets/img/title/favbhrosa.png";

/* =========================================================
   1. CORE CONTEXTS & AUTH GUARDS
========================================================= */
import { AuthProvider } from "../context/AuthContext";
import { CrmAuthProvider } from "../context/CrmAuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import ProtectedRoute from "../components/ProtectedRoute";
import CrmProtectedRoute from "../components/CrmProtectedRoute";
import CrmLogin from "../components/crmpage/CrmLogin";
import CrmLayout from "../components/crmpage/CrmLayout";
import CrmDashboard from "../components/crmpage/CrmDashboard";
import CrmUserList from "../components/crmpage/CrmUserList";
import CrmUserDetail from "../components/crmpage/CrmUserDetail";
import CrmUserLocation from "../components/crmpage/CrmUserLocation";
import CrmUnverifiedUserList from "../components/crmpage/CrmUnverifiedUserList";
import CrmManageDrivers from "../components/crmpage/CrmManageDrivers";
import CrmDriverProfile from "../components/crmpage/CrmDriverProfile";
import CrmDriverLocation from "../components/crmpage/CrmDriverLocation";
import CrmEditDriver from "../components/crmpage/CrmEditDriver";
import CrmDriverReferralList from "../components/crmpage/CrmDriverReferralList";
import CrmDriverReferralCommission from "../components/crmpage/CrmDriverReferralCommission";
import CrmOngoingRides from "../components/crmpage/CrmOngoingRides";
import CrmCompletedRides from "../components/crmpage/CrmCompletedRides";
import CrmCancelledRides from "../components/crmpage/CrmCancelledRides";
import CrmBankDetails from "../components/crmpage/CrmBankDetails";
import CrmEditBankDetails from "../components/crmpage/CrmEditBankDetails";
import CrmWithdrawal from "../components/crmpage/CrmWithdrawal";
import CrmWithdrawalList from "../components/crmpage/CrmWithdrawalList";
import CrmProfile from "../components/crmpage/CrmProfile";
import CrmChangePassword from "../components/crmpage/CrmChangePassword";

/* =========================================================
   2. PUBLIC WEBSITE & LEGAL PAGES IMPORTS
========================================================= */
import MainLayout from "../components/bhrosawebsite/layout/MainLayout/MainLayout";
import Home from "../components/bhrosawebsitepage/Home";
import About from "../components/bhrosawebsitepage/About";
import Services from "../components/bhrosawebsitepage/Services";
import Contact from "../components/bhrosawebsitepage/Contact";
import Event from "../components/bhrosawebsitepage/Event";
import Franchise from "../components/bhrosawebsitepage/Franchise";
import PrivacyPolicyPage from "../components/bhrosawebsitepage/legal/PrivacyPolicyPage";
import RefundPolicyPage from "../components/bhrosawebsitepage/legal/RefundPolicyPage"; 

/* =========================================================
   3. ADMIN AUTH & DASHBOARD CORE IMPORTS
========================================================= */
import AdminLayout from "../components/admin/layout/AdminLayout/AdminLayout";
import AdminLogin from "../components/adminpage/Login";
// import AdminRegister from "../components/adminpage/Register"; // Disabled in production
import AdminDashboard from "../components/adminpage/Dashboard";
import AdminProfile from "../components/adminpage/Profile";
import ChangePassword from "../components/adminpage/ChangePassword";

/* =========================================================
   4. USERS & CAMPAIGNS MODULE IMPORTS
========================================================= */
import AdminUserList from "../components/adminpage/Users/UserList";
import AdminCampaignList from "../components/adminpage/Users/CampaignList";
import AdminUserDetail from "../components/adminpage/Users/UserDetail";
import AdminUserLocation from "../components/adminpage/Users/UserLocation";
import AdminUnverifiedUserList from "../components/adminpage/Users/UnverifiedUserList";
import AdminMediaSourceUsers from "../components/adminpage/Users/MediaSourceUsers";

/* =========================================================
   5. DRIVERS MODULE IMPORTS
========================================================= */
import AdminManageDrivers from "../components/adminpage/Drivers/ManageDriversPage";
import AdminDriverVerification from "../components/adminpage/Drivers/DriverVerificationPage";
import AdminReuploadDocuments from "../components/adminpage/Drivers/ReuploadDocuments";
import AdminDriverWallet from "../components/adminpage/Drivers/DriverWalletPage";
import AdminDriverRides from "../components/adminpage/Drivers/DriverRides";
import AdminDriverWalletHistory from "../components/adminpage/Drivers/DriverWalletHistory";
import AdminActiveDriversStateWise from "../components/adminpage/Drivers/ActiveDriversStateWise";
import AdminDriverProfile from "../components/adminpage/Drivers/DriverProfile";
import AdminEditDriver from "../components/adminpage/Drivers/EditDriver";
import AdminDriverReferralList from "../components/adminpage/Drivers/DriverReferralList";
import AdminDriverReferralCommission from "../components/adminpage/Drivers/DriverReferralCommission";
import AdminActiveDriversStateCount from "../components/adminpage/Drivers/ActiveDriversStateCountPage";
import AdminActiveDriversByState from "../components/adminpage/Drivers/ActiveDriversByState";
import AdminDriverLocation from "../components/adminpage/Drivers/DriverLocation";

/* =========================================================
   6. RIDES MODULE IMPORTS
========================================================= */
import AdminBookedRides from "../components/adminpage/Rides/BookedRides";
import AdminArrivedRides from "../components/adminpage/Rides/ArrivedRides";
import AdminOngoingRides from "../components/adminpage/Rides/OngoingRides";
import AdminCompletedRides from "../components/adminpage/Rides/CompletedRides";
import AdminCancelledRides from "../components/adminpage/Rides/CancelledRides";

/* =========================================================
   7. CARS & PRICING MODULE IMPORTS
========================================================= */
import AdminManageCarsType from "../components/adminpage/Cars/ManageCarsType";
import AdminEditCarsType from "../components/adminpage/Cars/EditCarsType";
import AdminManageCarsFare from "../components/adminpage/Cars/ManageCarsFare";
import AdminEditCarsFare from "../components/adminpage/Cars/EditCarsFare";
import AdminDriverTopup from "../components/adminpage/Cars/DriverTopup";
import AdminEditDriverTopup from "../components/adminpage/Cars/EditDriverTopup";
import AdminAutoPrice from "../components/adminpage/Cars/AutoPrice";
import AdminManagePrice from "../components/adminpage/Price/ManagePrice";
import AdminManagePriceEdit from "../components/adminpage/Price/ManagePriceEdit";

/* =========================================================
   8. FEEDBACK & PROMO & ICONS MODULE IMPORTS
========================================================= */
import AdminAddFeedback from "../components/adminpage/Feedback/AddFeedback";
import AdminManageFeedback from "../components/adminpage/Feedback/ManageFeedback";
import AdminEditFeedback from "../components/adminpage/Feedback/EditFeedback";
import AdminPromoAdd from "../components/adminpage/Promo/PromoAdd";
import AdminPromoManage from "../components/adminpage/Promo/PromoManage";
import AdminPromoEdit from "../components/adminpage/Promo/PromoEdit";
import AdminAddIcon from "../components/adminpage/Icons/AddIcon";
import AdminEditIcon from "../components/adminpage/Icons/EditIcon";

/* =========================================================
   9. TIP, CANCEL REASON, FAQ, BANK & NOTIFICATIONS IMPORTS
========================================================= */
import AdminManageTip from "../components/adminpage/Tip/ManageTip";
import AdminEditTip from "../components/adminpage/Tip/EditTip";
import AdminManageCancelReason from "../components/adminpage/CancelReason/ManageCancelReason";
import AdminEditCancelReason from "../components/adminpage/CancelReason/EditCancelReason";
import AdminManageFaq from "../components/adminpage/Faq/ManageFaq";
import AdminEditFaq from "../components/adminpage/Faq/EditFaq";
import AdminAddBank from "../components/adminpage/Bank/AddBank";
import AdminEditBank from "../components/adminpage/Bank/EditBank";
import AdminSendNotification from "../components/adminpage/Notification/SendNotification";

/* =========================================================
   10. SETTINGS & CMS MODULE IMPORTS
========================================================= */
import AdminCompanyInfo from "../components/adminpage/Settings/CompanyInfo";
import AdminSiteHeader from "../components/admin/settings/SiteHeaderEditor/SiteHeaderEditor";
import AdminSettingsWebsite from "../components/adminpage/Settings/Website";
import AdminSettingsWebsitePage from "../components/adminpage/Settings/WebsitePage";
import AdminSectionEditor from "../components/admin/settings/SectionEditor/SectionEditor";
import AdminContactUs from "../components/adminpage/Settings/ContactUs";  
import AdminEditContactUs from "../components/adminpage/Settings/EditContactUs";
import AdminManageEmergency from "../components/adminpage/Settings/ManageEmergency";
import AdminEditEmergency from "../components/adminpage/Settings/EditEmergency";
import AdminPrivacyPolicy from "../components/adminpage/Settings/PrivacyPolicy";
import AdminEditPrivacyPolicy from "../components/adminpage/Settings/EditPrivacyPolicy";
import AdminTermsConditions from "../components/adminpage/Settings/TermsConditions";
import AdminEditTermsConditions from "../components/adminpage/Settings/EditTermsConditions";
import AdminAboutUs from "../components/adminpage/Settings/AboutUs";
import AdminEditAboutUs from "../components/adminpage/Settings/EditAboutUs";
import AdminAppBanner from "../components/adminpage/Settings/AppBanner";
import AdminEditAppBanner from "../components/adminpage/Settings/EditAppBanner";

/* =========================================================
   11. SUB-ADMIN & FINANCIAL RECHARGE MODULE IMPORTS
========================================================= */
import AdminAddSubAdmin from "../components/adminpage/SubAdmin/AddSubAdmin";
import AdminSeeSubAdmin from "../components/adminpage/SubAdmin/SeeSubAdmin";
import AdminSubAdminTransactions from "../components/adminpage/SubAdmin/SubAdminTransactions";
import AdminEditSubAdmin from "../components/adminpage/SubAdmin/EditSubAdmin";
import AdminSubAdminDrivers from "../components/adminpage/SubAdmin/SubAdminDrivers";
import AdminRechargeHistory from "../components/adminpage/RechargeHistory";
import AdminTopupWallet from "../components/adminpage/TopupWallet";

function DynamicTitleAndFavicon() {
  const location = useLocation();

  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    }

    if (location.pathname.startsWith("/admin")) {
      document.title = "Bhrosa Cab : Taxi Admin Pannel";
      link.href = adminFavicon;
    } else if (location.pathname.startsWith("/crm") || location.pathname.startsWith("/CRM")) {
      document.title = "Bhrosa Cab : CRM Portal";
      link.href = adminFavicon;
    } else {
      document.title = "Home || Bhrosa cab";
      link.href = "/title.png";
    }
  }, [location.pathname]);

  return null;
}

function AppRoutes() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CrmAuthProvider>
          <BrowserRouter>
            <DynamicTitleAndFavicon />
            <Routes>

              {/* =========================================================
                 SECTION 1: PUBLIC WEBSITE USER-FACING ROUTES
              ========================================================= */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/event" element={<Event />} />
                <Route path="/franchise" element={<Franchise />} />
              </Route>

              {/* Public Legal Policies */}
              <Route path="/policy" element={<PrivacyPolicyPage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />

              {/* =========================================================
                 SECTION 2: ADMIN & CRM AUTHENTICATION
              ========================================================= */}
              <Route path="/admin/login" element={<AdminLogin />} />
              {/* <Route path="/admin/register" element={<AdminRegister />} /> Disabled in production */}
              <Route path="/crm-login" element={<CrmLogin />} />
              <Route path="/CRM_login" element={<CrmLogin />} />

            {/* =========================================================
               SECTION 3: ADMIN SECURED PANEL ROUTES (PROTECTED)
            ========================================================= */}
            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
               }
             >

              {/* ----- 3.1 Admin Dashboard & Account Management ----- */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/change-password" element={<ChangePassword />} />

              {/* ----- 3.2 Users Management & Marketing Campaigns ----- */}
              <Route path="/admin/users/list" element={<AdminUserList />} />
              <Route path="/admin/users/:id" element={<AdminUserDetail />} />
              <Route path="/admin/users/:id/location" element={<AdminUserLocation />} />
              <Route path="/admin/users/unverified" element={<AdminUnverifiedUserList />} />
              <Route path="/admin/users/campaigns" element={<AdminCampaignList />} />
              <Route path="/admin/campaigns/media-source/:source" element={<AdminMediaSourceUsers />} />

              {/* ----- 3.3 Drivers Management & KYC Verification ----- */}
              <Route path="/admin/drivers/manage" element={<AdminManageDrivers />} />
              <Route path="/admin/drivers/verification" element={<AdminDriverVerification />} />
              <Route path="/admin/drivers/reupload/:id" element={<AdminReuploadDocuments />} />
              <Route path="/admin/drivers/wallet" element={<AdminDriverWallet />} />
              <Route path="/admin/drivers/:id/rides" element={<AdminDriverRides />} />
              <Route path="/admin/drivers/:id/wallet-history" element={<AdminDriverWalletHistory />} />
              <Route path="/admin/drivers/active" element={<AdminActiveDriversStateWise />} />
              <Route path="/admin/drivers/profile/:id" element={<AdminDriverProfile />} />
              <Route path="/admin/driver/profile/:id" element={<AdminDriverProfile />} />
              <Route path="/admin/drivers/:id/location" element={<AdminDriverLocation />} />
              <Route path="/admin/drivers/:id/edit" element={<AdminEditDriver />} />
              <Route path="/admin/drivers/:id/referrals" element={<AdminDriverReferralList />} />
              <Route path="/admin/drivers/:id/referral-commission" element={<AdminDriverReferralCommission />} />
              <Route path="/admin/drivers/active-state-count" element={<AdminActiveDriversStateCount />} />
              <Route path="/admin/drivers/active-state-count/:state" element={<AdminActiveDriversByState />} />

              {/* ----- 3.4 Rides Tracking & Status Reports ----- */}
              <Route path="/admin/rides/booked" element={<AdminBookedRides />} />
              <Route path="/admin/rides/arrived" element={<AdminArrivedRides />} />
              <Route path="/admin/rides/ongoing" element={<AdminOngoingRides />} />
              <Route path="/admin/rides/completed" element={<AdminCompletedRides />} />
              <Route path="/admin/rides/cancelled" element={<AdminCancelledRides />} />

              {/* ----- 3.5 Cars, Vehicle Types, Fare & Topup ----- */}
              <Route path="/admin/cars/type" element={<AdminManageCarsType />} />
              <Route path="/admin/cars/type/edit/:id" element={<AdminEditCarsType />} />
              <Route path="/admin/cars/fare" element={<AdminManageCarsFare />} />
              <Route path="/admin/cars/fare/edit/:id" element={<AdminEditCarsFare />} />
              <Route path="/admin/cars/topup" element={<AdminDriverTopup />} />
              <Route path="/admin/cars/topup/edit/:id" element={<AdminEditDriverTopup />} />
              <Route path="/admin/cars/auto-price" element={<AdminAutoPrice />} />

              {/* ----- 3.6 Distance & Slot Time Pricing ----- */}
              <Route path="/admin/price/manage" element={<AdminManagePrice />} />
              <Route path="/admin/price/edit/:id" element={<AdminManagePriceEdit />} />

              {/* ----- 3.7 Feedback & User Mood Emojis ----- */}
              <Route path="/admin/feedback/add" element={<AdminAddFeedback />} />
              <Route path="/admin/feedback/manage" element={<AdminManageFeedback />} />
              <Route path="/admin/feedback/edit/:id" element={<AdminEditFeedback />} />

              {/* ----- 3.8 Promo Codes & Discounts ----- */}
              <Route path="/admin/promo/add" element={<AdminPromoAdd />} />
              <Route path="/admin/promo/manage" element={<AdminPromoManage />} />
              <Route path="/admin/promo/edit/:id" element={<AdminPromoEdit />} />

              {/* ----- 3.9 App Icons & Category Symbols ----- */}
              <Route path="/admin/icons/add" element={<AdminAddIcon />} />
              <Route path="/admin/icons/edit/:id" element={<AdminEditIcon />} />

              {/* ----- 3.10 Tip Amounts, Cancellation Reasons, FAQs & Banks ----- */}
              <Route path="/admin/tip/manage" element={<AdminManageTip />} />
              <Route path="/admin/tip/edit/:id" element={<AdminEditTip />} />
              <Route path="/admin/cancel-reason/manage" element={<AdminManageCancelReason />} />
              <Route path="/admin/cancel-reason/edit/:id" element={<AdminEditCancelReason />} />
              <Route path="/admin/faq/manage" element={<AdminManageFaq />} />
              <Route path="/admin/faq/edit/:id" element={<AdminEditFaq />} />
              <Route path="/admin/bank/add" element={<AdminAddBank />} />
              <Route path="/admin/bank/edit/:id" element={<AdminEditBank />} />
              <Route path="/admin/notification/send" element={<AdminSendNotification />} />

              {/* ----- 3.11 Website CMS & Section Content Editors ----- */}
              <Route path="/admin/settings/website" element={<AdminSettingsWebsite />} />
              <Route path="/admin/settings/website/header" element={<AdminSiteHeader />} />
              <Route path="/admin/settings/website/company-info" element={<AdminCompanyInfo />} />
              <Route path="/admin/settings/website/:pageKey" element={<AdminSettingsWebsitePage />} />
              <Route path="/admin/settings/website/:pageKey/:sectionKey" element={<AdminSectionEditor />} />

              {/* ----- 3.12 Settings, Banners, Contact, Emergency & Legal Policies ----- */}
              <Route path="/admin/settings/contact-us" element={<AdminContactUs />} />
              <Route path="/admin/settings/contact-us/edit/:id" element={<AdminEditContactUs />} />
              <Route path="/admin/settings/emergency" element={<AdminManageEmergency />} />
              <Route path="/admin/settings/emergency/edit/:id" element={<AdminEditEmergency />} />
              <Route path="/admin/settings/privacy-policy" element={<AdminPrivacyPolicy />} />
              <Route path="/admin/settings/privacy-policy/edit/:id" element={<AdminEditPrivacyPolicy />} />
              <Route path="/admin/settings/terms" element={<AdminTermsConditions />} />
              <Route path="/admin/settings/terms/edit/:id" element={<AdminEditTermsConditions />} />
              <Route path="/admin/settings/about-us" element={<AdminAboutUs />} />
              <Route path="/admin/settings/about-us/edit/:id" element={<AdminEditAboutUs />} />
              <Route path="/admin/settings/app-banner" element={<AdminAppBanner />} />
              <Route path="/admin/settings/app-banner/edit/:id" element={<AdminEditAppBanner />} />

              {/* ----- 3.13 Sub-Admin Roles, Permissions & Financial History ----- */}
              <Route path="/admin/subadmin/add" element={<AdminAddSubAdmin />} />
              <Route path="/admin/subadmin/see" element={<AdminSeeSubAdmin />} />
              <Route path="/admin/subadmin/transactions" element={<AdminSubAdminTransactions />} />
              <Route path="/admin/subadmin/edit/:id" element={<AdminEditSubAdmin />} />
              <Route path="/admin/subadmin/:id/drivers" element={<AdminSubAdminDrivers />} />
              <Route path="/admin/recharge-history" element={<AdminRechargeHistory />} />
              <Route path="/admin/recharge-history/topup" element={<AdminTopupWallet />} />
    
            </Route>
            {/* End of Protected Admin Layout */}

            {/* =========================================================
               SECTION 4: SUB-ADMIN / CRM PANEL SECURED ROUTES
            ========================================================= */}
            <Route
              element={
                <CrmProtectedRoute>
                  <CrmLayout />
                </CrmProtectedRoute>
              }
            >
              <Route path="/crm-dashboard" element={<CrmDashboard />} />
              <Route path="/crm-user" element={<CrmUserList />} />
              <Route path="/crm-user/:id" element={<CrmUserDetail />} />
              <Route path="/crm-user/:id/location" element={<CrmUserLocation />} />
              <Route path="/crm-user-unverified" element={<CrmUnverifiedUserList />} />
              <Route path="/crm-user-driver" element={<CrmManageDrivers />} />
              <Route path="/crm-driver-profile/:id" element={<CrmDriverProfile />} />
              <Route path="/crm-driver-location/:id" element={<CrmDriverLocation />} />
              <Route path="/crm-driver-profile-edit/:id" element={<Navigate to="/crm-user-driver" replace />} />
              <Route path="/crm-driver-referral-list/:id" element={<Navigate to="/crm-user-driver" replace />} />
              <Route path="/crm-driver-referral-commission-list/:id" element={<Navigate to="/crm-user-driver" replace />} />
              <Route path="/crm-rides-ongoing-manage" element={<CrmOngoingRides />} />
              <Route path="/crm-rides-completed-manage" element={<CrmCompletedRides />} />
              <Route path="/crm-rides-cancel-manage" element={<CrmCancelledRides />} />
              <Route path="/crm-bank-details" element={<CrmBankDetails />} />
              <Route path="/crm-bank-details-edit/:id" element={<CrmEditBankDetails />} />
              <Route path="/crm-withdrawal" element={<CrmWithdrawal />} />
              <Route path="/crm-withdrawal-list" element={<CrmWithdrawalList />} />
              <Route path="/crm-profile" element={<CrmProfile />} />
              <Route path="/crm-change-password" element={<CrmChangePassword />} />
            </Route>

          </Routes>
        </BrowserRouter>
        </CrmAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
export default AppRoutes;
