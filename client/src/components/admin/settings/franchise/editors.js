import FranchiseBannerEditor from "./FranchiseBannerEditor/FranchiseBannerEditor";
import FranchiseBenefitsEditor from "./FranchiseBenefitsEditor/FranchiseBenefitsEditor";
import FranchiseApplicationsEditor from "./FranchiseApplicationsEditor/FranchiseApplicationsEditor";

const franchiseEditors = {
  banner: FranchiseBannerEditor,
  benefits: FranchiseBenefitsEditor,
  form: FranchiseApplicationsEditor,
};

export default franchiseEditors;