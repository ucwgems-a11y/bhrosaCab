import { Outlet } from "react-router-dom";

import TopHeader from "../TopHeader/TopHeader";
import Header from "../Header/Header";
import Navbar from "../Navbar/Navbar";
import StickyNavbar from "../StickyNavbar/StickyNavbar";
import Footer from "../Footer/Footer";

function MainLayout() {
  return (
    <>
      <TopHeader />
      <Header />
      <Navbar />
      <StickyNavbar />
      <Outlet />
      <Footer />
    </>
  );
}

export default MainLayout;
