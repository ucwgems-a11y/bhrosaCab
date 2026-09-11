import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Phone, Navigation } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../../api/axios";
import "./CrmDriverLocation.css";

// Standard Leaflet Marker Icon
const defaultMarkerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function cleanEnglishAddress(text) {
  if (!text) return "";
  return text
    .replace(/[\u0900-\u097F]/g, "")
    .replace(/\s*,\s*,+/g, ",")
    .replace(/^\s*,\s*/, "")
    .replace(/\s*,\s*$/, "")
    .trim();
}

export default function CrmDriverLocation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("Fetching driver location details...");

  useEffect(() => {
    async function fetchDriverData() {
      setLoading(true);
      try {
        const res = await api.get(`/drivers/${id}`);
        if (res.data && (res.data.driver || res.data.data)) {
          const d = res.data.driver || res.data.data;
          setDriver(d);

          const lat = parseFloat(d.latitude) || 28.6139;
          const lng = parseFloat(d.longitude) || 77.2090;

          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`,
              {
                headers: {
                  "Accept-Language": "en",
                  "User-Agent": "BhrosaCabCRM/1.0",
                },
              }
            );
            const geoData = await geoRes.json();
            if (geoData && geoData.display_name) {
              const fullEnglish = cleanEnglishAddress(geoData.display_name);
              setAddress(fullEnglish || `Coordinates: ${lat}, ${lng}`);
            } else {
              setAddress(`Coordinates: ${lat}, ${lng}`);
            }
          } catch (e) {
            setAddress(`Coordinates: ${lat}, ${lng}`);
          }
        }
      } catch (err) {
        console.error("Failed to fetch CRM driver location:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchDriverData();
    }
  }, [id]);

  useEffect(() => {
    if (!mapContainerRef.current || !driver) return;

    const lat = parseFloat(driver.latitude) || 28.6139;
    const lng = parseFloat(driver.longitude) || 77.2090;

    const popupHtml = `
      <div style="font-family: inherit; min-width: 200px;">
        <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
          🚗 ${driver.name || "Driver Partner"}
        </div>
        <div style="font-size: 12px; color: #475569; margin-bottom: 2px;">
          <strong>Phone:</strong> ${driver.number || driver.phone || "N/A"}
        </div>
        <div style="font-size: 12px; color: #475569; margin-bottom: 2px;">
          <strong>Vehicle:</strong> ${driver.vehicle_number || driver.vehicleNumber || "N/A"} (${driver.brand || ""} ${driver.model || ""})
        </div>
        <div style="font-size: 11.5px; color: #64748b; margin-top: 6px; line-height: 1.4; border-top: 1px solid #e2e8f0; padding-top: 4px;">
          <strong>Location:</strong> ${address}
        </div>
      </div>
    `;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([lat, lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const marker = L.marker([lat, lng], { icon: defaultMarkerIcon }).addTo(map);
      marker.bindPopup(popupHtml).openPopup();

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      mapInstanceRef.current.setView([lat, lng], 13);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        markerRef.current.setPopupContent(popupHtml);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [driver, address]);

  const isOnline = driver?.active === "Online" || driver?.online_offline === "1" || driver?.online_offline === 1;

  return (
    <div className="crm-location-page-wrap">
      <div className="crm-location-card">
        <div className="crm-location-card-body">
          {/* Header with Back button */}
          <div className="crm-location-header">
            <h4 className="crm-location-title">Driver Live Location</h4>
            <button
              type="button"
              className="crm-location-back-btn"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          {/* Details strip */}
          {driver && (
            <div className="crm-location-info-row">
              <div className="crm-location-info-col">
                <strong>Driver Name:</strong> {driver.name} {driver.lastName || driver.last_name || ""}
              </div>
              <div className="crm-location-info-col">
                <strong>Phone no.:</strong> {driver.number || driver.phone || "N/A"}
              </div>
              <div className="crm-location-info-col">
                <strong>Vehicle:</strong> {driver.vehicle_number || driver.vehicleNumber || "N/A"}
              </div>
              <div className="crm-location-info-col">
                <strong>Active Status:</strong>{" "}
                <span className={`crm-location-badge ${isOnline ? "online" : "offline"}`}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          )}

          {/* Map box */}
          <div
            ref={mapContainerRef}
            className="crm-location-map-box"
            style={{ width: "100%", height: "550px", position: "relative", zIndex: 1 }}
          />

          {/* Address Bar */}
          <div
            style={{
              marginTop: "16px",
              padding: "12px 18px",
              background: "var(--bg-panel)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              fontSize: "14px",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Navigation size={18} style={{ color: "var(--accent, #fca103)", flexShrink: 0 }} />
            <span>
              <strong>Current GPS Location:</strong> {loading ? "Fetching driver location..." : address}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
