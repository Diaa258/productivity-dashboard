'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, RefreshCw, Settings, TrendingUp, Users, Activity, Bell, LogOut, Trash2 } from 'lucide-react';
import JiraTasksWidget from './JiraTasksWidget';
import JenkinsReportWidget from './JenkinsReportWidget';
import OutlookEmailWidget from './OutlookEmailWidget';
import TimeTrackingWidget from './TimeTrackingWidget';
import DailySummaryWidget from './DailySummaryWidget';
import WeeklyAnalyticsWidget from './WeeklyAnalyticsWidget';
import QuickStatsWidget from './QuickStatsWidget';
import SettingsPopup from './SettingsPopup';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { logout, credentials } = useAuth();

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Productivity Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {credentials && (
              <p className="text-sm text-gray-500 mt-1">
                المستخدم: {credentials.username}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {isClient ? currentTime.toLocaleTimeString() : ''}
            </div>
            <Button
              variant="outline"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh All
            </Button>
            <NotificationBell />
            <SettingsPopup>
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </SettingsPopup>
            <Button
              variant="outline"
              onClick={logout}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 text-gray-900 bg-white">
        {/* Today's Summary */}
        <DailySummaryWidget />

        {/* Time Tracking */}
        <TimeTrackingWidget />

        {/* Weekly Analytics */}
        <WeeklyAnalyticsWidget />

        {/* Quick Stats */}
        <QuickStatsWidget />

        {/* Jira Tasks */}
        <div className="xl:col-span-2">
          <JiraTasksWidget />
        </div>

        {/* Jenkins Report */}
        <JenkinsReportWidget />

        {/* Outlook Emails */}
        <OutlookEmailWidget />

      </div>
    </div>
  );
}
