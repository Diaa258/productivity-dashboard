'use client';

// Background notification service
export class BackgroundNotificationService {
  private static instance: BackgroundNotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): BackgroundNotificationService {
    if (!BackgroundNotificationService.instance) {
      BackgroundNotificationService.instance = new BackgroundNotificationService();
    }
    return BackgroundNotificationService.instance;
  }

  async initialize(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
        
        // Start background checking
        this.startBackgroundChecking();
        
        // Request notification permission
        await this.requestPermission();
        
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        // Fallback to regular checking
        this.startRegularChecking();
      }
    } else {
      console.log('Service Worker not supported, using fallback');
      this.startRegularChecking();
    }
  }

  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  private startBackgroundChecking(): void {
    // Check for notifications every minute
    this.intervalId = setInterval(async () => {
      try {
        // Trigger background sync
        if (this.registration && 'sync' in this.registration) {
          await (this.registration as any).sync.register('background-sync');
        }
        
        // Also check directly
        await this.checkAndShowNotifications();
      } catch (error) {
        console.error('Background check error:', error);
      }
    }, 60000); // Every minute
  }

  private startRegularChecking(): void {
    // Fallback: check notifications every minute
    this.intervalId = setInterval(async () => {
      await this.checkAndShowNotifications();
    }, 60000); // Every minute
  }

  private async checkAndShowNotifications(): Promise<void> {
    try {
      const response = await fetch('/api/notifications?unreadOnly=true');
      const notifications: any[] = await response.json();
      
      if (notifications.length > 0) {
        console.log(`Found ${notifications.length} new notifications`);
        
        notifications.forEach((notification: any) => {
          this.showDesktopNotification(notification.title, notification.message);
        });
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }

  private showDesktopNotification(title: string, message: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'productivity-dashboard',
        requireInteraction: false,
      });

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Click handler
      notification.onclick = () => {
        if (typeof window !== 'undefined') {
          window.focus();
        }
        notification.close();
      };
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const backgroundNotificationService = BackgroundNotificationService.getInstance();
