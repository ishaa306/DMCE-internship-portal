import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Endpoints for verifying user roles
 */
const API_BASE = "https://placement-portal-backend.ramshekade20.workers.dev/api";

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
         * (Admin uses its own dedicated local verification)
         */
        if (localStorage.getItem("adminAuthenticated") === "true") {
          if (!mounted) return;
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        /**
         * 2️⃣ Check role-specific authentication flags
         */
        const isTpo =
          localStorage.getItem("tpoAuthenticated") === "true" ||
          Boolean(localStorage.getItem("tpo_token"));
        const isTnpCo =
          localStorage.getItem("tnpcoAuthenticated") === "true" ||
          Boolean(localStorage.getItem("tnpco_token"));
        const isStudent =
          localStorage.getItem("isAuthenticated") === "true" ||
          Boolean(localStorage.getItem("token") || localStorage.getItem("gr_number"));

        const isTpoRoute = location.pathname.startsWith("/tpo");
        const isTnpCoRoute = location.pathname.startsWith("/tnpco");
        const isStudentRoute =
          location.pathname.startsWith("/student") ||
          location.pathname === "/student-dashboard";

        // If requesting a role-restricted route, ensure the respective role flag is present
        if (isTpoRoute && !isTpo) {
          if (!mounted) return;
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        if (isTnpCoRoute && !isTnpCo) {
          if (!mounted) return;
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const localAuth = isTpo || isTnpCo || isStudent;
        if (!localAuth) {
          if (!mounted) return;
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        /**
         * 3️⃣ Server verification with appropriate role endpoint & Bearer token
         */
        let verifyEndpoint = `${API_BASE}/auth/verify`;
        let token =
          localStorage.getItem("token") || localStorage.getItem("authToken");

        if (isTpoRoute || isTpo) {
          verifyEndpoint = `${API_BASE}/tpo-auth/verify`;
          token =
            localStorage.getItem("tpo_token") ||
            localStorage.getItem("token") ||
            token;
        } else if (isTnpCoRoute || isTnpCo) {
          verifyEndpoint = `${API_BASE}/tnp-auth/verify`;
          token =
            localStorage.getItem("tnpco_token") ||
            localStorage.getItem("token") ||
            token;
        }

        const headers = { Accept: "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const resp = await fetch(verifyEndpoint, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
          headers,
        });

        if (!mounted) return;

        if (resp.status === 401) {
          const data = await resp.json().catch(() => null);
          const isExplicitExpiredOrInvalid =
            data &&
            (data.error?.includes("Invalid") ||
              data.error?.includes("expired") ||
              data.error?.includes("Session expired"));

          if (isExplicitExpiredOrInvalid) {
            // Cleanly clear only credentials for this role
            if (isTpoRoute || isTpo) {
              localStorage.removeItem("tpoAuthenticated");
              localStorage.removeItem("tpo_token");
              localStorage.removeItem("tpo_email");
              localStorage.removeItem("tpo_name");
            } else if (isTnpCoRoute || isTnpCo) {
              localStorage.removeItem("tnpcoAuthenticated");
              localStorage.removeItem("tnpco_token");
              localStorage.removeItem("tnpco_email");
            } else {
              localStorage.removeItem("isAuthenticated");
              localStorage.removeItem("token");
              localStorage.removeItem("gr_number");
            }
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }

          // If cross-origin cookies were omitted by browser but local session exists, trust localAuth
          setIsAuthenticated(localAuth);
          setIsLoading(false);
          return;
        }

        if (!resp.ok) {
          setIsAuthenticated(localAuth);
          setIsLoading(false);
          return;
        }

        const data = await resp.json().catch(() => null);
        if (data && typeof data.authenticated === "boolean") {
          setIsAuthenticated(data.authenticated);
        } else {
          setIsAuthenticated(localAuth);
        }
      } catch (err) {
        console.warn("Auth verify network check failed:", err);

        // Network / timeout fallback: preserve existing active session
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
