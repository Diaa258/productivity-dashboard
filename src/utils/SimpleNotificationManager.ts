// Simple working notification manager
export class SimpleNotificationManager {
  static async clearAllNotifications() {
    try {
      const response = await fetch('/api/notifications/clear-all/', {
        method: 'POST',
      });
      
      if (response.ok) {
        console.log('All notifications cleared successfully');
        return true;
      } else {
        console.error('Failed to clear notifications');
        return false;
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return false;
    }
  }

  static async markAllAsRead() {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
      });
      
      if (response.ok) {
        console.log('All notifications marked as read');
        return true;
      } else {
        console.error('Failed to mark all as read');
        return false;
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      return false;
    }
  }

  static async getNotifications() {
    try {
      const response = await fetch('/api/notifications/');
      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to get notifications');
        return [];
      }
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }
}
