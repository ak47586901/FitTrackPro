/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, DailyData, ActivityType, MedicineInRecord, FoodRecord, JoggingSession } from '../types';
import { format } from 'date-fns';

const LS_KEY = 'fittrack_pro_data';

const DEFAULT_PROFILE = {
  name: 'Alex Johnson',
  age: 28,
  weight: 70,
  height: 175,
  gender: 'Other',
};

const DEFAULT_GOALS = {
  walkingGoal: 10000,
  waterGoal: 2500,
  sleepGoal: 8,
  dietGoal: 2000,
  joggingGoal: 5,
};

const createEmptyDay = (date: string, goals = DEFAULT_GOALS): DailyData => ({
  date,
  walking: { steps: 0, goal: goals.walkingGoal },
  jogging: { distanceKm: 0, goalKm: goals.joggingGoal, durationMinutes: 0, sessions: [] },
  water: { amountMl: 0, goalMl: goals.waterGoal },
  sleep: { durationHours: 0, goalHours: goals.sleepGoal },
  medicine: [],
  diet: { records: [], goalCalories: goals.dietGoal },
});

interface FitnessContextType {
  state: AppState;
  addSteps: (steps: number) => void;
  addWater: (ml: number) => void;
  addJoggingSession: (session: Omit<JoggingSession, 'id'>) => void;
  addMedicine: (med: Omit<MedicineInRecord, 'id' | 'taken'>) => void;
  toggleMedicine: (id: string) => void;
  addFood: (food: Omit<FoodRecord, 'id' | 'time'>) => void;
  deleteFood: (id: string) => void;
  editFood: (id: string, food: Partial<FoodRecord>) => void;
  updateSleep: (hours: number, bedTime?: string, wakeTime?: string, notes?: string) => void;
  updateGoal: (type: keyof AppState['settings'], value: number) => void;
  updateProfile: (profile: Partial<AppState['user']>) => void;
  navigate: (view: AppState['activeView']) => void;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(LS_KEY);
    const today = format(new Date(), 'yyyy-MM-dd');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all goals exist in settings (migration for existing users)
      parsed.settings = { ...DEFAULT_GOALS, ...parsed.settings };
      parsed.user = { ...DEFAULT_PROFILE, ...parsed.user };

      // Migrate history data structures
      Object.keys(parsed.history).forEach(date => {
        const day = parsed.history[date];
        // Migrate diet
        if (Array.isArray(day.diet)) {
          day.diet = { records: day.diet, goalCalories: parsed.settings.dietGoal };
        }
        // Migrate jogging
        if (day.jogging && day.jogging.goalKm === undefined) {
          day.jogging.goalKm = parsed.settings.joggingGoal;
        }
      });

      if (!parsed.history[today]) {
        parsed.history[today] = createEmptyDay(today, parsed.settings);
      }
      return { ...parsed, currentDate: today };
    }
    return {
      history: { [today]: createEmptyDay(today) },
      currentDate: today,
      activeView: 'dashboard',
      user: DEFAULT_PROFILE,
      settings: DEFAULT_GOALS,
    };
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  const updateCurrentDay = (updater: (day: DailyData) => DailyData) => {
    setState(prev => {
      const day = prev.history[prev.currentDate] || createEmptyDay(prev.currentDate, prev.settings);
      return {
        ...prev,
        history: {
          ...prev.history,
          [prev.currentDate]: updater(day),
        },
      };
    });
  };

  const updateGoal = (type: keyof AppState['settings'], value: number) => {
    setState(prev => {
      const newSettings = { ...prev.settings, [type]: value };
      // Also update today's goal if it exists
      const history = { ...prev.history };
      if (history[prev.currentDate]) {
        const today = { ...history[prev.currentDate] };
        if (type === 'walkingGoal') today.walking = { ...today.walking, goal: value };
        if (type === 'waterGoal') today.water = { ...today.water, goalMl: value };
        if (type === 'sleepGoal') today.sleep = { ...today.sleep, goalHours: value };
        if (type === 'dietGoal') today.diet = { ...today.diet, goalCalories: value };
        if (type === 'joggingGoal') today.jogging = { ...today.jogging, goalKm: value };
        history[prev.currentDate] = today;
      }
      return { ...prev, settings: newSettings, history };
    });
  };

  const updateProfile = (profile: Partial<AppState['user']>) => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, ...profile },
    }));
  };

  const navigate = (view: AppState['activeView']) => {
    setState(prev => ({ ...prev, activeView: view }));
  };

  const addSteps = (steps: number) => {
    updateCurrentDay(day => ({
      ...day,
      walking: { ...day.walking, steps: day.walking.steps + steps },
    }));
  };

  const addWater = (ml: number) => {
    updateCurrentDay(day => ({
      ...day,
      water: { ...day.water, amountMl: day.water.amountMl + ml },
    }));
  };

  const addJoggingSession = (session: Omit<JoggingSession, 'id'>) => {
    updateCurrentDay(day => ({
      ...day,
      jogging: {
        ...day.jogging,
        distanceKm: day.jogging.distanceKm + session.distanceKm,
        durationMinutes: day.jogging.durationMinutes + session.durationMinutes,
        sessions: [...day.jogging.sessions, { ...session, id: crypto.randomUUID() }],
      },
    }));
  };

  const addMedicine = (med: Omit<MedicineInRecord, 'id' | 'taken'>) => {
    updateCurrentDay(day => ({
      ...day,
      medicine: [...day.medicine, { ...med, id: crypto.randomUUID(), taken: false }],
    }));
  };

  const toggleMedicine = (id: string) => {
    updateCurrentDay(day => ({
      ...day,
      medicine: day.medicine.map(m => m.id === id ? { ...m, taken: !m.taken } : m),
    }));
  };

  const addFood = (food: Omit<FoodRecord, 'id' | 'time'>) => {
    updateCurrentDay(day => ({
      ...day,
      diet: {
        ...day.diet,
        records: [...day.diet.records, { ...food, id: crypto.randomUUID(), time: format(new Date(), 'HH:mm') }]
      },
    }));
  };

  const deleteFood = (id: string) => {
    updateCurrentDay(day => ({
      ...day,
      diet: {
        ...day.diet,
        records: day.diet.records.filter(r => r.id !== id)
      },
    }));
  };

  const editFood = (id: string, food: Partial<FoodRecord>) => {
    updateCurrentDay(day => ({
      ...day,
      diet: {
        ...day.diet,
        records: day.diet.records.map(r => r.id === id ? { ...r, ...food } : r)
      },
    }));
  };

  const updateSleep = (hours: number, bedTime?: string, wakeTime?: string, notes?: string) => {
    updateCurrentDay(day => ({
      ...day,
      sleep: { ...day.sleep, durationHours: hours, bedTime, wakeTime, notes },
    }));
  };

  return (
    <FitnessContext.Provider value={{ state, addSteps, addWater, addJoggingSession, addMedicine, toggleMedicine, addFood, deleteFood, editFood, updateSleep, updateGoal, updateProfile, navigate }}>
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) throw new Error('useFitness must be used within FitnessProvider');
  return context;
};
