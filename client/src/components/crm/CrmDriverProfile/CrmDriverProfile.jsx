import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { swalWithBootstrapButtons } from "../../../utils/sweetAlert";
import "./CrmDriverProfile.css";

const mockDriversProfileDatabase = [
  {
    id: 13878,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/edfa16e5-b8ca-4cea-be6c-670fbd4ae2dd.jpg",
    name: "Harvinder Singh",
    phone: "+919855897719",
    licenseNumber: "CH0120080000454",
    aadharNumber: "760477836031",
    aadharStatus: "approved",
    vehicleBrand: "N/A",
    vehicleNumber: "PB01C1987",
    vehicleCategory: "Sedan",
    vehicleFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/99e2fae8-8949-4b49-93a5-fd6de8f6e3e4.jpg",
    vehicleInterior: null,
    vehicleBack: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/f3d2db02-9332-425d-86ea-a70305742cdc.jpg",
    licenceFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/6d3a5cdc-4eea-4ff3-b612-4d267e1e1a25.jpg",
    vehicleRc: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/7f9b9846-77eb-4afe-a35e-e0cc0e327d65.jpg",
    govtIdProof: null,
  },
  {
    id: 13852,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/b0483cb9-6daa-4d45-aa08-cde840b986dd.jpg",
    name: "Rahul",
    phone: "+918685896408",
    licenseNumber: "HR0620180009182",
    aadharNumber: "452178963214",
    aadharStatus: "approved",
    vehicleBrand: "Maruti Suzuki",
    vehicleNumber: "HR06AB1234",
    vehicleCategory: "Hatchback",
    vehicleFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/99e2fae8-8949-4b49-93a5-fd6de8f6e3e4.jpg",
    vehicleInterior: null,
    vehicleBack: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/f3d2db02-9332-425d-86ea-a70305742cdc.jpg",
    licenceFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/6d3a5cdc-4eea-4ff3-b612-4d267e1e1a25.jpg",
    vehicleRc: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/7f9b9846-77eb-4afe-a35e-e0cc0e327d65.jpg",
    govtIdProof: null,
  },
  {
    id: 13848,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/978f68ec-a3e3-4294-8851-123b210677ed.jpg",
    name: "kuldeep",
    phone: "+917404046446",
    licenseNumber: "HR2020190004512",
    aadharNumber: "998877665544",
    aadharStatus: "approved",
    vehicleBrand: "Hyundai",
    vehicleNumber: "HR20CD5678",
    vehicleCategory: "Sedan",
    vehicleFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/99e2fae8-8949-4b49-93a5-fd6de8f6e3e4.jpg",
    vehicleInterior: null,
    vehicleBack: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/f3d2db02-9332-425d-86ea-a70305742cdc.jpg",
    licenceFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/6d3a5cdc-4eea-4ff3-b612-4d267e1e1a25.jpg",
    vehicleRc: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/7f9b9846-77eb-4afe-a35e-e0cc0e327d65.jpg",
    govtIdProof: null,
  },
  {
    id: 13828,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/645c1fb2-8ddd-4861-a4d5-8501ab4e11aa.jpg",
    name: "rohit",
    phone: "+918950038024",
    licenseNumber: "HR1220200003412",
    aadharNumber: "887766554433",
    aadharStatus: "approved",
    vehicleBrand: "Honda",
    vehicleNumber: "HR12EF9012",
    vehicleCategory: "Bike",
    vehicleFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/99e2fae8-8949-4b49-93a5-fd6de8f6e3e4.jpg",
    vehicleInterior: null,
    vehicleBack: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/f3d2db02-9332-425d-86ea-a70305742cdc.jpg",
    licenceFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/6d3a5cdc-4eea-4ff3-b612-4d267e1e1a25.jpg",
    vehicleRc: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/7f9b9846-77eb-4afe-a35e-e0cc0e327d65.jpg",
    govtIdProof: null,
  },
  {
    id: 13824,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/118b255a-bb34-4412-988c-d569b29bca04.jpg",
    name: "Gurpreet singh",
    phone: "+919772528300",
    licenseNumber: "PB0220170001234",
    aadharNumber: "776655443322",
    aadharStatus: "approved",
    vehicleBrand: "Bajaj",
    vehicleNumber: "PB02GH3456",
    vehicleCategory: "Auto",
    vehicleFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/99e2fae8-8949-4b49-93a5-fd6de8f6e3e4.jpg",
    vehicleInterior: null,
    vehicleBack: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/f3d2db02-9332-425d-86ea-a70305742cdc.jpg",
    licenceFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/6d3a5cdc-4eea-4ff3-b612-4d267e1e1a25.jpg",
    vehicleRc: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/7f9b9846-77eb-4afe-a35e-e0cc0e327d65.jpg",
    govtIdProof: null,
  },
  {
    id: 13821,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/f378db5a-9ece-49d9-8d4a-db5d197e13c1.jpg",
    name: "Mohinder Pal",
    phone: "+918303027895",
    licenseNumber: "UP3220160005678",
    aadharNumber: "665544332211",
    aadharStatus: "approved",
    vehicleBrand: "Tata",
    vehicleNumber: "UP32IJ7890",
    vehicleCategory: "Mini SUV",
    vehicleFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/99e2fae8-8949-4b49-93a5-fd6de8f6e3e4.jpg",
    vehicleInterior: null,
    vehicleBack: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/f3d2db02-9332-425d-86ea-a70305742cdc.jpg",
    licenceFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/6d3a5cdc-4eea-4ff3-b612-4d267e1e1a25.jpg",
    vehicleRc: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/7f9b9846-77eb-4afe-a35e-e0cc0e327d65.jpg",
    govtIdProof: null,
  },
  {
    id: 13816,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/94bfc15c-e442-43c3-80d5-d8a31a25bcc4.jpg",
    name: "Jeet Singh",
    phone: "+918219543510",
    licenseNumber: "PB0120150009876",
    aadharNumber: "554433221100",
    aadharStatus: "approved",
    vehicleBrand: "Toyota",
    vehicleNumber: "PB01D3856",
    vehicleCategory: "Premium SUV",
    vehicleFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/99e2fae8-8949-4b49-93a5-fd6de8f6e3e4.jpg",
    vehicleInterior: null,
    vehicleBack: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/f3d2db02-9332-425d-86ea-a70305742cdc.jpg",
    licenceFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/6d3a5cdc-4eea-4ff3-b612-4d267e1e1a25.jpg",
    vehicleRc: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/7f9b9846-77eb-4afe-a35e-e0cc0e327d65.jpg",
    govtIdProof: null,
  },
  {
    id: 13815,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/93806b41-7450-4edf-b55d-0e95e4c6d892.jpg",
    name: "Gurmail Singh",
    phone: "+916239345514",
    licenseNumber: "PB0120140004321",
    aadharNumber: "443322110099",
    aadharStatus: "approved",
    vehicleBrand: "Maruti",
    vehicleNumber: "PB01E4275",
    vehicleCategory: "Sedan",
    vehicleFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/99e2fae8-8949-4b49-93a5-fd6de8f6e3e4.jpg",
    vehicleInterior: null,
    vehicleBack: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/f3d2db02-9332-425d-86ea-a70305742cdc.jpg",
    licenceFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/6d3a5cdc-4eea-4ff3-b612-4d267e1e1a25.jpg",
    vehicleRc: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/7f9b9846-77eb-4afe-a35e-e0cc0e327d65.jpg",
    govtIdProof: null,
  },
  {
    id: 13813,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/7fec7e14-048b-405c-9152-687576b838ca.jpg",
    name: "Arvind Kumar Dogra",
    phone: "+919736320205",
    licenseNumber: "HP0120130008765",
    aadharNumber: "332211009988",
    aadharStatus: "approved",
    vehicleBrand: "Hyundai",
    vehicleNumber: "HP01KL1357",
    vehicleCategory: "Hatchback",
    vehicleFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/99e2fae8-8949-4b49-93a5-fd6de8f6e3e4.jpg",
    vehicleInterior: null,
    vehicleBack: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/f3d2db02-9332-425d-86ea-a70305742cdc.jpg",
    licenceFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/6d3a5cdc-4eea-4ff3-b612-4d267e1e1a25.jpg",
    vehicleRc: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/7f9b9846-77eb-4afe-a35e-e0cc0e327d65.jpg",
    govtIdProof: null,
  },
  {
    id: 13811,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/612b7863-9e96-4025-914b-2643c109b456.jpg",
    name: "avdhesh Kumar Prajapati",
    phone: "+916284398018",
    licenseNumber: "PB6520120006543",
    aadharNumber: "221100998877",
    aadharStatus: "approved",
    vehicleBrand: "Tata",
    vehicleNumber: "PB65MN2468",
    vehicleCategory: "Sedan",
    vehicleFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/99e2fae8-8949-4b49-93a5-fd6de8f6e3e4.jpg",
    vehicleInterior: null,
    vehicleBack: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/f3d2db02-9332-425d-86ea-a70305742cdc.jpg",
    licenceFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/6d3a5cdc-4eea-4ff3-b612-4d267e1e1a25.jpg",
    vehicleRc: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/7f9b9846-77eb-4afe-a35e-e0cc0e327d65.jpg",
    govtIdProof: null,
  },
];

