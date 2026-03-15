import { TimeEntry, DailySummary, WeeklyReport, TimeCategory } from '@/types';
import { startOfWeek, endOfWeek, differenceInMinutes, isToday, format } from 'date-fns';
import { getWorkingHoursForDay } from './dateUtils';
import { workingHours } from '@/config/env';

export const calculateDailySummary = (
  entries: TimeEntry[], 
  date: Date, 
  activeTimer?: TimeEntry,
  standardHours?: Record<string, number>
): DailySummary => {
  const dayEntries = entries.filter(entry => 
    entry.date.toDateString() === date.toDateString()
  );
  
  const totalWorked = dayEntries.reduce((sum, entry) => {
    return sum + (entry.duration || 0);
  }, 0);
  
  // Add active timer duration if it exists and is from today
  let workedToday = totalWorked;
  if (activeTimer && activeTimer.date.toDateString() === date.toDateString()) {
    const activeDuration = Math.floor((new Date().getTime() - activeTimer.startTime.getTime()) / (1000 * 60));
    workedToday += activeDuration;
  }
  
  // Use provided standardHours or fallback to hardcoded workingHours
  const hoursToUse = standardHours || workingHours;
  const requiredHours = getWorkingHoursForDay(date, hoursToUse) * 60; // convert to minutes
  const remaining = Math.max(0, requiredHours - workedToday);
  const overtime = Math.max(0, workedToday - requiredHours);
  
  return {
    worked: workedToday,
    remaining,
    overtime,
    date,
  };
};

export const calculateWeeklyReport = (entries: TimeEntry[], weekStart: Date, activeTimer?: TimeEntry): WeeklyReport => {
  // Calculate week end as 6 days after week start (7-day period)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  const weekEntries = entries.filter(entry => 
    entry.date >= weekStart && entry.date <= weekEnd
  );
  
  const totalHours = weekEntries.reduce((sum, entry) => {
    return sum + (entry.duration || 0);
  }, 0) / 60; // convert to hours
  
  const categoryBreakdown: Record<TimeCategory, number> = {
    meetings: 0,
    calls: 0,
    scripting: 0,
    refactoring: 0,
    break: 0,
    investigate: 0,
    reporting: 0,
  };
  
  weekEntries.forEach(entry => {
    if (entry.duration) {
      categoryBreakdown[entry.category] += entry.duration;
    }
  });
  
  const dailyHours: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);
    const dayEntries = weekEntries.filter(entry => 
      entry.date.toDateString() === currentDate.toDateString()
    );
    let dayTotal = dayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60;
    
    // Add active timer duration if it exists and is from this day
    if (activeTimer && activeTimer.date.toDateString() === currentDate.toDateString()) {
      const activeDuration = Math.floor((new Date().getTime() - activeTimer.startTime.getTime()) / (1000 * 60));
      dayTotal += activeDuration / 60;
    }
    
    dailyHours[format(currentDate, 'yyyy-MM-dd')] = dayTotal;
  }
  
  const notes = weekEntries
    .filter(entry => entry.notes && entry.notes.trim() !== '')
    .map(entry => entry.notes || '')
    .filter(Boolean);
  
  return {
    totalHours,
    categoryBreakdown,
    dailyHours,
    notes,
  };
};

export const getCurrentWeekRange = () => {
  const now = new Date();
  // Start from 6 days ago to include the last 7 days (including today)
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  
  return {
    start,
    end,
  };
};
