'use client';

import React, { useState, useEffect } from 'react';
import { SimpleNotificationManager } from '@/utils/SimpleNotificationManager';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationTestPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const notifs = await SimpleNotificationManager.getNotifications();
    setNotifications(notifs);
    setLoading(false);
  };

  const clearAll = async () => {
    setMessage('Clearing all notifications...');
    const success = await SimpleNotificationManager.clearAllNotifications();
    if (success) {
      setMessage('✅ All notifications cleared successfully!');
      setNotifications([]);
    } else {
      setMessage('❌ Failed to clear notifications');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const markAllRead = async () => {
    setMessage('Marking all as read...');
    const success = await SimpleNotificationManager.markAllAsRead();
    if (success) {
      setMessage('✅ All notifications marked as read!');
      await loadNotifications();
    } else {
      setMessage('❌ Failed to mark as read');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Notification Manager</h1>
        
        {message && (
          <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded-lg">
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              🗑️ Clear All Notifications
            </button>
            <button
              onClick={markAllRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ✅ Mark All as Read
            </button>
            <button
              onClick={loadNotifications}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              🔄 Refresh
            </button>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            Total notifications: {notifications.length}
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No notifications found
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 border rounded-lg ${
                    notif.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{notif.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{notif.message}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(notif.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="ml-4">
                      {notif.isRead ? (
                        <span className="text-xs text-green-600">✅ Read</span>
                      ) : (
                        <span className="text-xs text-blue-600">🔔 Unread</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Quick Fix Instructions:</h3>
          <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
            <li>Click "🗑️ Clear All Notifications" to delete all notifications</li>
            <li>Click "✅ Mark All as Read" to mark all as read without deleting</li>
            <li>Click "🔄 Refresh" to reload the list</li>
            <li>If buttons don't work, refresh the page and try again</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
