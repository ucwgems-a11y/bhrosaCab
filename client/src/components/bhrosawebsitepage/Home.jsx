import React from "react";
import Hero from "../bhrosawebsite/home/Hero/Hero";
import About from "../bhrosawebsite/home/About/About";
import OfferSection from "../bhrosawebsite/home/CabOffer/OfferSection";
import OnlineBooking from "../bhrosawebsite/home/OnlineBooking/OnlineBooking";
import DownloadSection from "../bhrosawebsite/home/DownloadSection/DownloadSection";
import WhyChoose from "../bhrosawebsite/home/WhyChoose/WhyChoose";
import RegistrationSection from "../bhrosawebsite/home/RegistrationSection/RegistrationSection";

function Home() {
  return (
    <>
      <Hero />
      <About />
      <OfferSection />
      <OnlineBooking />
      <DownloadSection />
      <WhyChoose />
      <RegistrationSection />
    </>
  );
}

export default Home;
