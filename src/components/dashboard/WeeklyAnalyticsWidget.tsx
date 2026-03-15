'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Download } from 'lucide-react';
import { WeeklyReport } from '@/types';
import { useRefresh } from '@/contexts/RefreshContext';

export default function WeeklyAnalyticsWidget() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const { isRefreshing } = useRefresh();

  useEffect(() => {
    fetchWeeklyReport();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchWeeklyReport, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Re-fetch when global refresh is triggered
    if (isRefreshing) {
      fetchWeeklyReport();
    }
  }, [isRefreshing]);

  const fetchWeeklyReport = async () => {
    try {
      const response = await fetch('/api/time-tracking/summary?type=weekly');
      const data = await response.json();
      if (data.success) {
        setReport(data.data);
      }
    } catch (error) {
      console.error('Error fetching weekly report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await fetch('/api/time-tracking/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'weekly-analytics.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  if (loading) {
    return (
      <Card className="col-span-full lg:col-span-2 xl:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Weekly Analytics
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className="col-span-full lg:col-span-2 xl:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Weekly Analytics
          </CardTitle>
          <CardDescription>
            Your weekly productivity insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No data available for this week
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-2 xl:col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Weekly Analytics
            </CardTitle>
            <CardDescription>
              Your weekly productivity insights
            </CardDescription>
          </div>
          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Total Hours Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {report.totalHours.toFixed(1)}h
              </div>
              <div className="text-sm text-gray-600">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(report.totalHours / 5).toFixed(1)}h
              </div>
              <div className="text-sm text-gray-600">Daily Average</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Category Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(report.categoryBreakdown)
                .filter(([_, minutes]) => minutes > 0)
                .map(([category, minutes]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{category}:</span>
                    <span className="text-sm font-medium">{(minutes / 60).toFixed(1)}h</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Daily Hours */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Daily Hours</h4>
            <div className="space-y-2">
              {Object.entries(report.dailyHours).map(([date, hours]) => {
                const dateObj = new Date(date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <div key={date} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{dayName}:</span>
                    <span className="text-sm font-medium">{hours.toFixed(1)}h</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Notes */}
          {report.notes.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Recent Notes</h4>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {report.notes.slice(0, 3).map((note, index) => (
                  <p key={index} className="text-sm text-gray-600 truncate">
                    • {note}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}