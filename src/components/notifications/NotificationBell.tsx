'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { clientNotificationService } from '@/services/clientNotificationService';
import { backgroundNotificationService } from '@/services/backgroundNotificationService';
import NotificationPanel from './NotificationPanel';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    
    // Request notification permission on first load
    clientNotificationService.requestPermission();
    
    // Set up periodic polling for new notifications
    const interval = setInterval(fetchUnreadCount, 5000); // Check every 5 seconds for testing
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications?unreadOnly=true');
      if (response.ok) {
        const notifications = await response.json();
        const newCount = notifications.length;
        
        // Show desktop notification for new notifications
        if (newCount > unreadCount && notifications.length > 0) {
          const latestNotification = notifications[0];
          clientNotificationService.showNotification(
            latestNotification.title,
            latestNotification.message
          );
        }
        
        setUnreadCount(newCount);
        console.log('NotificationBell: Fetched notifications:', newCount, 'unread');
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchUnreadCount();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={togglePanel}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
