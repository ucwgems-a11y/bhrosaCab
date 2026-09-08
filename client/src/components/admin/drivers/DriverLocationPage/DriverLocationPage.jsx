import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Phone, Navigation } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../../../api/axios";
import "./DriverLocationPage.css";

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
    .replace(/[\u0900-\u097F]/g, "") // remove any Hindi/Devanagari characters
    .replace(/\s*,\s*,+/g, ",")
    .replace(/^\s*,\s*/, "")
    .replace(/\s*,\s*$/, "")
    .trim();
}

export default function DriverLocationPage() {
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
            // Force English language only in geocoding API
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`,
              {
                headers: {
                  "Accept-Language": "en",
                  "User-Agent": "BhrosaCabAdmin/1.0",
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
        console.error("Failed to fetch driver location:", err);
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
          <strong>Vehicle:</strong> ${driver.vehicle_number || "N/A"} (${driver.brand || ""} ${driver.model || ""})
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
        markerRef.current.getPopup().setContent(popupHtml);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [driver, address]);

  return (
    <div style={{ padding: "8px 12px" }}>
      <div
        className="driver-live-location-container"
        style={{
          background: "var(--bg-card, #1c202a)",
          borderRadius: "14px",
          border: "1px solid var(--border-color, rgba(255, 255, 255, 0.08))",
          padding: "24px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Top Header: Title & Back Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--text-primary, #ffffff)",
            }}
          >
            Driver Live Location
          </h2>

          <button
            type="button"
            onClick={() => navigate(`/admin/drivers/profile/${id}`)}
            style={{
              background: "var(--accent, #fd683e)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "13.5px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(253, 104, 62, 0.35)",
              transition: "transform 0.1s ease",
            }}
          >
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>
        </div>

        {/* Info Row: Driver Name, Mobile, Vehicle, Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "36px",
            marginBottom: "20px",
            flexWrap: "wrap",
            fontSize: "14.5px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <strong style={{ color: "var(--text-muted, #94a3b8)" }}>Driver Name :</strong>
            <span
              style={{
                fontWeight: 600,
                color: "var(--text-primary, #ffffff)",
                marginLeft: "6px",
              }}
            >
              {loading ? "Loading..." : driver?.name || "N/A"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <strong style={{ color: "var(--text-muted, #94a3b8)" }}>Mobile :</strong>
            <span
              style={{
                fontWeight: 600,
                color: "var(--text-primary, #ffffff)",
                marginLeft: "6px",
              }}
            >
              {loading ? "..." : driver?.number || driver?.phone || "N/A"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <strong style={{ color: "var(--text-muted, #94a3b8)" }}>Vehicle :</strong>
            <span
              style={{
                fontWeight: 600,
                color: "var(--text-primary, #ffffff)",
                marginLeft: "6px",
              }}
            >
              {loading ? "..." : driver?.vehicle_number || "N/A"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <strong style={{ color: "var(--text-muted, #94a3b8)" }}>Status :</strong>
            <span
              style={{
                background: driver?.active_status === 1 ? "#22c55e" : "#64748b",
                color: "#ffffff",
                borderRadius: "20px",
                padding: "3px 14px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.3px",
                display: "inline-block",
              }}
            >
              {driver?.active_status === 1 ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div
          id="map"
          ref={mapContainerRef}
          style={{
            height: "580px",
            width: "100%",
            borderRadius: "10px",
            overflow: "hidden",
            border: "1px solid var(--border-color, rgba(255, 255, 255, 0.1))",
            position: "relative",
            boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
            zIndex: 1,
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}
