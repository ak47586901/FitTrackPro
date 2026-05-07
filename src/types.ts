/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ActivityType = 'walking' | 'jogging' | 'water' | 'sleep' | 'medicine' | 'diet';

export interface DailyData {
  date: string; // ISO date string YYYY-MM-DD
  walking: {
    steps: number;
    goal: number;
  };
  jogging: {
    distanceKm: number;
    goalKm: number;
    durationMinutes: number;
    sessions: JoggingSession[];
  };
  water: {
    amountMl: number;
    goalMl: number;
  };
  sleep: {
    durationHours: number;
    goalHours: number;
    bedTime?: string;
    wakeTime?: string;
    notes?: string;
  };
  medicine: MedicineInRecord[];
  diet: {
    records: FoodRecord[];
    goalCalories: number;
  };
}

export interface JoggingSession {
  id: string;
  startTime: string;
  durationMinutes: number;
  distanceKm: number;
}

export interface MedicineInRecord {
  id: string;
  name: string;
  time: string;
  taken: boolean;
  dosage: string;
}

export interface FoodRecord {
  id: string;
  name: string;
  calories: number;
  time: string;
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  gender: string;
}

export interface AppState {
  history: Record<string, DailyData>; // Tracked by date string
  currentDate: string;
  activeView: 'dashboard' | 'trackers' | 'diet' | 'reports' | 'profile';
  user: UserProfile;
  settings: {
    walkingGoal: number;
    waterGoal: number;
    sleepGoal: number;
    dietGoal: number;
    joggingGoal: number;
  };
}
