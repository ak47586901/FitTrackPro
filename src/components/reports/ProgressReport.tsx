/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFitness } from '../../lib/store';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { format, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

type TimeRange = 'daily' | 'weekly' | 'monthly';

export default function ProgressReport() {
  const { state } = useFitness();
  const [range, setRange] = React.useState<TimeRange>('daily');
  
  const getChartData = () => {
    if (range === 'daily') {
      return Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const dayData = state.history[dateStr];
        
        return {
          name: format(d, 'EEE'),
          steps: dayData?.walking?.steps || 0,
          calories: dayData?.diet?.records?.reduce((acc, f) => acc + f.calories, 0) || 0,
          water: dayData?.water?.amountMl || 0,
          sleep: dayData?.sleep?.durationHours || 0,
        };
      });
    }
    
    if (range === 'weekly') {
      return Array.from({ length: 4 }).map((_, i) => {
        const start = startOfWeek(subWeeks(new Date(), 3 - i));
        const end = endOfWeek(start);
        
        const days = eachDayOfInterval({ start, end });
        const weekStats = days.reduce((acc, d) => {
          const dateStr = format(d, 'yyyy-MM-dd');
          const dayData = state.history[dateStr];
          return {
            steps: acc.steps + (dayData?.walking?.steps || 0),
            calories: acc.calories + (dayData?.diet?.records?.reduce((sum, f) => sum + f.calories, 0) || 0),
            water: acc.water + (dayData?.water?.amountMl || 0),
            sleep: acc.sleep + (dayData?.sleep?.durationHours || 0),
          };
        }, { steps: 0, calories: 0, water: 0, sleep: 0 });

        return {
          name: `W${format(start, 'w')}`,
          steps: weekStats.steps,
          calories: weekStats.calories,
          water: weekStats.water,
          sleep: weekStats.sleep / 7, // average sleep
        };
      });
    }

    // monthly
    return Array.from({ length: 6 }).map((_, i) => {
      const start = startOfMonth(subMonths(new Date(), 5 - i));
      const end = endOfMonth(start);
      
      const days = eachDayOfInterval({ start, end });
      const monthStats = days.reduce((acc, d) => {
        const dateStr = format(d, 'yyyy-MM-dd');
        const dayData = state.history[dateStr];
        return {
          steps: acc.steps + (dayData?.walking?.steps || 0),
          calories: acc.calories + (dayData?.diet?.records?.reduce((sum, f) => sum + f.calories, 0) || 0),
          water: acc.water + (dayData?.water?.amountMl || 0),
          sleep: acc.sleep + (dayData?.sleep?.durationHours || 0),
        };
      }, { steps: 0, calories: 0, water: 0, sleep: 0 });

      return {
        name: format(start, 'MMM'),
        steps: monthStats.steps,
        calories: monthStats.calories,
        water: monthStats.water,
        sleep: monthStats.sleep / days.length, // average sleep
      };
    });
  };

  const chartData = getChartData();

  const totals = chartData.reduce((acc, day) => ({
    steps: acc.steps + day.steps,
    calories: acc.calories + day.calories,
    water: acc.water + day.water,
  }), { steps: 0, calories: 0, water: 0 });

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reports</h1>
          <p className="text-sm font-medium text-gray-400">Track your health progress</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
          {(['daily', 'weekly', 'monthly'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                range === r ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-indigo-50 p-4 rounded-2xl text-center">
          <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Total Steps</p>
          <p className="text-lg font-bold text-indigo-700">{(totals.steps / 1000).toFixed(1)}k</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl text-center">
          <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Avg Water</p>
          <p className="text-lg font-bold text-blue-700">{range === 'daily' ? Math.round(totals.water / 7) : Math.round(totals.water / chartData.length)}ml</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl text-center">
          <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Total kcal</p>
          <p className="text-lg font-bold text-emerald-700">{(totals.calories / 1000).toFixed(1)}k</p>
        </div>
      </div>

      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Step Trends</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} />
              <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontWeight: 'bold' }}
              />
              <Bar dataKey="steps" fill="#6366f1" radius={[6, 6, 6, 6]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Sleep Quality</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSleep)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-indigo-600 p-8 rounded-[3rem] text-white">
        <h3 className="text-xl font-bold mb-4">AI Analysis</h3>
        <p className="text-sm opacity-90 leading-relaxed font-medium">
          Based on your activity this week, your sleep has been consistent, averaging 7.2 hours. Your step count peak was on Monday. Try to increase water intake by 15% to hit your daily goal more consistently.
        </p>
      </section>
    </div>
  );
}
