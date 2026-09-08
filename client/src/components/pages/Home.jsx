import React from "react";
import Hero from "../home/Hero/Hero";
import About from "../home/About/About";
import OfferSection from "../home/CabOffer/OfferSection";
import OnlineBooking from "../home/OnlineBooking/OnlineBooking";
import DownloadSection from "../home/DownloadSection/DownloadSection";
import WhyChoose from "../home/WhyChoose/WhyChoose";
import RegistrationSection from "../home/RegistrationSection/RegistrationSection";

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
