import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../services/AuthContext";

export default function ProtectedRoute() {

  const {
    user,
    loading,
  } = useAuth();

  if (loading) {

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-slate-500">
          Vérification de la session...
        </div>
      </div>
    );
  }

  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
}