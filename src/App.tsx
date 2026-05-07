/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FitnessProvider, useFitness } from './lib/store';
import Dashboard from './components/dashboard/Dashboard';
import TrackersView from './components/trackers/TrackersView';
import ProgressReport from './components/reports/ProgressReport';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Activity, BarChart3, User, Utensils } from 'lucide-react';
import { cn } from './lib/utils';

type View = 'dashboard' | 'trackers' | 'diet' | 'reports' | 'profile';

function MainContent() {
  const { state, updateProfile, navigate } = useFitness();
  const activeView = state.activeView;

  const [showSettings, setShowSettings] = useState(false);

  const handleSync = () => {
    // Simulate health data sync
    const toast = document.createElement('div');
    toast.className = "fixed top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-xl z-[100] font-bold text-sm animate-bounce";
    toast.innerText = "Syncing with Health Connect...";
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.innerText = "Data Synced Successfully!";
      setTimeout(() => toast.remove(), 2000);
    }, 1500);
  };

  const handleShare = (format: string) => {
    const toast = document.createElement('div');
    toast.className = "fixed bottom-24 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-xl z-[100] font-bold text-sm";
    toast.innerText = `Generating ${format} Report...`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.innerText = `${format} Report Ready for Download!`;
      setTimeout(() => toast.remove(), 3000);
    }, 2000);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'trackers': return <TrackersView />;
      case 'diet': return <TrackersView initialTracker="diet" />;
      case 'reports': return <ProgressReport />;
      case 'profile': return (
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center pt-10 space-y-4">
            <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl relative group">
              <User className="w-16 h-16 text-indigo-600" />
              <button 
                onClick={() => setShowSettings(true)}
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-100 text-indigo-600 hover:scale-110 transition-transform"
              >
                <Activity className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-900">{state.user.name}</h2>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Premium Member</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Age</p>
              <p className="text-lg font-bold text-gray-900">{state.user.age}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Weight</p>
              <p className="text-lg font-bold text-gray-900">{state.user.weight}kg</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Height</p>
              <p className="text-lg font-bold text-gray-900">{state.user.height}cm</p>
            </div>
          </div>

          <div className="space-y-3">
             <button 
               onClick={() => setShowSettings(true)}
               className="w-full bg-white p-5 rounded-3xl font-bold text-gray-700 shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all"
             >
               <span className="flex items-center gap-3"><User className="w-5 h-5 text-indigo-500" /> Profile Settings</span>
               <LayoutDashboard className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
             </button>
             <button 
               onClick={handleSync}
               className="w-full bg-white p-5 rounded-3xl font-bold text-gray-700 shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all"
             >
               <span className="flex items-center gap-3"><Activity className="w-5 h-5 text-emerald-500" /> Health Data Sync</span>
               <LayoutDashboard className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
             </button>
             
             <div className="pt-4 space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Share Report</p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleShare('PDF')}
                    className="bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Export PDF
                  </button>
                  <button 
                    onClick={() => handleShare('Word')}
                    className="bg-gray-900 text-white p-4 rounded-2xl font-bold shadow-lg shadow-gray-200 flex items-center justify-center gap-2 hover:bg-black active:scale-95 transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Export Word
                  </button>
                </div>
             </div>
          </div>

          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed inset-0 bg-white z-[60] p-8 flex flex-col"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black">Profile Editor</h2>
                  <button onClick={() => setShowSettings(false)} className="bg-gray-100 p-2 rounded-full"><User className="w-5 h-5" /></button>
                </div>
                <div className="space-y-6 flex-1 overflow-y-auto hide-scrollbar">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name</label>
                    <input 
                      type="text" 
                      value={state.user.name}
                      onChange={e => updateProfile({ name: e.target.value })}
                      className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Age</label>
                      <input 
                        type="number" 
                        value={state.user.age}
                        onChange={e => updateProfile({ age: Number(e.target.value) })}
                        className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Weight (kg)</label>
                      <input 
                        type="number" 
                        value={state.user.weight}
                        onChange={e => updateProfile({ weight: Number(e.target.value) })}
                        className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Height (cm)</label>
                    <input 
                      type="number" 
                      value={state.user.height}
                      onChange={e => updateProfile({ height: Number(e.target.value) })}
                      className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-indigo-600 text-white p-5 rounded-3xl font-bold shadow-lg mt-8"
                >
                  Save Changes
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100">
      {/* Mobile Container */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative px-6 pt-10">
        
        <main className="flex-1 overflow-y-auto hide-scrollbar pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[350px] bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-2xl p-2 z-50">
          <div className="flex justify-between items-center px-2">
            <NavButton 
              active={activeView === 'dashboard'} 
              onClick={() => navigate('dashboard')}
              icon={LayoutDashboard}
            />
            <NavButton 
              active={activeView === 'trackers'} 
              onClick={() => navigate('trackers')}
              icon={Activity}
            />
            <NavButton 
              active={activeView === 'diet'} 
              onClick={() => navigate('diet')}
              icon={Utensils}
            />
            <NavButton 
              active={activeView === 'reports'} 
              onClick={() => navigate('reports')}
              icon={BarChart3}
            />
            <NavButton 
              active={activeView === 'profile'} 
              onClick={() => navigate('profile')}
              icon={User}
            />
          </div>
        </nav>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <FitnessProvider>
      <MainContent />
    </FitnessProvider>
  );
}

function NavButton({ active, onClick, icon: Icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-[2rem] transition-all duration-300 overflow-hidden",
        active ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
      )}
    >
      {active && (
        <motion.div 
          layoutId="nav-bg"
          className="absolute inset-0 bg-indigo-50 z-0"
          transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
        />
      )}
      <Icon className={cn("w-6 h-6 relative z-10", active ? "scale-110" : "scale-100")} />
    </button>
  );
}

