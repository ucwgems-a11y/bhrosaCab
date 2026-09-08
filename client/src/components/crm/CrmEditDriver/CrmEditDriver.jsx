import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { swalWithBootstrapButtons } from "../../../utils/sweetAlert";
import "./CrmEditDriver.css";

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

export default function CrmEditDriver() {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentDriver =
    driversList.find((d) => String(d.id) === String(id)) || {
      id: id || 13852,
      name: "Rahul",
      phone: "+918685896408",
      licenseNumber: "CH0120220003607",
      vehicleBrand: "",
      vehicleNumber: "CH02AA8620",
      category: "4",
      address: "",
      image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/b0483cb9-6daa-4d45-aa08-cde840b986dd.jpg",
    };

  const [formData, setFormData] = useState({
    name: currentDriver.name,
    number: currentDriver.phone,
    address: currentDriver.address || "",
    license_number: currentDriver.licenseNumber || "",
    brand: currentDriver.vehicleBrand || "",
    vehicle_number: currentDriver.vehicleNumber || "",
    cateogory: currentDriver.category || "4",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    swalWithBootstrapButtons.fire({
      title: "Updated Successfully!",
      text: `Driver ${formData.name} details have been updated.`,
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      navigate(`/crm-driver-profile/${id}`);
    });
  }

  return (
    <div className="crm-editdriver-page-wrap">
      <div className="crm-editdriver-card">
        <div className="crm-editdriver-card-body">
          <h3 className="crm-editdriver-heading">Edit Driver Details</h3>

          <form onSubmit={handleSubmit} className="crm-editdriver-form">
            {/* Profile Image */}
            <div className="crm-editdriver-field">
              <label className="crm-editdriver-label">Profile Image</label>
              <div className="crm-editdriver-img-preview-box">
                <img
                  src={currentDriver.image}
                  alt={currentDriver.name}
                  className="crm-editdriver-img-preview"
                  onError={(e) => {
                    e.target.src =
                      "https://kalasalingam.ac.in/wp-content/uploads/2021/08/Achievements-dummy-profile.png";
                  }}
                />
              </div>
              <input type="file" name="image" className="crm-editdriver-file-input" />
            </div>

            {/* Driver Name */}
            <div className="crm-editdriver-field">
              <label className="crm-editdriver-label">Driver Name</label>
              <input
                type="text"
                name="name"
                className="crm-editdriver-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone Number */}
            {/* <div className="crm-editdriver-field">
              <label className="crm-editdriver-label">Phone Number</label>
              <input
                type="text"
                name="number"
                className="crm-editdriver-input"
                value={formData.number}
                onChange={handleChange}
              />
            </div> */}

            {/* Address */}
            <div className="crm-editdriver-field">
              <label className="crm-editdriver-label">Address</label>
              <textarea
                name="address"
                className="crm-editdriver-textarea"
                rows="3"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* License Number */}
            <div className="crm-editdriver-field">
              <label className="crm-editdriver-label">License Number</label>
              <input
                type="text"
                name="license_number"
                className="crm-editdriver-input"
                value={formData.license_number}
                onChange={handleChange}
              />
            </div>

            {/* Vehicle Brand */}
            <div className="crm-editdriver-field">
              <label className="crm-editdriver-label">Vehicle Brand</label>
              <input
                type="text"
                name="brand"
                className="crm-editdriver-input"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>

            {/* Vehicle Number */}
            <div className="crm-editdriver-field">
              <label className="crm-editdriver-label">Vehicle Number</label>
              <input
                type="text"
                name="vehicle_number"
                className="crm-editdriver-input"
                value={formData.vehicle_number}
                onChange={handleChange}
              />
            </div>

            {/* Vehicle Category */}
            <div className="crm-editdriver-field">
              <label className="crm-editdriver-label">Vehicle Category</label>
              <select
                name="cateogory"
                className="crm-editdriver-select"
                value={formData.cateogory}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                <option value="1">Bike</option>
                <option value="2">Auto</option>
                <option value="3">Hatchback</option>
                <option value="4">Sedan</option>
                <option value="5">Mini SUV</option>
                <option value="6">Premium SUV</option>
                <option value="7">Any Premium Car</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="crm-editdriver-actions">
              <button
                type="button"
                className="crm-editdriver-btn cancel"
                onClick={() => navigate(`/crm-driver-profile/${id}`)}
              >
                Cancel
              </button>
              <button type="submit" className="crm-editdriver-btn submit">
                Update Driver
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
