import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./CrmDriverLocation.css";

const driversList = [
  {
    "id": 13878,
    "name": "Harvinder Singh",
    "phone": "+919855897719",
    "activeStatus": "Offline",
    "referralCode": "ha60260",
    "image": "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/edfa16e5-b8ca-4cea-be6c-670fbd4ae2dd.jpg",
    "licenseNumber": "CH0120080000454",
    "vehicleBrand": "N/A",
    "vehicleNumber": "PB01C1987",
    "category": "4",
    "address": ""
  },
  {
    "id": 13852,
    "name": "Rahul",
    "phone": "+918685896408",
    "activeStatus": "Offline",
    "referralCode": "ra85210",
    "image": "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/b0483cb9-6daa-4d45-aa08-cde840b986dd.jpg",
    "licenseNumber": "CH0120220003607",
    "vehicleBrand": "",
    "vehicleNumber": "CH02AA8620",
    "category": "4",
    "address": ""
  },
  {
    "id": 13848,
    "name": "kuldeep",
    "phone": "+917404046446",
    "activeStatus": "Online",
    "referralCode": "ku48480",
    "image": "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/978f68ec-a3e3-4294-8851-123b210677ed.jpg",
    "licenseNumber": "HR2020190004512",
    "vehicleBrand": "Hyundai",
    "vehicleNumber": "HR20CD5678",
    "category": "4",
    "address": ""
  },
  {
    "id": 13828,
    "name": "rohit",
    "phone": "+918950038024",
    "activeStatus": "Online",
    "referralCode": "ro28280",
    "image": "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/645c1fb2-8ddd-4861-a4d5-8501ab4e11aa.jpg",
    "licenseNumber": "HR1220200003412",
    "vehicleBrand": "Honda",
    "vehicleNumber": "HR12EF9012",
    "category": "1",
    "address": ""
  },
  {
    "id": 13824,
    "name": "Gurpreet singh",
    "phone": "+919772528300",
    "activeStatus": "Online",
    "referralCode": "gu24240",
    "image": "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/118b255a-bb34-4412-988c-d569b29bca04.jpg",
    "licenseNumber": "PB0220170001234",
    "vehicleBrand": "Bajaj",
    "vehicleNumber": "PB02GH3456",
    "category": "2",
    "address": ""
  },
  {
    "id": 13821,
    "name": "Mohinder Pal",
    "phone": "+918303027895",
    "activeStatus": "Online",
    "referralCode": "mo21210",
    "image": "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/f378db5a-9ece-49d9-8d4a-db5d197e13c1.jpg",
    "licenseNumber": "UP3220160005678",
    "vehicleBrand": "Tata",
    "vehicleNumber": "UP32IJ7890",
    "category": "5",
    "address": ""
  },
  {
    "id": 13816,
    "name": "Jeet Singh",
    "phone": "+918219543510",
    "activeStatus": "Offline",
    "referralCode": "je16160",
    "image": "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/94bfc15c-e442-43c3-80d5-d8a31a25bcc4.jpg",
    "licenseNumber": "PB0120150009876",
    "vehicleBrand": "Toyota",
    "vehicleNumber": "PB01D3856",
    "category": "6",
    "address": ""
  },
  {
    "id": 13815,
    "name": "Gurmail Singh",
    "phone": "+916239345514",
    "activeStatus": "Offline",
    "referralCode": "gu15150",
    "image": "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/93806b41-7450-4edf-b55d-0e95e4c6d892.jpg",
    "licenseNumber": "PB0120140004321",
    "vehicleBrand": "Maruti",
    "vehicleNumber": "PB01E4275",
    "category": "4",
    "address": ""
  },
  {
    "id": 13813,
    "name": "Arvind Kumar Dogra",
    "phone": "+919736320205",
    "activeStatus": "Offline",
    "referralCode": "ar13130",
    "image": "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/7fec7e14-048b-405c-9152-687576b838ca.jpg",
    "licenseNumber": "HP0120130008765",
    "vehicleBrand": "Hyundai",
    "vehicleNumber": "HP01KL1357",
    "category": "3",
    "address": ""
  },
  {
    "id": 13811,
    "name": "avdhesh Kumar Prajapati",
    "phone": "+916284398018",
    "activeStatus": "Offline",
    "referralCode": "av11110",
    "image": "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/612b7863-9e96-4025-914b-2643c109b456.jpg",
    "licenseNumber": "PB6520120006543",
    "vehicleBrand": "Tata",
    "vehicleNumber": "PB65MN2468",
    "category": "4",
    "address": ""
  }
];

export default function CrmDriverLocation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const driver =
    driversList.find((d) => String(d.id) === String(id)) || {
      id: id || 13852,
      name: `Driver #${id}`,
      phone: "+918685896408",
      activeStatus: "Offline",
    };

  const isOnline = driver.activeStatus === "Online";

  return (
    <div className="crm-location-page-wrap">
      <div className="crm-location-card">
        <div className="crm-location-card-body">
          {/* Header */}
          <div className="crm-location-header">
            <h2 className="crm-location-title">Driver Live Location</h2>
            <button
              type="button"
              className="crm-location-back-btn"
              onClick={() => navigate(`/crm-driver-profile/${id}`)}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          </div>

          {/* Info Details Row */}
          <div className="crm-location-info-row">
            <div className="crm-location-info-col">
              <strong>Driver Name :</strong> {driver.name}
            </div>
            {/* <div className="crm-location-info-col">
              <strong>Mobile :</strong> {driver.phone}
            </div> */}
            <div className="crm-location-info-col">
              <strong>Status :</strong>{" "}
              <span className={`crm-location-badge ${isOnline ? "online" : "offline"}`}>
                {driver.activeStatus}
              </span>
            </div>
          </div>

          {/* Interactive Map Visual */}
          <div className="crm-location-map-box">
            <iframe
              title="Driver Live Location Map"
              width="100%"
              height="600"
              style={{ border: 0, borderRadius: "10px" }}
              loading="lazy"
              src="https://maps.google.com/maps?q=28.6139,77.2090&z=14&output=embed"
            ></iframe>

            {/* Float Popup Overlay */}
            <div className="crm-location-map-popup">
              <div className="crm-location-popup-header">🚖 {driver.name}</div>
              <div className="crm-location-popup-body">
                <b>Current Location</b>
                <br />
                <small>{isOnline ? "Live Tracking: Sector 17, Chandigarh" : "Location not found / Offline"}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
