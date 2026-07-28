"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { codeOf, emptyProfile } from "../lib/program-utils";

const PROFILE_KEY = "yokTercih.profile.v3";
const PREFS_KEY = "yokTercih.preferences.v3";
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [profile, setProfileState] = useState(emptyProfile);
  const [preferences, setPreferencesState] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const storedProfile = JSON.parse(
          localStorage.getItem(PROFILE_KEY) ||
            localStorage.getItem("yokTercih.profile.v2"),
        );
        const storedPreferences = JSON.parse(
          localStorage.getItem(PREFS_KEY) ||
            localStorage.getItem("yokTercih.preferences.v2"),
        );
        if (storedProfile) setProfileState(storedProfile);
        if (Array.isArray(storedPreferences)) setPreferencesState(storedPreferences);
      } catch {}
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const saveProfile = (next) => {
    setProfileState(next);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  };
  const savePreferences = (next) => {
    setPreferencesState(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  };
  const togglePreference = (program) => {
    const exists = preferences.some((item) => codeOf(item) === codeOf(program));
    if (!exists && preferences.length >= Number(profile.maxPrefs || 24))
      return {
        ok: false,
        message: `En fazla ${profile.maxPrefs || 24} tercih ekleyebilirsin.`,
      };
    savePreferences(
      exists
        ? preferences.filter((item) => codeOf(item) !== codeOf(program))
        : [...preferences, { ...program, _note: "" }],
    );
    return { ok: true };
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        preferences,
        ready,
        saveProfile,
        savePreferences,
        togglePreference,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp, AppProvider içinde kullanılmalıdır.");
  return value;
}
