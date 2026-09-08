import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../../../api/axios";

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

export default function UserLocationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("Fetching location details...");

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      try {
        const res = await api.get(`/users/${id}`);
        if (res.data && res.data.user) {
          const u = res.data.user;
          setUser(u);

          const lat = u.location?.latitude || u.latitude || 28.6139;
          const lng = u.location?.longitude || u.longitude || 77.2090;

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
        console.error("Failed to fetch user location:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchUserData();
    }
  }, [id]);

  useEffect(() => {
    if (!mapContainerRef.current || !user) return;

    const lat = user.location?.latitude || user.latitude || 28.6139;
    const lng = user.location?.longitude || user.longitude || 77.2090;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const popupHtml = `
        <div style="min-width:260px; max-width:320px; font-family: inherit;">
          <b style="font-size:15px; color: #0f172a;">
            👤 ${user.name || "User"}
          </b>
          <hr style="margin:6px 0; border: 0; border-top: 1px solid #e2e8f0;">
          <b style="color: #0f172a; font-size: 13px;">Current Location</b>
          <div style="color: #334155; font-size: 12px; line-height: 1.5; margin-top: 3px;">
            ${address}
          </div>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: defaultMarkerIcon })
        .addTo(map)
        .bindPopup(popupHtml, { autoClose: false, closeOnClick: false })
        .openPopup();

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      mapInstanceRef.current.setView([lat, lng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        const popupHtml = `
          <div style="min-width:260px; max-width:320px; font-family: inherit;">
            <b style="font-size:15px; color: #0f172a;">
              👤 ${user.name || "User"}
            </b>
            <hr style="margin:6px 0; border: 0; border-top: 1px solid #e2e8f0;">
            <b style="color: #0f172a; font-size: 13px;">Current Location</b>
            <div style="color: #334155; font-size: 12px; line-height: 1.5; margin-top: 3px;">
              ${address}
            </div>
          </div>
        `;
        markerRef.current.setPopupContent(popupHtml).openPopup();
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [user, address]);

  return (
    <div style={{ padding: "10px", width: "100%", boxSizing: "border-box" }}>
      <div
        style={{
          background: "var(--bg-card, #1a222d)",
          borderRadius: "14px",
          padding: "24px",
          border: "1px solid var(--border-color, #2a3441)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Header Bar: Title on Left, Back Button on Right */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "nowrap",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--text-main, #ffffff)",
            }}
          >
            User Live Location
          </h2>

          <button
            type="button"
            onClick={() => navigate(`/admin/users/${id}`)}
            style={{
              background: "#ff9800",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "7px 18px",
              fontSize: "13.5px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(255, 152, 0, 0.35)",
              transition: "transform 0.1s ease",
            }}
          >
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>
        </div>

        {/* Info Row: User Name, Mobile, Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "36px",
            marginBottom: "20px",
            flexWrap: "wrap",
            fontSize: "15px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <strong style={{ color: "var(--text-muted, #94a3b8)" }}>User Name :</strong>
            <span
              style={{
                fontWeight: 600,
                color: "var(--text-primary, #ffffff)",
                marginLeft: "6px",
              }}
            >
              {loading ? "Loading..." : user?.name || "N/A"}
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
              {loading ? "..." : user?.phone || "N/A"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <strong style={{ color: "var(--text-muted, #94a3b8)" }}>Status :</strong>
            <span
              style={{
                background: user?.isActive !== false ? "#22c55e" : "#64748b",
                color: "#ffffff",
                borderRadius: "20px",
                padding: "3px 14px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.3px",
                display: "inline-block",
              }}
            >
              {user?.isActive !== false ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div
          id="map"
          ref={mapContainerRef}
          style={{
            height: "600px",
            width: "100%",
            borderRadius: "10px",
            overflow: "hidden",
            border: "1px solid var(--border-color, #334155)",
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
