import { prisma } from '@/config/database';
import { jiraService } from './jiraService';
import { jenkinsService } from './jenkinsService';
import { timeTrackingService } from './timeTrackingService';

export interface NotificationData {
  type: 'break_reminder' | 'deadline_alert' | 'daily_summary' | 'weekly_goal' | 'jenkins_failure' | 'jira_assignment' | 'current_task';
  title: string;
  message: string;
  scheduledAt?: Date;
}

export interface ReminderData {
  type: 'break' | 'task_deadline' | 'daily_summary' | 'weekly_goal' | 'current_task';
  title: string;
  message: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'once' | 'interval';
  intervalMinutes?: number;
  scheduledTime?: string; // HH:MM format
}

export interface WeeklyGoalData {
  title: string;
  description?: string;
  targetValue?: number;
  unit?: string;
  weekStart: Date;
  weekEnd: Date;
}

/**
 * خدمة الإشعارات والتذكيرات - NotificationService
 * 
 * هذه الكلاس مسؤولة عن إدارة جميع الإشعارات والتذكيرات والمهام المجدولة في النظام
 * 
 * الوظائف الرئيسية:
 * - إدارة الإشعارات (إنشاء، قراءة، تحديث، حذف)
 * - إدارة التذكيرات المجدولة (يومية، أسبوعية، شهرية)
 * - إدارة الأهداف الأسبوعية وتتبع التقدم
 * - إرسال تنبيهات ذكية (أوقات الراحة، مواعيد المهام)
 * - التكامل مع Jira و Jenkins و Time Tracking
 * - معالجة المهام المجدولة تلقائياً
 * 
 * أنواع الإشعارات المدعومة:
 * - تذكيرات الراحة (break reminders)
 * - تنبيهات مواعيد المهام (deadline alerts)
 * - الملخصات اليومية (daily summaries)
 * - تقدم الأهداف الأسبوعية (weekly goals)
 * - فشل البيلدات في Jenkins (jenkins failures)
 * - تكليفات Jira الجديدة (jira assignments)
 * 
 * التقنيات المستخدمة:
 * - Prisma ORM للتخزين الدائم
 * - تكامل مع الخدمات الأخرى
 * - معالجة مجدولة تلقائية
 * 
 * الملاحظات:
 * - يدعم التذكيرات الذكية القائمة على الوقت
 * - يتكامل مع أنظمة خارجية (Jira, Jenkins)
 * - يوفر تتبعاً شاملاً للأهداف والتقدم
 */
export class NotificationService {
  async createNotification(data: NotificationData): Promise<any> {
    try {
      const notification = await prisma.notification.create({
        data: {
          ...data,
          sentAt: new Date(),
        },
      });
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getNotifications(unreadOnly: boolean = false): Promise<any[]> {
    try {
      const where = unreadOnly ? { isRead: false } : {};
      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      console.log('Attempting to delete notification:', notificationId);
      
      // First check if notification exists
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });
      
      if (!notification) {
        console.log('Notification not found:', notificationId);
        throw new Error('Notification not found');
      }
      
      console.log('Found notification, deleting...');
      await prisma.notification.delete({
        where: { id: notificationId },
      });
      
      console.log('Notification deleted successfully');
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async createReminder(data: ReminderData): Promise<any> {
    try {
      const reminder = await prisma.reminder.create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          frequency: data.frequency,
          intervalMinutes: data.intervalMinutes,
          scheduledTime: data.scheduledTime,
          isActive: true,
        } as any,
      });
      return reminder;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }

  async getReminders(): Promise<any[]> {
    try {
      const reminders = await prisma.reminder.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      return reminders;
    } catch (error) {
      console.error('Error fetching reminders:', error);
      return [];
    }
  }

