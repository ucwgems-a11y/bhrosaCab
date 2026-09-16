import { useState, useMemo, useEffect } from "react";
import api from "../../../api/axios";
import { SERVER_URL } from "../../../config";
import {
  mediaArticles,
  getMonthYearGroup,
  formatDisplayDate,
  resolveMediaImage,
} from "./mediaArticlesData";
import {
  FaCalendarAlt,
  FaRegNewspaper,
  FaExternalLinkAlt,
  FaExpand,
  FaTimes,
  FaNewspaper,
} from "react-icons/fa";
import "./MediaCoverageFeed.css";

function MediaCoverageFeed() {
  const [currentView, setCurrentView] = useState(3); // Default: 3 columns grid
  const [lightboxData, setLightboxData] = useState(null); // { src, title }
  const [articlesList, setArticlesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dynamic media coverage articles from backend
  useEffect(() => {
    let isMounted = true;
    api
      .get("/media-coverages")
      .then((res) => {
        if (isMounted) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setArticlesList(res.data);
          } else {
            setArticlesList(mediaArticles);
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching media coverages:", err);
        if (isMounted) {
          setArticlesList(mediaArticles);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sort articles descending by date (latest on top)
  const sortedArticles = useMemo(() => {
    return [...articlesList].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [articlesList]);

  // Group by Month & Year based on date
  const groupedData = useMemo(() => {
    const map = {};
    sortedArticles.forEach((item) => {
      const mYear = getMonthYearGroup(item.date);
      if (!map[mYear]) {
        map[mYear] = [];
      }
      map[mYear].push(item);
    });
    return map;
  }, [sortedArticles]);

  // Helper to resolve full image URL (handles dynamic uploads and static bundle)
  const resolveCoverageImage = (item) => {
    if (!item) return "";
    const rawImage = item.image || item.filename || "";
    if (!rawImage) return "";
    if (
      rawImage.startsWith("http://") ||
      rawImage.startsWith("https://") ||
      rawImage.startsWith("data:")
    ) {
      return rawImage;
    }
    if (rawImage.startsWith("/uploads/")) {
      return `${SERVER_URL}${rawImage}`;
    }
    return resolveMediaImage(rawImage);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightboxData(null);
      }
    };
    if (lightboxData) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [lightboxData]);

  const viewLabel =
    currentView === 1
      ? "View: 1 Column"
      : currentView === 2
      ? "View: 2 Columns Grid"
      : "View: 3 Columns Grid (Default)";

  return (
    <main className="media-coverage-main">
      {/* Top Toolbar / Layout Switcher */}
      <div className="media-toolbar-row">
        <div className="media-toolbar-left">
          <div className="pulse-dot"></div>
          <div>
            <h5 className="media-toolbar-title">
              Latest Print &amp; Digital Coverage
            </h5>
            <small className="media-toolbar-subtitle">{viewLabel}</small>
          </div>
        </div>

        <div className="media-toolbar-right">
          <span className="media-count-badge">
            <FaNewspaper size={14} />
            <span>{sortedArticles.length} Newspaper Clippings</span>
          </span>

          {/* VIEW SWITCHER CONTROL */}
          <div className="view-switcher-group" aria-label="Layout switcher">
            {/* 3 Columns Grid View (DEFAULT) */}
            <button
              type="button"
              className={`view-btn ${currentView === 3 ? "active" : ""}`}
              onClick={() => setCurrentView(3)}
              title="3 Columns View (Default)"
              aria-label="3 Columns View"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2.5" y="2.5" width="4.8" height="4.8" rx="1.2" />
                <rect x="9.6" y="2.5" width="4.8" height="4.8" rx="1.2" />
                <rect x="16.7" y="2.5" width="4.8" height="4.8" rx="1.2" />
                <rect x="2.5" y="9.6" width="4.8" height="4.8" rx="1.2" />
                <rect x="9.6" y="9.6" width="4.8" height="4.8" rx="1.2" />
                <rect x="16.7" y="9.6" width="4.8" height="4.8" rx="1.2" />
                <rect x="2.5" y="16.7" width="4.8" height="4.8" rx="1.2" />
                <rect x="9.6" y="16.7" width="4.8" height="4.8" rx="1.2" />
                <rect x="16.7" y="16.7" width="4.8" height="4.8" rx="1.2" />
              </svg>
            </button>

            {/* 2 Columns Grid View */}
            <button
              type="button"
              className={`view-btn ${currentView === 2 ? "active" : ""}`}
              onClick={() => setCurrentView(2)}
              title="2 Columns View"
              aria-label="2 Columns View"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7.5" height="7.5" rx="1.8" />
                <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8" />
                <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8" />
                <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8" />
              </svg>
            </button>

            {/* 1 Column View */}
            <button
              type="button"
              className={`view-btn ${currentView === 1 ? "active" : ""}`}
              onClick={() => setCurrentView(1)}
              title="1 Column View"
              aria-label="1 Column View"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M5 6.5A2.5 2.5 0 0 1 7.5 4H11.5v16H7.5A2.5 2.5 0 0 1 5 17.5V6.5z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* FEED CONTAINER */}
      <div className={`media-feed-container layout-view-${currentView}`}>
        {Object.entries(groupedData).map(([monthYear, items]) => (
          <div key={monthYear} className="month-section-wrap">
            {/* Month-Year Header Divider */}
            <div className="month-group-header">
              <div className="month-divider-line"></div>
              <span className="month-year-badge">
                <FaCalendarAlt />
                <span>{monthYear}</span>
              </span>
            </div>

            {/* Grid of Articles in this Month */}
            <div className="media-month-grid">
              {items.map((item, index) => {
                const resolvedSrc = resolveCoverageImage(item);
                const displayDateStr = formatDisplayDate(item.date, item.displayDate);
                const sourceName = item.newspaper || item.title || "भरोसा कैब";

                return (
                  <article className="media-card" key={item._id || item.id || `${item.date}-${index}`}>
                    {/* Date & Newspaper Header Bar */}
                    <div className="media-date-bar">
                      <span className="media-date-text">
                        <FaCalendarAlt />
                        <span>{displayDateStr}</span>
                      </span>
                      <span className="media-newspaper-source">
                        <FaRegNewspaper />
                        <span>
                          {sourceName}{" "}
                          {item.city ? `(${item.city})` : ""}
                        </span>
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="media-card-body">
                      {/* Image with zoom lightbox */}
                      <div
                        className="media-image-wrapper"
                        onClick={() =>
                          setLightboxData({
                            src: resolvedSrc,
                            title: `${sourceName} - ${displayDateStr}`,
                          })
                        }
                      >
                        <img
                          src={resolvedSrc}
                          alt={`${sourceName} ${displayDateStr}`}
                          loading="lazy"
                        />
                        <div className="image-zoom-overlay">
                          <FaExpand />
                          <span>Click to Zoom &amp; View Full</span>
                        </div>
                      </div>

                      {/* Title / Headline (if distinct) */}
                      {item.title && item.title !== item.newspaper && (
                        <h6 className="media-card-title fw-bold mt-2 mb-1">{item.title}</h6>
                      )}

                      {/* Description (if present) */}
                      {item.description && (
                        <p className="media-description">{item.description}</p>
                      )}

                      {/* Link (if present) */}
                      {item.link && (
                        <div className="media-action-wrapper">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-read-more"
                          >
                            <span>
                              {item.linkText || "ई-पेपर / खबर पढ़ें"}
                            </span>
                            <FaExternalLinkAlt size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* LIGHTBOX MODAL POPUP */}
      {lightboxData && (
        <div
          className="lightbox-modal-backdrop"
          onClick={() => setLightboxData(null)}
        >
          <div
            className="lightbox-white-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Actions: Full Size View Button + Close Button */}
            <div className="lightbox-top-actions">
              <a
                href={lightboxData.src}
                target="_blank"
                rel="noopener noreferrer"
                className="lightbox-view-full-btn"
                title="Open full image in new tab"
              >
                <FaExpand />
                <span>Full Size</span>
              </a>
              <button
                type="button"
                className="lightbox-close-circle-btn"
                onClick={() => setLightboxData(null)}
                aria-label="Close"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Image Wrapper */}
            <div className="lightbox-img-wrapper">
              <img
                src={lightboxData.src}
                alt={lightboxData.title || "Full view"}
                className="lightbox-popup-img"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default MediaCoverageFeed;

