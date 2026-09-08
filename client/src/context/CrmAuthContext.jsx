import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

const CrmAuthContext = createContext();

export function CrmAuthProvider({ children }) {
  const [subAdmin, setSubAdmin] = useState(() => {
    const saved = localStorage.getItem("subAdminUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("subAdminToken") || "");
  const [loading, setLoading] = useState(false);

  // Set default axios header for subadmin if token exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Sync latest subadmin profile from server on mount/token change
  useEffect(() => {
    async function syncSubAdminProfile() {
      const storedToken = localStorage.getItem("subAdminToken");
      const storedUser = localStorage.getItem("subAdminUser");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const subAdminId = parsedUser?._id || parsedUser?.id;

      try {
        const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
        const url = subAdminId
          ? `${API_BASE_URL}/subadmin-auth/profile?id=${subAdminId}`
          : `${API_BASE_URL}/subadmin-auth/profile`;

        const res = await axios.get(url, { headers });
        if (res.data && res.data.subAdmin) {
          localStorage.setItem("subAdminUser", JSON.stringify(res.data.subAdmin));
          setSubAdmin(res.data.subAdmin);
        }
      } catch (err) {
        // Keep offline cached user if request fails
      }
    }
    syncSubAdminProfile();
  }, [token]);

  const updateSubAdmin = (newSubAdmin) => {
    localStorage.setItem("subAdminUser", JSON.stringify(newSubAdmin));
    setSubAdmin(newSubAdmin);
  };

  const login = async (email, password, ipAddress) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/subadmin-auth/login`, {
        email,
        password,
        ip_address: ipAddress,
      });

      const { token: receivedToken, subAdmin: receivedSubAdmin } = res.data;

      localStorage.setItem("subAdminToken", receivedToken);
      localStorage.setItem("subAdminUser", JSON.stringify(receivedSubAdmin));

      setToken(receivedToken);
      setSubAdmin(receivedSubAdmin);

      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/subadmin-auth/register`, formData);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("subAdminToken");
    localStorage.removeItem("subAdminUser");
    setToken("");
    setSubAdmin(null);
  };

  return (
    <CrmAuthContext.Provider
      value={{ subAdmin, token, loading, login, register, logout, updateSubAdmin }}
    >
      {children}
    </CrmAuthContext.Provider>
  );
}

export function useCrmAuth() {
  return useContext(CrmAuthContext);
}
