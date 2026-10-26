"use client";

import { useEffect, useState } from "react";
import { AUTH_CHANGE_EVENT } from "../lib/auth";

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("token"));
      setIsReady(true);
    };

    syncToken();
    window.addEventListener(AUTH_CHANGE_EVENT, syncToken);
    window.addEventListener("storage", syncToken);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncToken);
      window.removeEventListener("storage", syncToken);
    };
  }, []);

  return { token, isReady };
}
