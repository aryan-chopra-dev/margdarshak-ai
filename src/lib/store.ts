// Zustand store for user profile, LRS score, and app state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  stage: 'explorer' | 'planner' | 'converter';
  targetCountry: string;
  targetField: string;
  degree: 'masters' | 'mba' | 'phd' | 'bachelors';
  gpa: number;
  greScore: number;
  toeflScore: number;
  ieltsScore: number;
  workExperience: number;
  budget: number; // in USD
  hasResearch: boolean;
  shortlistedUniversities: string[];
  // Co-applicant (parent)
  parentName: string;
  parentPhone: string;
  parentIncome: number;
  parentOccupation: string;
  // Documents
  docsUploaded: string[];
  // KYC
  kycVerified: boolean;
}

export interface LRSState {
  score: number; // 300-850
  breakdown: {
    profileCompleteness: number;    // 0-100, weight: 25%
    documentReadiness: number;      // 0-100, weight: 25%
    coApplicantDetails: number;     // 0-100, weight: 20%
    universityShortlist: number;    // 0-100, weight: 15%
    engagementSignal: number;       // 0-100, weight: 15%
  };
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  login: (name: string, email: string, phone: string) => void;
  logout: () => void;

  // User
  profile: UserProfile;
  isOnboarded: boolean;
  setProfile: (updates: Partial<UserProfile>) => void;
  setOnboarded: (val: boolean) => void;

  // LRS
  lrs: LRSState;
  updateLRS: () => void;

  // Intent
  intentScore: number;
  addIntentEvent: (points: number) => void;

  // Streaks
  streakDays: number;
  lastVisit: string;
  badges: string[];
  addBadge: (badge: string) => void;
  checkStreak: () => void;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;

  // Chat
  chatOpen: boolean;
  setChatOpen: (val: boolean) => void;
  chatHistory: { role: 'user' | 'assistant'; content: string, traces?: string[] }[];
  addChatMessage: (msg: { role: 'user' | 'assistant'; content: string, traces?: string[] }) => void;
}

const defaultProfile: UserProfile = {
  name: '', email: '', phone: '',
  stage: 'explorer',
  targetCountry: '', targetField: '', degree: 'masters',
  gpa: 0, greScore: 0, toeflScore: 0, ieltsScore: 0,
  workExperience: 0, budget: 0, hasResearch: false,
  shortlistedUniversities: [],
  parentName: '', parentPhone: '', parentIncome: 0, parentOccupation: '',
  docsUploaded: [],
  kycVerified: false,
};

