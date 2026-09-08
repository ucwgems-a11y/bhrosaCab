import HeroEditor from "./HeroEditor/HeroEditor";
import AboutEditor from "./AboutEditor/AboutEditor";
import CabOfferEditor from "./CabOfferEditor/CabOfferEditor";
import OnlineBookingEditor from "./OnlineBookingEditor/OnlineBookingEditor";
import DownloadSectionEditor from "./DownloadSectionEditor/DownloadSectionEditor";
import WhyChooseEditor from "./WhyChooseEditor/WhyChooseEditor";
import RegistrationEditor from "./RegistrationEditor/RegistrationEditor";

const homeEditors = {
  hero: HeroEditor,
    about: AboutEditor,
    "cab-offer": CabOfferEditor,
    "online-booking": OnlineBookingEditor,
      "download-section": DownloadSectionEditor,
        "why-choose": WhyChooseEditor,
          "registration-section": RegistrationEditor,
};

export default homeEditors;