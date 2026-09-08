import ServiceBannerEditor from "./ServiceBannerEditor/ServiceBannerEditor";
import ServicesCardsEditor from "./ServicesCardsEditor/ServicesCardsEditor";
import PricingEditor from "./PricingEditor/PricingEditor";
import TaxiCtaEditor from "./TaxiCtaEditor/TaxiCtaEditor";

const servicesEditors = {
  banner: ServiceBannerEditor,
   cards: ServicesCardsEditor,
   pricing: PricingEditor,      
  cta: TaxiCtaEditor,       
};

export default servicesEditors;