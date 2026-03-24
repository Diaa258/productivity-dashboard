'use client';

// Client-side notification service for desktop notifications
export class ClientNotificationService {
  private static instance: ClientNotificationService;
  private isSupported: boolean = false;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window;
    this.permission = typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  }

  static getInstance(): ClientNotificationService {
    if (!ClientNotificationService.instance) {
      ClientNotificationService.instance = new ClientNotificationService();
    }
    return ClientNotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.log('Desktop notifications not supported');
      return false;
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    return this.permission === 'granted';
  }

  async showNotification(title: string, message: string, options?: NotificationOptions): Promise<void> {
    if (!this.isSupported) {
      console.log('Desktop notifications not supported');
      return;
    }

    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        console.log('Notification permission denied');
        return;
      }
    }

    const notification = new Notification(title, {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'productivity-dashboard',
      requireInteraction: false,
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Click handler to focus window
    notification.onclick = () => {
      if (typeof window !== 'undefined') {
        window.focus();
      }
      notification.close();
    };
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  isNotificationSupported(): boolean {
    return this.isSupported;
  }
}

export const clientNotificationService = ClientNotificationService.getInstance();
