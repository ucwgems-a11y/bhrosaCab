import { useEffect, useState } from "react";
import "./DashboardFooter.css";

export default function DashboardFooter() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Ticks every second so the displayed time stays live
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="dashboard-footer">
      <p>
        Copyright © Designed &amp; Developed by{" "}
        <a href="https://ritesh-portfolio-o6tp.onrender.com/" target="_blank" rel="noreferrer">
          Ritesh Gupta
        </a>{" "}
        2024 - {new Date().getFullYear()} | Current Time:{" "}
        {currentTime.toLocaleTimeString()}
      </p>
    </footer>
  );
}