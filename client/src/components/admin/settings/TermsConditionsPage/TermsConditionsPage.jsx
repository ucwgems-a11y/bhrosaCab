import TitleDescriptionManager from "../TitleDescriptionManager/TitleDescriptionManager";

export default function TermsConditionsPage() {
  return (
    <TitleDescriptionManager
      formHeading="Terms & Conditions Add"
      submitLabel="Add Terms"
      listHeading="Added Terms & Conditions"
      apiEndpoint="/settings/terms"
      editRouteBase="/admin/settings/terms/edit"
    />
  );
}
