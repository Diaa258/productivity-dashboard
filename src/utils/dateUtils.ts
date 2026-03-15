import { format, startOfDay, endOfDay, differenceInMinutes, isToday, getDay } from 'date-fns';

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'yyyy-MM-dd HH:mm');
};

export const getDayStart = (date: Date): Date => {
  return startOfDay(date);
};

export const getDayEnd = (date: Date): Date => {
  return endOfDay(date);
};

export const calculateDuration = (startTime: Date, endTime: Date): number => {
  return differenceInMinutes(endTime, startTime);
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

export const isWeekend = (date: Date): boolean => {
  const day = getDay(date);
  return day === 0 || day === 6; // Sunday or Saturday
};

export const getWorkingHoursForDay = (date: Date, workingHours: Record<string, number>): number => {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[getDay(date)];
  return workingHours[dayName] || 0;
};
