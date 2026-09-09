import ServiceBanner from "../bhrosawebsite/service/ServiceBanner/ServiceBanner";
import ServicesCards from "../bhrosawebsite/service/ServicesCards/ServicesCards";
import PricingSection from "../bhrosawebsite/service/pricing/PricingSection";
import TaxicTA from "../bhrosawebsite/service/TaxiCTA/TaxiCTA";

const Services = () => {
  return (
    <>
      <ServiceBanner />
      <ServicesCards />
      <PricingSection />
      <TaxicTA />
    </>
  );
};

export default Services;