  async updateReminder(reminderId: string, data: Partial<ReminderData>): Promise<any> {
    try {
      const reminder = await prisma.reminder.update({
        where: { id: reminderId },
        data,
      });
      return reminder;
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  }

  async deleteReminder(reminderId: string): Promise<void> {
    try {
      await prisma.reminder.delete({
        where: { id: reminderId },
      });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }

  async createWeeklyGoal(data: WeeklyGoalData): Promise<any> {
    try {
      const goal = await prisma.weeklyGoal.create({
        data: {
          ...data,
          currentValue: 0,
          isCompleted: false,
        },
      });
      return goal;
    } catch (error) {
      console.error('Error creating weekly goal:', error);
      throw error;
    }
  }

  async getWeeklyGoals(): Promise<any[]> {
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const goals = await prisma.weeklyGoal.findMany({
        where: {
          weekStart: {
            gte: weekStart,
          },
          weekEnd: {
            lte: weekEnd,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return goals;
    } catch (error) {
      console.error('Error fetching weekly goals:', error);
      return [];
    }
  }

  async updateWeeklyGoal(goalId: string, data: Partial<WeeklyGoalData>): Promise<any> {
    try {
      const goal = await prisma.weeklyGoal.update({
        where: { id: goalId },
        data,
      });
      return goal;
    } catch (error) {
      console.error('Error updating weekly goal:', error);
      throw error;
    }
  }

  async updateGoalProgress(goalId: string, currentValue: number): Promise<any> {
    try {
      // First get the goal to check its target value
      const existingGoal = await prisma.weeklyGoal.findUnique({
        where: { id: goalId },
      });
      
      if (!existingGoal) {
        throw new Error('Goal not found');
      }

      const isCompleted = existingGoal.targetValue ? currentValue >= existingGoal.targetValue : false;

      const goal = await prisma.weeklyGoal.update({
        where: { id: goalId },
        data: {
          currentValue,
          isCompleted,
        },
      });
      return goal;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  async deleteWeeklyGoal(goalId: string): Promise<void> {
    try {
      await prisma.weeklyGoal.delete({
        where: { id: goalId },
      });
    } catch (error) {
      console.error('Error deleting weekly goal:', error);
      throw error;
    }
  }

  // Desktop Notifications
  async showDesktopNotification(title: string, message: string): Promise<void> {
    try {
      // Check if running in browser environment
      if (typeof window === 'undefined') {
        console.log('Desktop notifications not available in server environment');
        return;
      }

      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.log('This browser does not support desktop notifications');
        return;
      }

      // Request permission if not granted
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Notification permission denied');
          return;
        }
      }

      // Show desktop notification
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'productivity-dashboard',
          requireInteraction: false,
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        // Click handler to open dashboard
        notification.onclick = () => {
          if (typeof window !== 'undefined') {
            window.focus();
          }
          notification.close();
        };
      }
    } catch (error) {
      console.error('Error showing desktop notification:', error);
    }
  }
  async checkCurrentTasks(): Promise<void> {
    try {
      // Get today's time entries to find current task
      const todayEntries = await timeTrackingService.getTodayTimeEntries();
      const activeEntry = todayEntries.find(entry => !entry.endTime); // Task without end time is active
      
      if (activeEntry) {
        // Get active Jira tasks
        const tickets = await jiraService.getAssignedTickets();
        const activeTasks = tickets.filter(ticket => 
          !['Done', 'Closed', 'Resolved'].includes(ticket.status)
        );
        
        const notificationTitle = '⏰ Current Task Reminder';
        const notificationMessage = `You're currently working on: "${activeEntry.description}" (${activeEntry.category}). Active tasks: ${activeTasks.length}`;
        
        // Create in-app notification
        await this.createNotification({
          type: 'current_task',
          title: notificationTitle,
          message: notificationMessage,
        });

        // Show desktop notification
        await this.showDesktopNotification(notificationTitle, notificationMessage);
      } else {
        const notificationTitle = '⏰ Task Status Check';
        const notificationMessage = 'No active task found. Consider starting a new task to track your productivity!';
        
        // Create in-app notification
        await this.createNotification({
          type: 'current_task',
          title: notificationTitle,
          message: notificationMessage,
        });

        // Show desktop notification
        await this.showDesktopNotification(notificationTitle, notificationMessage);
      }
    } catch (error) {
      console.error('Error checking current tasks:', error);
    }
  }

  // Smart Reminders
  async sendBreakReminder(): Promise<void> {
    try {
      await this.createNotification({
        type: 'break_reminder',
        title: 'Break Time! 🌟',
        message: 'Time to take a break! Stretch, walk around, and rest your eyes.',
      });
    } catch (error) {
      console.error('Error sending break reminder:', error);
    }
  }

  async checkTaskDeadlines(): Promise<void> {
    try {
      const tickets = await jiraService.getAssignedTickets();
      const upcomingDeadlines = tickets.filter(ticket => {
        // Check if ticket is approaching deadline (you can customize this logic)
        const updatedTime = new Date(ticket.lastUpdated);
        const daysSinceUpdate = (Date.now() - updatedTime.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 2 && !['Done', 'Closed', 'Resolved'].includes(ticket.status);
      });

      for (const ticket of upcomingDeadlines) {
        await this.createNotification({
          type: 'deadline_alert',
          title: `Task Deadline Alert: ${ticket.id}`,
          message: `Task "${ticket.summary}" hasn't been updated in a while and may need attention.`,
        });
      }
    } catch (error) {
      console.error('Error checking task deadlines:', error);
    }
  }

  async generateDailySummary(): Promise<void> {
    try {
      const todayEntries = await timeTrackingService.getTodayTimeEntries();
      const totalMinutes = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
      const totalHours = (totalMinutes / 60).toFixed(1);

      const tickets = await jiraService.getAssignedTickets();
      const activeTasks = tickets.filter(ticket => 
        !['Done', 'Closed', 'Resolved'].includes(ticket.status)
      ).length;

      await this.createNotification({
        type: 'daily_summary',
        title: 'Daily Productivity Summary 📊',
        message: `Today: ${totalHours}h worked, ${activeTasks} active tasks. Great job!`,
      });
    } catch (error) {
      console.error('Error generating daily summary:', error);
    }
  }

  // Integration Alerts
  async checkJenkinsBuilds(): Promise<void> {
    try {
      const recentBuilds = await jenkinsService.getRecentBuilds(5);
      // Note: JenkinsService.getRecentBuilds only returns number and url
      // We would need to extend it to include build status or use a different method
      // For now, we'll skip the failure check or assume all builds need checking
      
      for (const build of recentBuilds) {
        // You could fetch detailed build info here if needed
        // await this.createNotification({
        //   type: 'jenkins_failure',
        //   title: `Jenkins Build #${build.number}`,
        //   message: `Build ${build.number} completed. Please check the build logs.`,
        // });
      }
    } catch (error) {
      console.error('Error checking Jenkins builds:', error);
    }
  }

  async checkJiraAssignments(): Promise<void> {
    try {
      // This would typically compare with previous state
      // For now, we'll just notify about new high-priority assignments
      const tickets = await jiraService.getAssignedTickets();
      const highPriorityTickets = tickets.filter(ticket => 
        ticket.priority && ['Highest', 'High', 'Critical'].includes(ticket.priority) &&
        !['Done', 'Closed', 'Resolved'].includes(ticket.status)
      );

      for (const ticket of highPriorityTickets) {
        await this.createNotification({
          type: 'jira_assignment',
          title: `High Priority Assignment: ${ticket.id}`,
          message: `You have a high priority task: "${ticket.summary}"`,
        });
      }
    } catch (error) {
      console.error('Error checking Jira assignments:', error);
    }
  }

  // Weekly Goals Progress Check
  async checkWeeklyGoalsProgress(): Promise<void> {
    try {
      const goals = await this.getWeeklyGoals();
      
      for (const goal of goals) {
        if (!goal.isCompleted) {
          const progressPercent = goal.targetValue 
            ? Math.round((goal.currentValue / goal.targetValue) * 100)
            : 0;

          if (progressPercent >= 80 && progressPercent < 100) {
            await this.createNotification({
              type: 'weekly_goal',
              title: `Goal Almost Complete! 🎯`,
              message: `"${goal.title}" is ${progressPercent}% complete. Keep going!`,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking weekly goals progress:', error);
    }
  }

  // Process all scheduled reminders and notifications
  async processScheduledTasks(): Promise<void> {
    try {
      // Check break reminders
      const breakReminders = await prisma.reminder.findMany({
        where: { 
          type: 'break', 
          isActive: true,
          frequency: 'daily'
        },
      });

      for (const reminder of breakReminders) {
        if (reminder.scheduledTime) {
          const now = new Date();
          const [hours, minutes] = reminder.scheduledTime.split(':').map(Number);
          const scheduledTime = new Date();
          scheduledTime.setHours(hours, minutes, 0, 0);

          // Check if it's time to send the reminder (within 1 minute window)
          const timeDiff = Math.abs(now.getTime() - scheduledTime.getTime());
          const lastTriggered = reminder.lastTriggered ? new Date(reminder.lastTriggered) : new Date(0);
          
          if (timeDiff < 60000 && now.getTime() - lastTriggered.getTime() > 23 * 60 * 60 * 1000) {
            await this.sendBreakReminder();
            await prisma.reminder.update({
              where: { id: reminder.id },
              data: { lastTriggered: new Date() },
            });
          }
        }
      }

      // Check current task reminders with interval frequency
      const currentTaskReminders = await prisma.reminder.findMany({
        where: { 
          type: 'current_task', 
          isActive: true,
          frequency: 'interval'
        },
      });

      for (const reminder of currentTaskReminders) {
        const now = new Date();
        const lastTriggered = reminder.lastTriggered ? new Date(reminder.lastTriggered) : new Date(0);
        const intervalMs = ((reminder as any).intervalMinutes || 5) * 60 * 1000;
        
        // Check if enough time has passed since last trigger
        if (now.getTime() - lastTriggered.getTime() >= intervalMs) {
          await this.checkCurrentTasks();
          await prisma.reminder.update({
            where: { id: reminder.id },
            data: { lastTriggered: new Date() },
          });
        }
      }

      // Check current task reminders with daily frequency
      const dailyCurrentTaskReminders = await prisma.reminder.findMany({
        where: { 
          type: 'current_task', 
          isActive: true,
          frequency: 'daily'
        },
      });

      for (const reminder of dailyCurrentTaskReminders) {
        if (reminder.scheduledTime) {
          const now = new Date();
          const [hours, minutes] = reminder.scheduledTime.split(':').map(Number);
          const scheduledTime = new Date();
          scheduledTime.setHours(hours, minutes, 0, 0);

          // Check if it's time to send the reminder (within 1 minute window)
          const timeDiff = Math.abs(now.getTime() - scheduledTime.getTime());
          const lastTriggered = reminder.lastTriggered ? new Date(reminder.lastTriggered) : new Date(0);
          
          if (timeDiff < 60000 && now.getTime() - lastTriggered.getTime() > 23 * 60 * 60 * 1000) {
            await this.checkCurrentTasks();
            await prisma.reminder.update({
              where: { id: reminder.id },
              data: { lastTriggered: new Date() },
            });
          }
        }
      }

      // Check other scheduled tasks
      await this.checkTaskDeadlines();
      await this.checkJenkinsBuilds();
      await this.checkJiraAssignments();
      await this.checkWeeklyGoalsProgress();
    } catch (error) {
      console.error('Error processing scheduled tasks:', error);
    }
  }
}

export const notificationService = new NotificationService();
