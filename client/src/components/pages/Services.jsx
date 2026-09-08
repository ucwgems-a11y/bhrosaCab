import ServiceBanner from "../service/ServiceBanner/ServiceBanner";
import ServicesCards from "../service/ServicesCards/ServicesCards";
import PricingSection from "../service/pricing/PricingSection";
import TaxicTA from "../service/TaxiCTA/TaxiCTA";

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
