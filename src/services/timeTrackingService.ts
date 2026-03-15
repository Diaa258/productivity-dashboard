import { prisma } from '@/config/database';
import { TimeEntry, TimeCategory, DailySummary, WeeklyReport } from '@/types';
import { calculateDailySummary, calculateWeeklyReport, getCurrentWeekRange } from '@/utils/timeCalculator';
import { startOfDay, endOfDay, isToday } from 'date-fns';
import { settingsRepository } from '@/repositories/settingsRepository';

export class TimeTrackingService {
  async createTimeEntry(data: {
    category: TimeCategory;
    description: string;
    startTime: Date;
    endTime?: Date;
    notes?: string;
  }): Promise<TimeEntry> {
    const duration = data.endTime 
      ? Math.floor((data.endTime.getTime() - data.startTime.getTime()) / (1000 * 60))
      : undefined;

    const entry = await prisma.timeEntry.create({
      data: {
        category: data.category,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        duration,
        notes: data.notes,
        date: startOfDay(data.startTime),
      },
    });

    return this.mapPrismaEntryToTimeEntry(entry);
  }

  async updateTimeEntry(id: string, data: Partial<{
    category: TimeCategory;
    description: string;
    startTime: Date;
    endTime: Date;
    notes: string;
  }>): Promise<TimeEntry | null> {
    const updateData: any = { ...data };
    
    if (data.startTime || data.endTime) {
      const existingEntry = await prisma.timeEntry.findUnique({
        where: { id },
      });
      
      if (existingEntry) {
        const startTime = data.startTime || existingEntry.startTime;
        const endTime = data.endTime || existingEntry.endTime;
        
        if (endTime) {
          updateData.duration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
        }
      }
    }

    const entry = await prisma.timeEntry.update({
      where: { id },
      data: updateData,
    });

    return this.mapPrismaEntryToTimeEntry(entry);
  }

  async deleteTimeEntry(id: string): Promise<boolean> {
    try {
      await prisma.timeEntry.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting time entry:', error);
      return false;
    }
  }

  async getTimeEntries(dateRange?: {
    start: Date;
    end: Date;
  }): Promise<TimeEntry[]> {
    const where = dateRange
      ? {
          date: {
            gte: startOfDay(dateRange.start),
            lte: endOfDay(dateRange.end),
          },
        }
      : {};

    const entries = await prisma.timeEntry.findMany({
      where,
      orderBy: {
        startTime: 'desc',
      },
    });

    return entries.map((entry: any) => this.mapPrismaEntryToTimeEntry(entry));
  }

  async getTodayTimeEntries(): Promise<TimeEntry[]> {
    const today = new Date();
    return this.getTimeEntries({
      start: startOfDay(today),
      end: endOfDay(today),
    });
  }

  async getActiveTimer(): Promise<TimeEntry | null> {
    const activeEntry = await prisma.timeEntry.findFirst({
      where: {
        endTime: null,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return activeEntry ? this.mapPrismaEntryToTimeEntry(activeEntry) : null;
  }

  async stopTimer(id: string): Promise<TimeEntry | null> {
    const endTime = new Date();
    
    // Get the entry first to calculate correct duration
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id },
    });

    if (!existingEntry || !existingEntry.startTime) {
      return null;
    }

    const correctDuration = Math.floor((endTime.getTime() - existingEntry.startTime.getTime()) / (1000 * 60));
    
    const entry = await prisma.timeEntry.update({
      where: { id },
      data: {
        endTime,
        duration: correctDuration,
      },
    });

    return this.mapPrismaEntryToTimeEntry(entry);
  }

  async getDailySummary(date: Date = new Date()): Promise<DailySummary> {
    const [entries, activeTimer, allSettings] = await Promise.all([
      this.getTimeEntries({
        start: startOfDay(date),
        end: endOfDay(date),
      }),
      this.getActiveTimer(),
      settingsRepository.getAllSettings(),
    ]);

    // Get standard hours from database or use defaults
    const defaultHours = {
      monday: 8,
      tuesday: 8,
      wednesday: 8,
      thursday: 8,
      friday: 4,
      saturday: 0,
      sunday: 0,
    };
    
    const standardHours = { ...defaultHours };
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    
    dayNames.forEach(day => {
      const savedValue = allSettings[`standard_hours_${day}`];
      if (savedValue) {
        standardHours[day] = parseFloat(savedValue);
      }
    });

    return calculateDailySummary(entries, date, activeTimer || undefined, standardHours);
  }

  async getWeeklyReport(weekStart?: Date): Promise<WeeklyReport> {
    const { start } = getCurrentWeekRange();
    const weekStartToUse = weekStart || start;
    
    const [entries, activeTimer] = await Promise.all([
      this.getTimeEntries({
        start: weekStartToUse,
        end: new Date(weekStartToUse.getTime() + 7 * 24 * 60 * 60 * 1000),
      }),
      this.getActiveTimer(),
    ]);

    return calculateWeeklyReport(entries, weekStartToUse, activeTimer || undefined);
  }

  async getCategories(): Promise<TimeCategory[]> {
    return ['meetings', 'calls', 'scripting', 'refactoring', 'break', 'investigate', 'reporting'];
  }

  private mapPrismaEntryToTimeEntry(entry: any): TimeEntry {
    return {
      id: entry.id,
      category: entry.category as TimeCategory,
      description: entry.description,
      startTime: new Date(entry.startTime),
      endTime: entry.endTime ? new Date(entry.endTime) : undefined,
      duration: entry.duration,
      notes: entry.notes,
      date: new Date(entry.date),
    };
  }
}

export const timeTrackingService = new TimeTrackingService();
