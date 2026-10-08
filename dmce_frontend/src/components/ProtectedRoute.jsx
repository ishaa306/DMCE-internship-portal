import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Generic verify endpoint (students / TPO / TNP Co)
 * Admin is handled locally to avoid redirect loop
 */
const VERIFY_URL = "https://placement-portal-backend.ramshekade20.workers.dev/api/auth/verify";

/**
 * All auth-related keys (for clean logout / expiry)
 */
const AUTH_KEYS = [
  "adminAuthenticated",
  "isAuthenticated",
  "tpoAuthenticated",
  "tnpcoAuthenticated",
  "token",
  "tpo_token",
  "tnpco_token",
  "admin_email",
  "tpo_email",
  "tnpco_email",
  "gr_number",
  "loginTime",
  "login_time",
];

const clearAuthStorage = () => {
  try {
    AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.warn("Auth storage clear failed", err);
  }
};

const getCurrentTimestampIST = () => {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffsetMs);
  return istTime.toLocaleString("en-IN", { hour12: true });
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const checkAuth = async () => {
      try {
        /**
         * 1️⃣ ADMIN — TRUST LOCAL STORAGE ONLY
         * (Admin uses its own login flow)
         */
        if (localStorage.getItem("adminAuthenticated") === "true") {
          if (!mounted) return;
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        /**
         * 2️⃣ Local fallback for other roles
         */
        const localAuth =
          localStorage.getItem("isAuthenticated") === "true" ||
          localStorage.getItem("tpoAuthenticated") === "true" ||
          localStorage.getItem("tnpcoAuthenticated") === "true";

        if (!localAuth) {
          if (!mounted) return;
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        /**
         * 3️⃣ Server verification (students / TPO / TNP Co)
         */
        const resp = await fetch(VERIFY_URL, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!mounted) return;

        if (resp.status === 401) {
          clearAuthStorage();
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        if (!resp.ok) {
          setIsAuthenticated(localAuth);
          setIsLoading(false);
          return;
        }

        const data = await resp.json();
        setIsAuthenticated(Boolean(data?.authenticated));
      } catch (err) {
        console.warn("Auth verify failed:", err);

        // Network / timeout fallback
        const fallback =
          localStorage.getItem("adminAuthenticated") === "true" ||
          localStorage.getItem("isAuthenticated") === "true" ||
          localStorage.getItem("tpoAuthenticated") === "true" ||
          localStorage.getItem("tnpcoAuthenticated") === "true";

        setIsAuthenticated(fallback);
      } finally {
        clearTimeout(timeout);
        if (mounted) setIsLoading(false);
      }
    };

    checkAuth();

    return () => {
      mounted = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [location.pathname]);

  /**
   * ⏳ Loading screen
   */
  if (isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          fontFamily: "system-ui",
        }}
      >
        <h3 style={{ color: "#1e3a8a" }}>🔐 Verifying authentication…</h3>
        <small style={{ color: "#64748b" }}>{getCurrentTimestampIST()}</small>
      </div>
    );
  }

  /**
   * 🚫 Not authenticated → redirect to landing page
   */
  if (isAuthenticated === false) {
    const attempted = location.pathname + location.search;
    return (
      <Navigate
        to={`/?redirectTo=${encodeURIComponent(attempted)}`}
        replace
      />
    );
  }

  /**
   * ✅ Authenticated
   */
  return <>{children}</>;
};

export default ProtectedRoute;
