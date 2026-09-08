import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem("adminData");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    async function syncAdminProfile() {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      try {
        const res = await api.get("/auth/profile");
        if (res.data && res.data.admin) {
          localStorage.setItem("adminData", JSON.stringify(res.data.admin));
          setAdmin(res.data.admin);
        }
      } catch (err) {
        console.warn("Could not sync fresh admin profile:", err.message);
      }
    }
    syncAdminProfile();
  }, []);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("adminToken", res.data.token);
    localStorage.setItem("adminData", JSON.stringify(res.data.admin));
    setAdmin(res.data.admin);
  }

  function logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    setAdmin(null);
  }

  function updateAdmin(newAdminData) {
    localStorage.setItem("adminData", JSON.stringify(newAdminData));
    setAdmin(newAdminData);
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout, updateAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);