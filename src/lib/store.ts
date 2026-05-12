"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type User } from "@supabase/supabase-js";
import { type Profile, type Country } from "./data";
import { computeProfile, getMatches } from "./matching";
import { createClient, isSupabaseConfigured } from "./supabase/client";

type QuizStore = {
  answers: (number | undefined)[];
  profile: Profile | null;
  matches: Country[];
  saved: string[];
  query: string;

  setAnswer: (index: number, value: number) => void;
  computeAndSave: () => void;
  setFromAI: (profile: Profile, matches: Country[], query: string) => void;
  toggleSaved: (code: string) => void;
  reset: () => void;

  // Supabase sync
  syncToSupabase: (user: User) => Promise<void>;
  loadFromSupabase: (user: User) => Promise<void>;
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      answers: Array(8).fill(undefined),
      profile: null,
      matches: [],
      saved: [],
      query: "",

      setAnswer: (index, value) =>
        set((state) => {
          const answers = [...state.answers];
          answers[index] = value;
          return { answers };
        }),

      computeAndSave: () => {
        const { answers } = get();
        const profile = computeProfile(answers);
        const matches = getMatches(profile);
        set({ profile, matches });
      },

      setFromAI: (profile, matches, query) => {
        set({ profile, matches, query });
      },

      toggleSaved: async (code) => {
        set((state) => ({
          saved: state.saved.includes(code)
            ? state.saved.filter((c) => c !== code)
            : [...state.saved, code],
        }));

        if (!isSupabaseConfigured()) return;

        // Sync save state to Supabase if logged in
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { saved } = get();
        if (saved.includes(code)) {
          await supabase
            .from("saved_countries")
            .upsert({ user_id: user.id, country_code: code });
        } else {
          await supabase
            .from("saved_countries")
            .delete()
            .eq("user_id", user.id)
            .eq("country_code", code);
        }
      },

      reset: () =>
        set({
          answers: Array(8).fill(undefined),
          profile: null,
          matches: [],
          query: "",
        }),

      // Push local profile + saved to Supabase (called after sign-in)
      syncToSupabase: async (user: User) => {
        const { profile, answers, saved } = get();
        if (!profile || !isSupabaseConfigured()) return;

        const supabase = createClient();

        // Save quiz profile
        await supabase.from("user_profiles").upsert({
          user_id: user.id,
          pace: profile.pace,
          environment: profile.environment,
          culture: profile.culture,
          adventure: profile.adventure,
          food: profile.food,
          budget: profile.budget,
          climate: profile.climate,
          answers: answers,
          updated_at: new Date().toISOString(),
        });

        // Save saved countries
        if (saved.length > 0) {
          await supabase.from("saved_countries").upsert(
            saved.map((code) => ({ user_id: user.id, country_code: code }))
          );
        }
      },

      // Pull profile + saved from Supabase (called on sign-in if no local profile)
      loadFromSupabase: async (user: User) => {
        if (!isSupabaseConfigured()) return;
        const supabase = createClient();

        const [profileRes, savedRes] = await Promise.all([
          supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single(),
          supabase
            .from("saved_countries")
            .select("country_code")
            .eq("user_id", user.id),
        ]);

        if (profileRes.data) {
          const { pace, environment, culture, adventure, food, budget, climate, answers } =
            profileRes.data;
          const profile: Profile = { pace, environment, culture, adventure, food, budget, climate };
          const matches = getMatches(profile);
          set({
            profile,
            matches,
            answers: answers ?? Array(8).fill(undefined),
            saved: savedRes.data?.map((r: { country_code: string }) => r.country_code) ?? [],
          });
        }
      },
    }),
    { name: "no-destination-quiz" }
  )
);
