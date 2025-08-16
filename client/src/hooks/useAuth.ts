import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  userType: "student" | "teacher";
  firstName: string;
  lastName?: string;
  profileImage?: string;
  mobile?: string;
}

interface Profile {
  id: string;
  // Student profile fields
  class?: string;
  schoolName?: string;
  // Teacher profile fields
  subjects?: string[];
  bio?: string;
  qualification?: string;
  experience?: number;
  city?: string;
  isVerified?: boolean;
  rating?: string;
  studentCount?: number;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    // Clean check for token on initialization
    const storedToken = localStorage.getItem("token");
    if (storedToken && storedToken !== "null" && storedToken !== "undefined") {
      return storedToken;
    }
    localStorage.removeItem("token");
    return null;
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    // Clear invalid tokens immediately to prevent loops
    if (error && (error.message.includes("401") || error.message.includes("Invalid token"))) {
      console.log("Clearing invalid token");
      setToken(null);
      localStorage.removeItem("token");
    }
  }, [error]);

  const login = (newToken: string) => {
    if (newToken && newToken !== "null" && newToken !== "undefined") {
      setToken(newToken);
      localStorage.setItem("token", newToken);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    // Force page reload to ensure complete logout
    window.location.href = "/";
  };

  // Don't show loading if there's no token
  const shouldShowLoading = isLoading && !!token;

  return {
    user: (data as any)?.user as User | null,
    profile: (data as any)?.profile as Profile | null,
    isLoading: shouldShowLoading,
    isAuthenticated: !!(data as any)?.user && !!token,
    token,
    login,
    logout,
  };
}
