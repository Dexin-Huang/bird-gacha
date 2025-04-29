/* ------------------------------------------------------------------
   TicketsContext – server-authoritative tickets & daily reward
   ------------------------------------------------------------------ */
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

/* ---------- Public shape ---------- */
interface TicketsContextValue {
  /** current ticket balance */
  tickets: number;
  /** functional updates allowed */
  setTickets: React.Dispatch<React.SetStateAction<number>>;
  /** POST /api/tickets → true if reward granted */
  claimDailyReward: () => Promise<boolean>;
  /** ms until next reward - null while booting */
  timeUntilNextReward: () => number | null;
}

/* ---------- Context / hook ---------- */
const TicketsContext = createContext<TicketsContextValue | undefined>(
  undefined,
);

export const useTickets = () => {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be inside <TicketsProvider>");
  return ctx;
};

/* ---------- Provider ---------- */
export const TicketsProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [tickets, setTickets]         = useState(0);
  const [lastRewardISO, setLastISO]   = useState<string | null>(null);
  const [booted, setBooted]           = useState(false);

  /* ----- initial fetch ----- */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/tickets", { cache: "no-store" });
        const json = await res.json();
        setTickets(json.tickets ?? 0);
        if (json.lastRewardISO) setLastISO(json.lastRewardISO);
      } catch {
        // very first visit or network offline
        setTickets(10);
      } finally {
        setBooted(true);
      }
    })();
  }, []);

  /* ----- claim reward ----- */
  const claimDailyReward = useCallback(async () => {
    try {
      const res  = await fetch("/api/tickets", { method: "POST" });
      if (!res.ok) return false;

      const { tickets: newBal, granted, lastRewardISO: ts } = await res.json();
      setTickets(newBal);
      if (granted && ts) setLastISO(ts);
      return granted;
    } catch {
      return false;
    }
  }, []);

  /* ----- countdown helper ----- */
  const timeUntilNextReward = useCallback((): number | null => {
    if (!booted) return null;                 // not ready yet
    if (!lastRewardISO) return 0;             // never claimed
    const last = new Date(lastRewardISO);
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    return Math.max(0, next.getTime() - Date.now());
  }, [lastRewardISO, booted]);

  return (
    <TicketsContext.Provider
      value={{ tickets, setTickets, claimDailyReward, timeUntilNextReward }}
    >
      {children}
    </TicketsContext.Provider>
  );
};

export default TicketsContext;
