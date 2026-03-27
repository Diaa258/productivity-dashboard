'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { DailySummary } from '@/types';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/utils/dateUtils';

export default function DailySummaryWidget() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailySummary();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDailySummary, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDailySummary = async () => {
    try {
      const response = await fetch('/api/time-tracking/summary?type=daily');
      const data = await response.json();
      if (data.success) {
        setSummary({
          ...data.data,
          date: new Date(data.data.date),
        });
      }
    } catch (error) {
      console.error('Error fetching daily summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Calendar className="w-5 h-5" />
            Today's Summary
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Summary
          </CardTitle>
          <CardDescription>
            Your daily work summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No data available for today
          </div>
        </CardContent>
      </Card>
    );
  }

  const requiredHours = summary.remaining + summary.worked;
  const progressPercentage = requiredHours > 0 ? (summary.worked / requiredHours) * 100 : 0;
  const isOvertime = summary.overtime > 0;

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            Today's Summary
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDailySummary}
            className="flex items-center gap-2 h-8 px-2 sm:px-3 text-xs sm:text-sm"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          {summary.date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {formatDuration(summary.worked)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                Worked
              </div>
            </div>
            <div className="text-center">
              <div className={`text-xl sm:text-2xl font-bold ${isOvertime ? 'text-orange-600' : 'text-green-600'}`}>
                {isOvertime ? `+${formatDuration(summary.overtime)}` : formatDuration(summary.remaining)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center gap-1">
                {isOvertime ? (
                  <>
                    <TrendingUp className="w-3 h-3" />
                    Overtime
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    Remaining
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Daily Progress</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress
              value={Math.min(progressPercentage, 100)}
              className="h-2"
            />
            {isOvertime && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <AlertCircle className="w-4 h-4" />
                You've worked {formatDuration(summary.overtime)} overtime today
              </div>
            )}
          </div>

          {/* Time Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Time Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Standard Hours</span>
                <span className="text-sm font-medium">
                  {formatDuration(requiredHours - summary.overtime)}
                </span>
              </div>
              {isOvertime && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-600">Overtime</span>
                  <span className="text-sm font-medium text-orange-600">
                    +{formatDuration(summary.overtime)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Total</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatDuration(summary.worked)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className={`p-3 rounded-lg ${isOvertime
              ? 'bg-orange-50 border border-orange-200'
              : summary.worked > 0 && summary.remaining === 0
                ? 'bg-green-50 border border-green-200'
                : summary.worked === 0
                  ? 'bg-gray-50 border border-gray-200'
                  : 'bg-blue-50 border border-blue-200'
            }`}>
            <div className="flex items-center gap-2">
              {isOvertime ? (
                <TrendingUp className="w-4 h-4 text-orange-600" />
              ) : summary.worked > 0 && summary.remaining === 0 ? (
                <Clock className="w-4 h-4 text-green-600" />
              ) : summary.worked === 0 ? (
                <Clock className="w-4 h-4 text-gray-600" />
              ) : (
                <Clock className="w-4 h-4 text-blue-600" />
              )}
              <span className={`text-sm font-medium ${isOvertime
                  ? 'text-orange-800'
                  : summary.worked > 0 && summary.remaining === 0
                    ? 'text-green-800'
                    : summary.worked === 0
                      ? 'text-gray-800'
                      : 'text-blue-800'
                }`}>
                {isOvertime
                  ? 'Great job! You\'ve completed your work hours and more.'
                  : summary.worked > 0 && summary.remaining === 0
                    ? 'Perfect! You\'ve completed your work hours for today.'
                    : summary.worked === 0
                      ? 'Start tracking your time to see your daily progress.'
                      : `You have ${formatDuration(summary.remaining)} remaining to complete your work hours.`
                }
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
