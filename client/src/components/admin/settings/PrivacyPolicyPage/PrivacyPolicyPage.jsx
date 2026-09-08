import TitleDescriptionManager from "../TitleDescriptionManager/TitleDescriptionManager";

export default function PrivacyPolicyPage() {
  return (
    <TitleDescriptionManager
      formHeading="Add Privacy Policy"
      submitLabel="Add Policy"
      listHeading="Added Policy Clauses"
      apiEndpoint="/settings/privacy-policy"
      editRouteBase="/admin/settings/privacy-policy/edit"
    />
  );
}
