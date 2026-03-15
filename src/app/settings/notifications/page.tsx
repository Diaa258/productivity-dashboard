'use client';

import React, { useState } from 'react';
import { Bell, Clock, Target, AlertTriangle, Settings, Mail, Smartphone, Home } from 'lucide-react';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import RemindersManager from '@/components/notifications/RemindersManager';
import WeeklyGoalsManager from '@/components/notifications/WeeklyGoalsManager';

type TabType = 'notifications' | 'reminders' | 'goals' | 'settings';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('notifications');
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reminders', label: 'Smart Reminders', icon: Clock },
    { id: 'goals', label: 'Weekly Goals', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Notifications</h3>
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Click the bell icon in the header to view notifications</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Break Reminders</h4>
                    <p className="text-sm text-gray-600">Smart reminders to take breaks and maintain productivity</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Deadline Alerts</h4>
                    <p className="text-sm text-gray-600">Notifications for approaching task deadlines</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <Target className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Daily Summary</h4>
                    <p className="text-sm text-gray-600">End-of-day productivity reports</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Weekly Goals</h4>
                    <p className="text-sm text-gray-600">Progress updates on your weekly goals</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Jenkins Build Alerts</h4>
                    <p className="text-sm text-gray-600">Notifications for build failures</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-indigo-50 rounded-lg">
                  <Bell className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Jira Assignment Changes</h4>
                    <p className="text-sm text-gray-600">Updates for new task assignments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'reminders':
        return <RemindersManager />;
        
      case 'goals':
        return <WeeklyGoalsManager />;
        
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notification Channels</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Browser Notifications</p>
                          <p className="text-sm text-gray-500">Receive notifications in your browser</p>
                        </div>
                      </div>
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                    </label>
                    
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive daily summaries via email</p>
                        </div>
                      </div>
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notification Types</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Break Reminders</p>
                        <p className="text-sm text-gray-500">Smart reminders to take breaks</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                    </label>
                    
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Task Deadline Alerts</p>
                        <p className="text-sm text-gray-500">Notifications for approaching deadlines</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                    </label>
                    
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Daily Summary</p>
                        <p className="text-sm text-gray-500">End-of-day productivity reports</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                    </label>
                    
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Weekly Goal Progress</p>
                        <p className="text-sm text-gray-500">Updates on weekly goal completion</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                    </label>
                    
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Integration Alerts</p>
                        <p className="text-sm text-gray-500">Jenkins build failures, Jira assignments</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Timing Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Daily Summary Time
                      </label>
                      <input
                        type="time"
                        defaultValue="17:00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Break Reminder Interval
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="30">Every 30 minutes</option>
                        <option value="60">Every hour</option>
                        <option value="90">Every 90 minutes</option>
                        <option value="120">Every 2 hours</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications & Reminders</h1>
          <p className="mt-2 text-gray-600">
            Manage your notifications, smart reminders, and weekly goals
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      <div className="relative">
        <NotificationPanel
          isOpen={showNotificationPanel}
          onClose={() => setShowNotificationPanel(false)}
        />
      </div>
    </div>
  );
}
