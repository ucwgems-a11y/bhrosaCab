import { Outlet } from "react-router-dom";

import TopHeader from "../TopHeader/TopHeader";
import Header from "../Header/Header";
import Navbar from "../Navbar/Navbar";
import StickyNavbar from "../StickyNavbar/StickyNavbar";
import Footer from "../Footer/Footer";
import "./MainLayout.css";

function MainLayout() {
  return (
    <div className="site-wrapper">
      <TopHeader />
      <Header />
      <Navbar />
      <StickyNavbar />
      <Outlet />
      <Footer />
    </div>
  );
}

export default MainLayout;
