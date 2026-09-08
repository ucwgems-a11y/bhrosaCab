import { Navigate, Outlet } from "react-router-dom";
import { useCrmAuth } from "../context/CrmAuthContext";

export default function CrmProtectedRoute({ children }) {
  const { subAdmin, token } = useCrmAuth();

  const isAuth = Boolean(subAdmin || token);

  if (!isAuth) {
    return <Navigate to="/crm-login" replace />;
  }

  return children ? children : <Outlet />;
}
