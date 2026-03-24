'use client';

import React, { useState, useEffect } from 'react';
import { backgroundNotificationService } from '@/services/backgroundNotificationService';

export default function BackgroundNotificationTest() {
  const [status, setStatus] = useState('Initializing...');
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    async function init() {
      try {
        // Initialize background service
        await backgroundNotificationService.initialize();
        setStatus('Background service initialized');
        
        // Get permission status
        if ('Notification' in window) {
          setPermission(Notification.permission);
        }
      } catch (error: any) {
        setStatus('Error: ' + error.message);
      }
    }
    
    init();
  }, []);

  const requestPermission = async () => {
    const granted = await backgroundNotificationService.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
  };

  const testNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Test Notification', {
        body: 'This is a test desktop notification!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test',
        requireInteraction: false,
      });
      
      setTimeout(() => notification.close(), 5000);
    } else {
      alert('Please grant notification permission first');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Background Notifications Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Background Service:</span>
              <span className="font-medium">{status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Notification Permission:</span>
              <span className="font-medium">{permission}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            {permission !== 'granted' && (
              <button
                onClick={requestPermission}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Request Notification Permission
              </button>
            )}
            
            <button
              onClick={testNotification}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Test Desktop Notification
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
          <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-2">
            <li>Click "Request Notification Permission" if needed</li>
            <li>Click "Test Desktop Notification" to test</li>
            <li>Background notifications will appear every minute</li>
            <li>You can close this tab - notifications will still work</li>
            <li>Check your system notification area</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
