/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFitness } from '../../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Footprints, Droplets, Timer, Moon, Pill, Utensils, 
  ChevronRight, Plus, Minus, Play, Square, Check, Activity as ActivityIcon, Ban
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSensorTracking } from '../../lib/useSensorTracking';

type ViewMode = 'walking' | 'jogging' | 'water' | 'sleep' | 'medicine' | 'diet';

const TabButton = ({ id, active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={() => onClick(id)}
    className={cn(
      "flex flex-col items-center gap-1 p-3 transition-all rounded-2xl min-w-[70px]",
      active ? "bg-white shadow-sm text-indigo-600 scale-105" : "text-gray-400 hover:text-gray-500"
    )}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
  </button>
);

const GoalEditor = ({ label, value, unit, onSave }: any) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  if (editing) {
    return (
      <div className="flex items-center gap-2 bg-gray-50 p-2 px-4 rounded-2xl border border-gray-100">
        <input 
          type="number" 
          value={val} 
          onChange={e => setVal(Number(e.target.value))}
          className="bg-transparent font-bold text-gray-900 w-20 outline-none"
        />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{unit}</span>
        <button 
          onClick={() => { onSave(val); setEditing(false); }}
          className="bg-indigo-600 text-white p-1.5 rounded-lg ml-2 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setEditing(true)}
      className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter hover:text-indigo-600 transition-colors"
    >
      Goal: {value} {unit}
      <ChevronRight className="w-3 h-3" />
    </button>
  );
};

export default function TrackersView({ initialTracker }: { initialTracker?: ViewMode }) {
  const { state, addSteps, addWater, addJoggingSession, addMedicine, toggleMedicine, addFood, deleteFood, editFood, updateSleep, updateGoal } = useFitness();
  const [activeTracker, setActiveTracker] = useState<ViewMode>(initialTracker || 'walking');
  const today = state.history[state.currentDate];

  const { isActive, startTracking, stopTracking, error: sensorError } = useSensorTracking({
    onStep: () => addSteps(1)
  });

  if (!today) return null;

  const trackers = [
    { id: 'walking', icon: Footprints, label: 'Steps' },
    { id: 'jogging', icon: Timer, label: 'Jogging' },
    { id: 'water', icon: Droplets, label: 'Water' },
    { id: 'sleep', icon: Moon, label: 'Sleep' },
    { id: 'medicine', icon: Pill, label: 'Meds' },
    { id: 'diet', icon: Utensils, label: 'Diet' },
  ];

  const renderTrackerDetail = () => {
    switch (activeTracker) {
      case 'walking':
        return (
          <div className="space-y-10">
            <div className="text-center space-y-2">
              <div className={cn(
                "inline-flex p-6 rounded-full mb-4 transition-all duration-500",
                isActive ? "bg-emerald-50 text-emerald-600 scale-110 shadow-lg shadow-emerald-100" : "bg-indigo-50 text-indigo-600"
              )}>
                {isActive ? <ActivityIcon className="w-12 h-12 animate-pulse" /> : <Footprints className="w-12 h-12" />}
              </div>
              <div className="space-y-1">
                <h2 className="text-5xl font-black text-gray-900">{today.walking.steps}</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Steps</p>
              </div>
              
              <div className="w-full bg-gray-100 h-2 rounded-full mt-6 max-w-xs mx-auto overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((today.walking.steps / today.walking.goal) * 100, 100)}%` }}
                  className="h-full bg-indigo-600"
                />
              </div>
              <div className="flex justify-center mt-2">
                <GoalEditor 
                  label="Steps Goal" 
                  unit="steps" 
                  value={today.walking.goal} 
                  onSave={(v: number) => updateGoal('walkingGoal', v)} 
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Auto-Tracking</h3>
                  <p className="text-xs text-gray-400 font-medium">Uses accelerometer to count steps</p>
                </div>
                <button 
                  onClick={isActive ? stopTracking : startTracking}
                  className={cn(
                    "relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none",
                    isActive ? "bg-emerald-500" : "bg-gray-200"
                  )}
                >
                  <span className={cn(
                    "inline-block h-6 w-6 transform rounded-full bg-white transition-transform",
                    isActive ? "translate-x-7" : "translate-x-1"
                  )} />
                </button>
              </div>
              
              {sensorError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold uppercase tracking-tight">
                  <Ban className="w-4 h-4" />
                  <span>{sensorError}</span>
                </div>
              )}
              
              {!isActive && !sensorError && (
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                  <p className="text-xs text-indigo-600 font-medium leading-relaxed">
                    Tap the switch to enable real-time step counting using your phone's motion sensors.
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest text-center">Manual Add</p>
              <div className="grid grid-cols-3 gap-4">
                {[500, 1000, 5000].map(amount => (
                  <button 
                    key={amount}
                    onClick={() => addSteps(amount)}
                    className="bg-white border-2 border-indigo-50 p-4 rounded-2xl font-bold text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all text-sm"
                  >
                    +{amount}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'water':
        return (
          <div className="space-y-10">
            <div className="text-center space-y-4">
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-50 rounded-full animate-pulse" />
                <motion.div 
                   className="absolute bg-blue-100 rounded-full bottom-0 left-0 right-0 w-full"
                   initial={{ height: 0 }}
                   animate={{ height: `${Math.min((today.water.amountMl / today.water.goalMl) * 100, 100)}%` }}
                   transition={{ duration: 1 }}
                />
                <div className="z-10 text-center">
                  <h2 className="text-4xl font-black text-gray-900">{today.water.amountMl}</h2>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">ml reached</p>
                </div>
              </div>
              <div className="flex justify-center">
                <GoalEditor 
                  label="Water Goal" 
                  unit="ml" 
                  value={today.water.goalMl} 
                  onSave={(v: number) => updateGoal('waterGoal', v)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[250, 500].map(amount => (
                <button 
                  key={amount}
                  onClick={() => addWater(amount)}
                  className="bg-blue-600 text-white p-5 rounded-2xl font-bold flex flex-col items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <Plus />
                  <span>{amount}ml</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'jogging':
        return <JoggingTracker onAdd={addJoggingSession} initialData={today.jogging} onUpdateGoal={(v: number) => updateGoal('joggingGoal', v)} />;
      case 'medicine':
        return <MedicineTracker meds={today.medicine} onToggle={toggleMedicine} onAdd={addMedicine} />;
      case 'diet':
        return <DietTracker diet={today.diet} onAdd={addFood} onDelete={deleteFood} onEdit={editFood} onUpdateGoal={(v: number) => updateGoal('dietGoal', v)} />;
      case 'sleep':
        return <SleepTracker sleep={today.sleep} onUpdate={updateSleep} onUpdateGoal={(v: number) => updateGoal('sleepGoal', v)} />;
      default:
        return null;
    }
  };

  return (
    <div className="pb-10 space-y-8">
      <div className="bg-gray-100/80 backdrop-blur-md p-1 rounded-[2.5rem] flex overflow-x-auto hide-scrollbar gap-1 sticky top-0 z-20 border border-white/50">
        {trackers.map((t) => (
          <TabButton
            key={t.id}
            id={t.id}
            active={activeTracker === t.id}
            onClick={setActiveTracker}
            icon={t.icon}
            label={t.label}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTracker}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="px-1"
        >
          {renderTrackerDetail()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Sub-components for specific trackers
function JoggingTracker({ onAdd, initialData, onUpdateGoal }: any) {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState<any>(null);

  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(intervalId);
      setIsRunning(false);
    } else {
      const id = setInterval(() => setTime(t => t + 1), 1000);
      setIntervalId(id);
      setIsRunning(true);
    }
  };

  const handleFinish = () => {
    if (time < 10) return;
    const distanceKm = Number((Math.random() * 2 + (time / 60) * 0.15).toFixed(2));
    onAdd({
      startTime: new Date().toLocaleTimeString(),
      durationMinutes: Math.floor(time / 60),
      distanceKm
    });
    setTime(0);
    clearInterval(intervalId);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-900 aspect-square rounded-[3rem] flex flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[1px] bg-white rotate-45" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[1px] bg-white -rotate-45" />
        </div>
        <div className="z-10 text-center">
          <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">Current Session</p>
          <h2 className="text-6xl font-black font-mono tracking-tight">{formatTime(time)}</h2>
          <div className="flex justify-center mt-4">
            <GoalEditor 
              label="Jogging Goal" 
              unit="km" 
              value={initialData.goalKm} 
              onSave={onUpdateGoal} 
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={toggleTimer}
          className={cn(
            "flex-1 p-6 rounded-3xl flex items-center justify-center gap-3 font-bold transition-all",
            isRunning ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
          )}
        >
          {isRunning ? <Square /> : <Play />}
          {isRunning ? "Pause" : "Start"}
        </button>
        <button 
          onClick={handleFinish}
          disabled={time < 10}
          className="flex-1 bg-gray-900 text-white p-6 rounded-3xl font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Finish
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Recent Runs</h3>
        <div className="space-y-3">
          {initialData.sessions.slice(-3).reverse().map((s: any) => (
            <div key={s.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 p-2 rounded-lg">
                  <Timer className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-bold text-sm">{s.distanceKm} km</p>
                  <p className="text-xs text-gray-400">{s.durationMinutes} min • {s.startTime}</p>
                </div>
              </div>
              <Check className="text-emerald-500 w-5 h-5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MedicineTracker({ meds, onToggle, onAdd }: any) {
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('08:00');

  const handleAdd = () => {
    if (!newName) return;
    onAdd({ name: newName, time: newTime, dosage: '1 pill' });
    setNewName('');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900">Add Reminder</h3>
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="Name (e.g. Vitamin C)" 
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="w-full bg-gray-50 p-4 rounded-2xl border-none outline-none text-sm font-medium focus:ring-2 focus:ring-pink-100 transition-all"
          />
          <div className="flex gap-2">
            <input 
              type="time" 
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              className="flex-1 bg-gray-50 p-4 rounded-2xl border-none outline-none text-sm font-medium focus:ring-2 focus:ring-pink-100 transition-all"
            />
            <button 
              onClick={handleAdd}
              className="bg-pink-600 text-white p-4 px-6 rounded-2xl font-bold flex items-center gap-2 hover:bg-pink-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Planned Today</h3>
        <div className="space-y-3">
          {meds.map((m: any) => (
            <button 
              key={m.id} 
              onClick={() => onToggle(m.id)}
              className={cn(
                "w-full text-left p-4 rounded-2xl flex items-center justify-between border transition-all",
                m.taken ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-pink-50"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", m.taken ? "bg-gray-200 text-gray-400" : "bg-pink-100 text-pink-600")}>
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={cn("font-bold text-sm", m.taken ? "line-through" : "")}>{m.name}</h4>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{m.time} • {m.dosage}</p>
                </div>
              </div>
              {m.taken ? <Check className="w-6 h-6 text-emerald-500" /> : <div className="w-6 h-6 rounded-full border-2 border-pink-100" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SleepTracker({ sleep, onUpdate, onUpdateGoal }: any) {
  const calculateDurationHours = (bed: string, wake: string) => {
    const [bH, bM] = bed.split(':').map(Number);
    const [wH, wM] = wake.split(':').map(Number);
    
    // Create dates for comparison (assume same day for calculation, then adjust)
    const bDate = new Date(2000, 0, 1, bH, bM);
    const wDate = new Date(2000, 0, 1, wH, wM);
    
    let diff = wDate.getTime() - bDate.getTime();
    if (diff < 0) {
      // Crossed midnight
      diff += 24 * 60 * 60 * 1000;
    }
    
    return Math.round((diff / (1000 * 60 * 60)) * 10) / 10;
  };

  const handleTimeChange = (type: 'bed' | 'wake', value: string) => {
    const newBed = type === 'bed' ? value : (sleep.bedTime || '22:00');
    const newWake = type === 'wake' ? value : (sleep.wakeTime || '07:00');
    const newDuration = calculateDurationHours(newBed, newWake);
    onUpdate(newDuration, newBed, newWake, sleep.notes);
  };

  return (
    <div className="space-y-8">
      <div className="bg-indigo-900 rounded-[3rem] p-10 text-center text-white space-y-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Moon className="w-32 h-32" />
        </div>
        <div className="relative z-10 text-center">
          <h2 className="text-6xl font-black">{sleep.durationHours}</h2>
          <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Hours Slept</p>
          <div className="flex justify-center mt-4">
            <GoalEditor 
              label="Sleep Goal" 
              unit="hrs" 
              value={sleep.goalHours} 
              onSave={onUpdateGoal} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bedtime</p>
           <input 
             type="time" 
             className="text-xl font-bold text-gray-900 w-full outline-none focus:text-indigo-600 transition-colors"
             value={sleep.bedTime || '22:00'}
             onChange={e => handleTimeChange('bed', e.target.value)}
           />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Wake up</p>
           <input 
             type="time" 
             className="text-xl font-bold text-gray-900 w-full outline-none focus:text-indigo-600 transition-colors"
             value={sleep.wakeTime || '07:00'}
             onChange={e => handleTimeChange('wake', e.target.value)}
           />
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Manual Adjustment</h3>
          <span className="text-indigo-600 font-bold">{sleep.durationHours}h</span>
        </div>
        <input 
          type="range" 
          min="0" max="15" step="0.5"
          value={sleep.durationHours}
          onChange={e => onUpdate(parseFloat(e.target.value), sleep.bedTime, sleep.wakeTime, sleep.notes)}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>0h</span>
          <span>15h</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Sleep Notes</h3>
          <ActivityIcon className="w-4 h-4 text-gray-300" />
        </div>
        <textarea 
          placeholder="How did you feel? Any specific dreams or interruptions?" 
          value={sleep.notes || ''}
          onChange={e => onUpdate(sleep.durationHours, sleep.bedTime, sleep.wakeTime, e.target.value)}
          className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-sm min-h-[100px] resize-none"
        />
      </div>
    </div>
  );
}

function DietTracker({ diet, onAdd, onDelete, onEdit, onUpdateGoal }: any) {
  const [name, setName] = useState('');
  const [cal, setCal] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!name || !cal) return;
    if (editingId) {
      onEdit(editingId, { name, calories: parseInt(cal) });
      setEditingId(null);
    } else {
      onAdd({ name, calories: parseInt(cal) });
    }
    setName('');
    setCal('');
  };

  const startEdit = (food: any) => {
    setEditingId(food.id);
    setName(food.name);
    setCal(food.calories.toString());
  };

  const totalCalories = diet.records.reduce((acc: any, f: any) => acc + f.calories, 0);
  const remaining = diet.goalCalories - totalCalories;

  return (
    <div className="space-y-8">
      <div className="bg-emerald-600 p-8 rounded-[3rem] text-white space-y-1 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Utensils className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Total Energy</p>
          <h2 className="text-5xl font-black">{totalCalories} <span className="text-xl font-normal opacity-80">kcal</span></h2>
          <div className="flex items-center gap-4 mt-2">
             <GoalEditor 
              label="Calorie Goal" 
              unit="kcal" 
              value={diet.goalCalories} 
              onSave={onUpdateGoal} 
            />
            <div className="h-4 w-[1px] bg-emerald-400" />
            <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">
              {remaining >= 0 ? `${remaining} kcal left` : `${Math.abs(remaining)} kcal over`}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-900">{editingId ? 'Edit Entry' : 'Quick Add'}</h3>
          {editingId && (
            <button 
              onClick={() => { setEditingId(null); setName(''); setCal(''); }}
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <div className="space-y-3">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
              <Utensils className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="What did you eat?" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-gray-50 pl-11 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-medium border border-transparent focus:border-emerald-200"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                <ActivityIcon className="w-4 h-4" />
              </div>
              <input 
                type="number" 
                placeholder="Calories" 
                value={cal}
                onChange={e => setCal(e.target.value)}
                className="w-full bg-gray-50 pl-11 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-medium border border-transparent focus:border-emerald-200"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase">kcal</span>
            </div>
            <button 
              onClick={handleAdd}
              className="bg-emerald-600 text-white px-8 rounded-2xl font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-50 shadow-emerald-100 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {editingId ? 'Save' : 'Add'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-bold">Food Log</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{diet.records.length} items</p>
        </div>
        <div className="space-y-3">
          {diet.records.length > 0 ? (
            diet.records.map((f: any) => (
              <div key={f.id} className="bg-white p-4 rounded-3xl flex items-center justify-between border border-gray-100 group">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{f.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{f.time} • {f.calories} kcal</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => startEdit(f)}
                    className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4 rotate-45" />
                  </button>
                  <button 
                    onClick={() => onDelete(f.id)}
                    className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
              <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">No entries yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
