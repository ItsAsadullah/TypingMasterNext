"use client";

/**
 * useProgress — unified progress tracking for signed-in users (DB) and guests (localStorage)
 *
 * Provides:
 *   completedDrills  — Set<drillId>  (which drills the user has finished)
 *   lastPosition     — { drillId, lessonId, modId } | null
 *   isLoaded         — true once initial data is ready (avoid flash)
 *   markComplete     — (drillId, lessonId, modId) => void
 *   savePosition     — (drillId, lessonId, modId) => void  [debounced to avoid spam]
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

const LS_COMPLETED = "tm-completed-drills";
const LS_POSITION  = "tm-last-position";

export interface ProgressPosition {
  drillId:  string;
  lessonId: string;
  modId:    string;
}

interface UseProgressResult {
  completedDrills: Set<string>;
  lastPosition:    ProgressPosition | null;
  isLoaded:        boolean;
  markComplete:    (drillId: string, lessonId: string, modId: string) => void;
  savePosition:    (drillId: string, lessonId: string, modId: string) => void;
}

// ─── localStorage helpers ─────────────────────────────────────────────────

function lsGetCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_COMPLETED);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch { return new Set(); }
}

function lsSetCompleted(set: Set<string>) {
  try { localStorage.setItem(LS_COMPLETED, JSON.stringify([...set])); } catch { /* ignore */ }
}

function lsGetPosition(): ProgressPosition | null {
  try {
    const raw = localStorage.getItem(LS_POSITION);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function lsSetPosition(p: ProgressPosition) {
  try { localStorage.setItem(LS_POSITION, JSON.stringify(p)); } catch { /* ignore */ }
}

// ─── internal state shape ─────────────────────────────────────────────────

interface ProgressState {
  completedDrills: Set<string>;
  lastPosition:    ProgressPosition | null;
  isLoaded:        boolean;
}

const INITIAL_STATE: ProgressState = {
  completedDrills: new Set(),
  lastPosition:    null,
  isLoaded:        false,
};

// ─── hook ─────────────────────────────────────────────────────────────────

export function useProgress(): UseProgressResult {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated" && !!session?.user;

  // Single combined state object → one setState call per effect run (no cascading renders)
  const [progressState, setProgressState] = useState<ProgressState>(INITIAL_STATE);

  // Debounce position saves to API (avoid calling on every keystroke)
  const positionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load initial data ───────────────────────────────────────────────────
  useEffect(() => {
    if (status === "loading") return; // wait for session

    if (isSignedIn) {
      // Signed-in: fetch from API
      fetch("/api/progress")
        .then(r => r.ok ? r.json() : null)
        .then((data: { completedDrills?: string[]; lastPosition?: ProgressPosition | null } | null) => {
          setProgressState({
            completedDrills: new Set<string>(data?.completedDrills ?? []),
            lastPosition:    data?.lastPosition ?? null,
            isLoaded:        true,
          });
        })
        .catch(() => setProgressState(s => ({ ...s, isLoaded: true })));
    } else {
      // Guest: load from localStorage (queueMicrotask avoids sync-setState lint warning)
      queueMicrotask(() => {
        setProgressState({
          completedDrills: lsGetCompleted(),
          lastPosition:    lsGetPosition(),
          isLoaded:        true,
        });
      });
    }
  }, [isSignedIn, status]);

  // ── markComplete ────────────────────────────────────────────────────────
  const markComplete = useCallback((drillId: string, lessonId: string, modId: string) => {
    const newPos = { drillId, lessonId, modId };

    // 1. Update React state with a PURE updater — no side effects inside
    setProgressState(prev => {
      if (prev.completedDrills.has(drillId)) {
        return { ...prev, lastPosition: newPos };
      }
      const next = new Set(prev.completedDrills);
      next.add(drillId);
      return { ...prev, completedDrills: next, lastPosition: newPos };
    });

    // 2. Persist to storage OUTSIDE the updater (side effects must not live inside updaters;
    //    React StrictMode double-invokes updaters which would cause duplicate writes)
    if (!isSignedIn) {
      const saved = lsGetCompleted(); // read current LS state
      saved.add(drillId);             // add new completion
      lsSetCompleted(saved);          // write back atomically
      lsSetPosition(newPos);
      return;
    }

    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "complete", drillId, lessonId, modId }),
    }).catch(() => {/* silent */});
  }, [isSignedIn]);

  // ── savePosition ────────────────────────────────────────────────────────
  const savePosition = useCallback((drillId: string, lessonId: string, modId: string) => {
    const newPos: ProgressPosition = { drillId, lessonId, modId };
    setProgressState(prev => ({ ...prev, lastPosition: newPos }));

    if (!isSignedIn) {
      lsSetPosition(newPos);
      return;
    }

    // Debounce API calls — save 1 second after last call
    if (positionTimer.current) clearTimeout(positionTimer.current);
    positionTimer.current = setTimeout(() => {
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "position", drillId, lessonId, modId }),
      }).catch(() => {/* silent */});
    }, 1000);
  }, [isSignedIn]);

  return {
    completedDrills: progressState.completedDrills,
    lastPosition:    progressState.lastPosition,
    isLoaded:        progressState.isLoaded,
    markComplete,
    savePosition,
  };
}
