"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

/* ---------------- Types ---------------- */
interface TicketsContextValue {
  /** current ticket count */
  tickets: number;
  /** supports functional updates */
  setTickets: React.Dispatch<React.SetStateAction<number>>;
  /** returns true if reward granted */
  claimDailyReward: () => boolean;
  /** ms until next reward (0 if ready) */
  timeUntilNextReward: () => number;
}

/* ------------- Context --------------- */
const TicketsContext = createContext<TicketsContextValue | undefined>(
  undefined,
);

/* ------------- Hook ------------------ */
export const useTickets = () => {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be inside <TicketsProvider />");
  return ctx;
};

/* ------------- Provider -------------- */
export const TicketsProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [tickets, setTickets] = useState(0);
  const [lastRewardISO, setLastRewardISO] = useState<string | null>(null);

  /* initialise from localStorage ------------------ */
  useEffect(() => {
    const stored = Number(localStorage.getItem("tickets"));
    setTickets(Number.isFinite(stored) ? stored : 10);

    const last = localStorage.getItem("lastRewardDate");
    if (last) setLastRewardISO(last);
  }, []);

  /* persist tickets ------------------------------- */
  useEffect(() => {
    localStorage.setItem("tickets", tickets.toString());
  }, [tickets]);

  /* persist last reward --------------------------- */
  useEffect(() => {
    if (lastRewardISO) localStorage.setItem("lastRewardDate", lastRewardISO);
  }, [lastRewardISO]);

  /* helpers --------------------------------------- */
  const canClaimToday = useCallback(() => {
    if (!lastRewardISO) return true;
    const last = new Date(lastRewardISO);
    const now = new Date();
    return (
      last.getFullYear() !== now.getFullYear() ||
      last.getMonth() !== now.getMonth() ||
      last.getDate() !== now.getDate()
    );
  }, [lastRewardISO]);

  const claimDailyReward = () => {
    if (!canClaimToday()) return false;
    setTickets((t) => t + 5);
    setLastRewardISO(new Date().toISOString());
    return true;
  };

  const timeUntilNextReward = () => {
    if (canClaimToday()) return 0;
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    return nextMidnight.getTime() - now.getTime();
  };

  return (
    <TicketsContext.Provider
      value={{ tickets, setTickets, claimDailyReward, timeUntilNextReward }}
    >
      {children}
    </TicketsContext.Provider>
  );
};

/* ------------- default export -------- */
export default TicketsContext;