export default function CrmDriverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [zoomImage, setZoomImage] = useState(null);

  const profile =
    mockDriversProfileDatabase.find((d) => String(d.id) === String(id)) || {
      id: id || 13878,
      image: "https://kalasalingam.ac.in/wp-content/uploads/2021/08/Achievements-dummy-profile.png",
      name: `Driver #${id}`,
      phone: "+91 9876543210",
      licenseNumber: `CH01202${id}`,
      aadharNumber: `7604778${id}`,
      aadharStatus: "approved",
      vehicleBrand: "N/A",
      vehicleNumber: `PB01${id}`,
      vehicleCategory: "Sedan",
      vehicleFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/99e2fae8-8949-4b49-93a5-fd6de8f6e3e4.jpg",
      vehicleInterior: null,
      vehicleBack: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/f3d2db02-9332-425d-86ea-a70305742cdc.jpg",
      licenceFront: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/6d3a5cdc-4eea-4ff3-b612-4d267e1e1a25.jpg",
      vehicleRc: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/vehicle_rc/7f9b9846-77eb-4afe-a35e-e0cc0e327d65.jpg",
      govtIdProof: null,
    };

  function handleActionAlert(actionName) {
    swalWithBootstrapButtons.fire({
      title: actionName,
      text: `${actionName} for driver ${profile.name} (ID #${profile.id})`,
      icon: "info",
    });
  }

  const rows = [
    { label: "Driver name:", value: profile.name },
    // { label: "Phone Number:", value: profile.phone },
    { label: "License Number:", value: profile.licenseNumber },
    { label: "Aadhar Number:", value: profile.aadharNumber },
    { label: "Aadhar Status:", value: profile.aadharStatus },
    { label: "Vehicle Brand:", value: profile.vehicleBrand },
    { label: "Vehicle Number:", value: profile.vehicleNumber },
    { label: "Vehicle Cateogory:", value: profile.vehicleCategory },
  ];

  const imageRows = [
    { label: "Vehicle Front Image:", src: profile.vehicleFront },
    { label: "Vehicle Interior Image:", src: profile.vehicleInterior },
    { label: "Vehicle Back Image:", src: profile.vehicleBack },
    { label: "Licence Front:", src: profile.licenceFront },
    { label: "Vehicle RC Front:", src: profile.vehicleRc },
    { label: "Government Id Proof:", src: profile.govtIdProof },
  ];

  return (
    <div className="crm-driverprofile-page-wrap">
      <div className="crm-driverprofile-card">
        {/* Top Header & Actions */}
        <div className="crm-driverprofile-header-wrap">
          <h2 className="crm-driverprofile-heading">Driver Details &amp; Documents</h2>

          <div className="crm-driverprofile-actions">
            <button
              type="button"
              className="crm-dp-btn btn-warning"
              onClick={() => navigate(`/crm-driver-location/${id || profile.id}`)}
            >
              Driver Live Location
            </button>
            <button
              type="button"
              className="crm-dp-btn btn-warning"
              onClick={() => navigate("/crm-user-driver")}
            >
              Back to Drivers List
            </button>
          </div>
        </div>

        {/* Table Details */}
        <div className="crm-driverprofile-body">
          <table className="crm-driverprofile-table">
            <tbody>
              <tr>
                <th scope="row" className="crm-dp-label">Profile Image</th>
                <td>
                  <img
                    src={profile.image}
                    alt="Driver Profile"
                    className="crm-dp-thumb"
                    onClick={() => setZoomImage(profile.image)}
                    onError={(e) => {
                      e.target.src =
                        "https://kalasalingam.ac.in/wp-content/uploads/2021/08/Achievements-dummy-profile.png";
                    }}
                  />
                </td>
              </tr>

              {rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="crm-dp-label">{r.label}</th>
                  <td className="crm-dp-value">{r.value}</td>
                </tr>
              ))}

              {imageRows.map((img) => (
                <tr key={img.label}>
                  <th scope="row" className="crm-dp-label">{img.label}</th>
                  <td>
                    {img.src ? (
                      <img
                        src={img.src}
                        alt={img.label}
                        className="crm-dp-doc-thumb"
                        onClick={() => setZoomImage(img.src)}
                      />
                    ) : (
                      <span className="crm-dp-na">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {zoomImage && (
        <div className="crm-dp-modal-overlay" onClick={() => setZoomImage(null)}>
          <div className="crm-dp-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={zoomImage} alt="Zoomed document preview" />
            <button
              type="button"
              className="crm-dp-modal-close"
              onClick={() => setZoomImage(null)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