function calculateLRS(profile: UserProfile): LRSState {
  // Profile Completeness (25%)
  let profileScore = 0;
  if (profile.name) profileScore += 15;
  if (profile.email) profileScore += 10;
  if (profile.gpa > 0) profileScore += 20;
  if (profile.greScore > 0 || profile.ieltsScore > 0 || profile.toeflScore > 0) profileScore += 20;
  if (profile.targetCountry) profileScore += 15;
  if (profile.targetField) profileScore += 10;
  if (profile.workExperience > 0) profileScore += 10;

  // Document Readiness (25%)
  let docScore = 0;
  const docCount = profile?.docsUploaded?.length || 0;
  docScore = Math.min(100, docCount * 25);

  // Co-applicant Details (20%)
  let coAppScore = 0;
  if (profile.parentName) coAppScore += 20;
  if (profile.parentPhone) coAppScore += 20;
  if (profile.parentIncome > 0) coAppScore += 40;
  if (profile.parentOccupation) coAppScore += 20;

  // Shortlist (15%)
  let shortlistScore = 0;
  const shortlistCount = profile?.shortlistedUniversities?.length || 0;
  if (shortlistCount > 0) shortlistScore = 50;
  if (shortlistCount > 2) shortlistScore = 100;

  // Compute total (Base 300, max 850)
  const total = 300 + 
    (profileScore * 0.25 * 5.5) +
    (docScore * 0.25 * 5.5) +
    (coAppScore * 0.20 * 5.5) +
    (shortlistScore * 0.15 * 5.5);

  return {
    score: Math.min(850, Math.round(total)),
    breakdown: {
      profileCompleteness: profileScore,
      documentReadiness: docScore,
      coApplicantDetails: coAppScore,
      universityShortlist: shortlistScore,
      engagementSignal: 0, // Gets updated dynamically
    }
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isHydrated: false,
      setHydrated: (val) => set({ isHydrated: val }),

      onboardingDraft: undefined,
      setOnboardingDraft: (draft) => set({ onboardingDraft: draft }),

      isAuthenticated: false,
      login: (name: string, email: string, phone: string) => set((state) => ({
        isAuthenticated: true,
        profile: { ...state.profile, name, email, phone },
        lrs: calculateLRS({ ...state.profile, name, email, phone })
      })),
      logout: () => set({
        isAuthenticated: false,
        profile: defaultProfile,
        isOnboarded: false,
        intentScore: 0,
        streakDays: 0,
        chatHistory: [],
      }),
      
      profile: defaultProfile,
      isOnboarded: false,
      setProfile: (updates) => set((state) => {
        const newProfile = { ...state.profile, ...updates };
        return { profile: newProfile, lrs: calculateLRS(newProfile) };
      }),
      setOnboarded: (val) => set({ isOnboarded: val }),

      lrs: {
        score: 310,
        breakdown: {
          profileCompleteness: 0, documentReadiness: 0,
          coApplicantDetails: 0, universityShortlist: 0, engagementSignal: 0
        }
      },
      updateLRS: () => set((state) => ({ lrs: calculateLRS(state.profile) })),

      intentScore: 0,
      addIntentEvent: (points) => set((state) => {
        const newIntent = Math.min(100, state.intentScore + points);
        const newLRS = { ...state.lrs };
        newLRS.breakdown.engagementSignal = newIntent;
        return { intentScore: newIntent, lrs: newLRS };
      }),

      streakDays: 0,
      lastVisit: '',
      badges: [],
      addBadge: (badge) => set((state) => ({
        badges: state.badges.includes(badge) ? state.badges : [...state.badges, badge]
      })),
      checkStreak: () => set((state) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to local midnight
        const todayStr = today.toDateString();
        
        if (state.lastVisit === todayStr) {
          return {}; // Already logged in today, do nothing.
        }
        
        if (!state.lastVisit) {
          return { streakDays: 1, lastVisit: todayStr };
        }

        const last = new Date(state.lastVisit);
        last.setHours(0, 0, 0, 0);
        
        const diffTime = today.getTime() - last.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays === 1) {
          // Exactly one day later -> Increment streak
          return { streakDays: state.streakDays + 1, lastVisit: todayStr };
        } else if (diffDays > 1) {
          // Break in streak -> Reset to 1
          return { streakDays: 1, lastVisit: todayStr };
        }
        
        return {}; // Failsafe
      }),

      theme: 'light',
      setTheme: (t) => set({ theme: t }),

      chatOpen: false,
      setChatOpen: (val) => set({ chatOpen: val }),
      chatHistory: [],
      addChatMessage: (msg) => set((state) => ({
        chatHistory: [...state.chatHistory, msg]
      }))
    }),
    {
      name: 'margdarshak-storage',
      version: 2, // bump this whenever the stored schema changes
      migrate: (persisted: unknown, fromVersion: number) => {
        // On any schema change, clear auth so stale sessions don't crash the app
        const state = persisted as Partial<AppState>;
        if (fromVersion < 2) {
          return {
            ...state,
            isAuthenticated: false,
            isOnboarded: false,
          };
        }
        return state;
      },
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        profile: state.profile,
        isOnboarded: state.isOnboarded,
        intentScore: state.intentScore,
        chatHistory: state.chatHistory,
        streakDays: state.streakDays,
        theme: state.theme,
        onboardingDraft: state.onboardingDraft,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      }
    }
  )
);
