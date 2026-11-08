"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  analyzePayoff,
  estimateShortMargin,
  netPremium,
  type OptionLeg,
} from "@/lib/options";

export const STARTING_CAPITAL = 1_000_000;

export interface SimLeg extends OptionLeg {
  type: "call" | "put";
  qty: number;
  multiplier: number;
  iv: number;
  expiryDays: number;
}

export interface SimPosition {
  id: string;
  underlying: string;
  name: string;
  currency: "INR" | "USD";
  lotSize: number;
  openedAt: string;
  openedDay: number;
  expiryDays: number;
  legs: SimLeg[];
  entryPremium: number;
  marginReserved: number;
  spotAtOpen: number;
  maxProfit: number;
  maxLoss: number;
}

export interface SimTrade {
  id: string;
  underlying: string;
  name: string;
  legs: SimLeg[];
  openedAt: string;
  closedAt: string;
  pnl: number;
  exitCashFlow: number;
  spotAtClose: number;
  note?: string;
}

interface OpenPositionInput {
  underlying: string;
  name: string;
  currency: "INR" | "USD";
  lotSize: number;
  expiryDays: number;
  legs: SimLeg[];
  spotAtOpen: number;
}

interface SimulatorState {
  startingCapital: number;
  cash: number;
  reservedMargin: number;
  simDay: number;
  positions: SimPosition[];
  history: SimTrade[];
  lastMessage: string | null;
  openPosition: (input: OpenPositionInput) => { ok: boolean; error?: string };
  closePosition: (id: string, exitCashFlow: number, spotAtClose: number, note?: string) => void;
  advanceDay: (spotLookup: (symbol: string, day: number) => number) => void;
  clearMessage: () => void;
  reset: () => void;
}

export const useSimulatorStore = create<SimulatorState>()(
  persist(
    (set, get) => ({
      startingCapital: STARTING_CAPITAL,
      cash: STARTING_CAPITAL,
      reservedMargin: 0,
      simDay: 0,
      positions: [],
      history: [],
      lastMessage: null,

      openPosition: (input) => {
        if (!input.legs.length) {
          return { ok: false, error: "Add at least one leg to open a position." };
        }
        const entryPremium = netPremium(input.legs);
        const marginReserved = input.legs.reduce((total, leg) => {
          if (leg.side !== "short") return total;
          return (
            total +
            estimateShortMargin({
              spot: input.spotAtOpen,
              strike: leg.strike,
              premium: leg.premium,
              type: leg.type,
              multiplier: leg.multiplier,
              qty: leg.qty,
            })
          );
        }, 0);
        const totalCost = entryPremium + marginReserved;
        const state = get();
        if (totalCost > state.cash) {
          return {
            ok: false,
            error: `This position needs ${Math.round(totalCost).toLocaleString("en-IN")} including premium and estimated margin, but only ${Math.round(state.cash).toLocaleString("en-IN")} cash is available.`,
          };
        }
        const analysis = analyzePayoff(input.legs, {
          daysElapsed: input.expiryDays,
          upper: input.spotAtOpen * 2,
          lower: 0,
        });
        const position: SimPosition = {
          id: `pos_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          ...input,
          openedAt: new Date().toISOString(),
          openedDay: state.simDay,
          entryPremium,
          marginReserved,
          maxProfit: analysis.maxProfit,
          maxLoss: analysis.maxLoss,
        };
        set({
          positions: [position, ...state.positions],
          cash: state.cash - totalCost,
          reservedMargin: state.reservedMargin + marginReserved,
          lastMessage: "Simulated position opened. No real order was placed.",
        });
        return { ok: true };
      },

      closePosition: (id, exitCashFlow, spotAtClose, note) => {
        const state = get();
        const position = state.positions.find((item) => item.id === id);
        if (!position) return;
        const pnl = exitCashFlow - position.entryPremium;
        set({
          positions: state.positions.filter((item) => item.id !== id),
          cash: state.cash + exitCashFlow + position.marginReserved,
          reservedMargin: Math.max(0, state.reservedMargin - position.marginReserved),
          history: [
            {
              id: `trade_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              underlying: position.underlying,
              name: position.name,
              legs: position.legs,
              openedAt: position.openedAt,
              closedAt: new Date().toISOString(),
              pnl,
              exitCashFlow,
              spotAtClose,
              note,
            },
            ...state.history,
          ],
          lastMessage: "Simulated position closed. No real order was placed.",
        });
      },

      advanceDay: () => {
        set((state) => ({ simDay: state.simDay + 1, lastMessage: "Simulated market advanced by one day." }));
      },

      clearMessage: () => set({ lastMessage: null }),

      reset: () =>
        set({
          startingCapital: STARTING_CAPITAL,
          cash: STARTING_CAPITAL,
          reservedMargin: 0,
          simDay: 0,
          positions: [],
          history: [],
          lastMessage: "Paper-trading account reset to ₹10,00,000.",
        }),
    }),
    {
      name: "options-lab-simulator-v1",
      version: 1,
      skipHydration: true,
      partialize: (state) => ({
        startingCapital: state.startingCapital,
        cash: state.cash,
        reservedMargin: state.reservedMargin,
        simDay: state.simDay,
        positions: state.positions,
        history: state.history,
      }),
    },
  ),
);
