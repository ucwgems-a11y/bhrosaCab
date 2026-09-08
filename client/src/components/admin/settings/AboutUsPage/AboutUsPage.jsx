import TitleDescriptionManager from "../TitleDescriptionManager/TitleDescriptionManager";

export default function AboutUsPage() {
  return (
    <TitleDescriptionManager
      formHeading="About Us Add"
      submitLabel="Add About Us"
      listHeading="Added About Us Details"
      apiEndpoint="/settings/about-us"
      editRouteBase="/admin/settings/about-us/edit"
    />
  );
}
