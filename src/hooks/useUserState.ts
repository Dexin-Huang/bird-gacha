"use client";
import { useEffect, useState } from "react";
import { loc2state } from "@/lib/loc2state";

export function useUserState(defaultState = "Connecticut") {
  const [state, setState] = useState<string | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const s = loc2state(pos.coords.latitude, pos.coords.longitude);
        setState(s ?? defaultState);
      },
      () => setState(defaultState),        // geolocation blocked
      { maximumAge: 86400, timeout: 8000 }
    );
  }, [defaultState]);

  return state;
}
