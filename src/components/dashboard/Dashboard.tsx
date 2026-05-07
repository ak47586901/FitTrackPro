/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFitness } from '../../lib/store';
import { motion } from 'motion/react';
import { Activity, Droplets, Footprints, Moon, Pill, Utensils, Timer } from 'lucide-react';
import { cn } from '../../lib/utils';

const ProgressRing = ({ percentage, color, icon: Icon, label, value, unit }: any) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-100"
          />
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            fill="transparent"
            className={cn("transition-all duration-1000", color)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={cn("w-8 h-8", color.replace('stroke-', 'text-'))} />
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}<span className="text-xs font-normal text-gray-500 ml-1">{unit}</span></p>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { state, navigate } = useFitness();
  const today = state.history[state.currentDate];

  if (!today) return null;

  const walkingPercent = (today.walking.steps / today.walking.goal) * 100;
  const waterPercent = (today.water.amountMl / today.water.goalMl) * 100;
  const sleepPercent = (today.sleep.durationHours / today.sleep.goalHours) * 100;

  return (
    <div className="space-y-8 pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Today</h1>
          <p className="text-sm font-medium text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
          <Activity className="w-6 h-6 text-indigo-600" />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <ProgressRing
          label="Steps"
          value={today.walking.steps}
          unit="steps"
          percentage={walkingPercent}
          color="stroke-indigo-500"
          icon={Footprints}
        />
        <ProgressRing
          label="Water"
          value={today.water.amountMl}
          unit="ml"
          percentage={waterPercent}
          color="stroke-blue-500"
          icon={Droplets}
        />
        <ProgressRing
          label="Sleep"
          value={today.sleep.durationHours}
          unit="hrs"
          percentage={sleepPercent}
          color="stroke-purple-500"
          icon={Moon}
        />
        <div className="bg-gradient-to-br from-orange-400 to-red-500 p-4 rounded-3xl shadow-sm text-white flex flex-col justify-between">
          <Timer className="w-6 h-6 text-orange-100" />
          <div className="mt-4">
            <p className="text-xs font-medium text-orange-100 uppercase tracking-wider">Jogging</p>
            <div className="flex items-end justify-between">
              <p className="text-xl font-bold">{today.jogging.distanceKm.toFixed(1)}<span className="text-xs font-normal opacity-80 ml-1">km</span></p>
              <p className="text-[10px] font-bold opacity-80">/{today.jogging.goalKm}km</p>
            </div>
            <div className="w-full bg-orange-300/30 h-1 rounded-full mt-1">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((today.jogging.distanceKm / today.jogging.goalKm) * 100, 100)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Upcoming <span className="bg-indigo-100 text-indigo-600 text-[10px] py-0.5 px-2 rounded-full uppercase tracking-widest font-bold">Today</span>
          </h2>
        </div>
        
        <div className="space-y-3">
          {today.medicine.filter(m => !m.taken).length > 0 ? (
            today.medicine.filter(m => !m.taken).map((med) => (
              <div key={med.id} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100">
                <div className="bg-pink-100 p-3 rounded-xl">
                  <Pill className="w-5 h-5 text-pink-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{med.name}</h3>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{med.time} • {med.dosage}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-sm font-medium text-gray-400">No pending medications</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 px-1">Daily Summary</h2>
        <div 
          onClick={() => navigate('diet')}
          className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 space-y-6 cursor-pointer hover:border-emerald-200 transition-colors"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 p-3 rounded-2xl">
                  <Utensils className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Dietary Tracking</p>
                  <p className="text-xs font-medium text-gray-400">{today.diet.records.length} meals tracked today</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {today.diet.records.reduce((acc, f) => acc + f.calories, 0)}
                  <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-tighter">/ {today.diet.goalCalories} kcal</span>
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((today.diet.records.reduce((acc, f) => acc + f.calories, 0) / today.diet.goalCalories) * 100, 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    today.diet.records.reduce((acc, f) => acc + f.calories, 0) > today.diet.goalCalories ? "bg-red-500" : "bg-emerald-500"
                  )}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span>0 kcal</span>
                <span>{today.diet.goalCalories} kcal</span>
              </div>
            </div>
          </div>
          
          <div className="h-[1px] bg-gray-100 w-full" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 p-2 rounded-lg">
                <Activity className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Active Time</p>
                <p className="text-xs font-medium text-gray-400">Walking & Jogging</p>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {today.jogging.durationMinutes + Math.round(today.walking.steps / 100)} <span className="text-xs font-normal text-gray-500">min</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
