'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2, AlertTriangle, CheckCircle, Clock, Target, ChevronDown, ChevronUp, List, Users, TestTube } from 'lucide-react';

interface QuickStatsData {
  todayFocus: string;
  weekProgress: number;
  activeTasks: number;
  testPassRate: number;
  lastUpdated: string;
  metadata?: {
    totalTodayMinutes: number;
    weeklyHours: number;
    requiredWeeklyHours: number;
  };
}

interface TaskDetail {
  id: string;
  summary: string;
  status: string;
  priority?: string;
  storyPoints?: number;
  issuetype?: string;
}

interface TestCaseDetail {
  scenario: string;
  status: string;
  feature: string;
  subGroup: string;
}

export default function QuickStatsWidget() {
  const [stats, setStats] = useState<QuickStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<string | null>(null);
  const [taskDetails, setTaskDetails] = useState<TaskDetail[]>([]);
  const [testDetails, setTestDetails] = useState<TestCaseDetail[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/quick-stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching quick stats:', err);
        setError('Failed to load stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchTaskDetails = async () => {
    if (expandedSection === 'tasks') {
      setExpandedSection(null);
      return;
    }

    setExpandedSection('tasks');
    setDetailsLoading('tasks');
    
    try {
      // Get credentials from localStorage or use hardcoded
      const username = 'v-diaaeldin.saved';
      const password = 'Yousef@01141739623';
      
      const response = await fetch('/api/jira/tickets', {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const completedStatuses = ['Done', 'Closed', 'Resolved', 'Complete', 'Finished'];
        const activeTasks = data.data.filter((ticket: any) => 
          ticket.status && !completedStatuses.some(status => 
            ticket.status.toLowerCase().includes(status.toLowerCase())
          )
        );
        console.log('=== FRONTEND DEBUG ===');
        console.log('Total tickets from API:', data.data.length);
        console.log('Active tasks filtered:', activeTasks.length);
        console.log('Active tasks:', activeTasks.map((t: any) => `${t.id} - ${t.issuetype} - ${t.status}`));
        setTaskDetails(activeTasks); // Show all active tasks
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
    } finally {
      setDetailsLoading(null);
    }
  };

  const fetchTestDetails = async () => {
    if (expandedSection === 'tests') {
      setExpandedSection(null);
      return;
    }

    setExpandedSection('tests');
    setDetailsLoading('tests');
    
    try {
      // Get latest Jenkins build
      const buildsResponse = await fetch('/api/jenkins/builds');
      if (buildsResponse.ok) {
        const buildsData = await buildsResponse.json();
        if (buildsData.data && buildsData.data.length > 0) {
          const latestBuild = buildsData.data[0];
          const reportResponse = await fetch(`/api/jenkins/report?buildNumber=${latestBuild.number}`);
          
          if (reportResponse.ok) {
            const reportData = await reportResponse.json();
            setTestDetails(reportData.data.slice(0, 5)); // Show max 5 test cases
          }
        }
      }
    } catch (error) {
      console.error('Error fetching test details:', error);
    } finally {
      setDetailsLoading(null);
    }
  };

  const formatFocusText = (focus: string) => {
    const focusMap: Record<string, string> = {
      meetings: 'Meetings',
      calls: 'Calls',
      scripting: 'Development',
      refactoring: 'Refactoring',
      break: 'Break',
      investigate: 'Investigation',
      reporting: 'Reporting',
    };
    return focusMap[focus] || focus;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressInsight = (progress: number) => {
    if (progress >= 80) return 'ممتاز! تقدمك رائع هذا الأسبوع 🎯';
    if (progress >= 50) return 'جيد! استمر في العمل بنفس الوتيرة 💪';
    if (progress >= 25) return 'تحتاج للمزيد من الجهد هذا الأسبوع ⚡';
    return 'تبدأ من جديد! حان وقت العمل 🚀';
  };

  const getTasksInsight = (tasks: number) => {
    if (tasks === 0) return 'لا توجد مهام نشطة حالياً 😌';
    if (tasks <= 3) return 'عبء عمل خفيف ومريح ✨';
    if (tasks <= 6) return 'عدد مهام معقول ومتوازن ⚖️';
    if (tasks <= 10) return 'عبء عمل متوسط، ركز على الأولويات 🎯';
    return 'عبء عمل ثقيل! حاول تنظيم المهام ⏰';
  };

  const getTestsInsight = (rate: number) => {
    if (rate >= 90) return 'ممتاز! الاختبارات تعمل بشكل مثالي ✅';
    if (rate >= 70) return 'جيد جداً! معظم الاختبارات ناجحة 👍';
    if (rate >= 50) return 'مقبول. يحتاج تحسين في الاختبارات 🔧';
    if (rate >= 30) return 'ضعيف. يحتاج مراجعة شاملة للاختبارات ⚠️';
    return 'مشكلة كبيرة! الاختبارات تحتاج إصلاح عاجل 🚨';
  };

  const getFocusInsight = (focus: string, minutes: number) => {
    if (minutes === 0) return 'لم تبدأ العمل بعد اليوم 🌅';
    if (minutes < 60) return `بدأت للتو في ${formatFocusText(focus)} 🚀`;
    if (minutes < 240) return `تركيز جيد على ${formatFocusText(focus)} 💪`;
    return `إنتاجية عالية في ${formatFocusText(focus)} 🔥`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Stats
          </CardTitle>
          <CardDescription>Your productivity at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Stats
          </CardTitle>
          <CardDescription>Your productivity at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-4">
            {error || 'No data available'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Quick Stats
        </CardTitle>
        <CardDescription>
          Your productivity at a glance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Today's Focus */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Today's Focus</span>
            <span className="text-sm font-medium capitalize">
              {formatFocusText(stats.todayFocus)}
            </span>
          </div>

          {/* Week Progress */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Week Progress</span>
            <span className={`text-sm font-medium ${getProgressColor(stats.weekProgress)}`}>
              {stats.weekProgress}%
            </span>
          </div>

          {/* Active Tasks - Clickable for details */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Active Tasks</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{stats.activeTasks}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchTaskDetails}
                disabled={detailsLoading === 'tasks'}
                className="h-6 w-6 p-0"
              >
                {detailsLoading === 'tasks' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : expandedSection === 'tasks' ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Task Details */}
          {expandedSection === 'tasks' && (
            <div className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <List className="w-4 h-4" />
                تفاصيل المهام النشطة
              </div>
              {taskDetails.length > 0 ? (
                taskDetails.map((task) => (
                  <div key={task.id} className="text-xs border-b pb-2 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-800">{task.id}</div>
                          {task.issuetype && (
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              task.issuetype === 'Task' ? 'bg-blue-100 text-blue-800' :
                              task.issuetype === 'Defect' ? 'bg-red-100 text-red-800' :
                              task.issuetype === 'Story' ? 'bg-green-100 text-green-800' :
                              task.issuetype === 'Bug' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.issuetype}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-600 mt-1">{task.summary}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'To Do' ? 'bg-gray-100 text-gray-800' :
                          task.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' :
                          task.status === 'Draft' ? 'bg-purple-100 text-purple-800' :
                          task.status === 'Withdrawn' ? 'bg-gray-200 text-gray-600' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {task.status}
                        </span>
                        {task.priority && (
                          <span className="text-xs text-gray-500">{task.priority}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500">لا توجد مهام للعرض</div>
              )}
            </div>
          )}

          {/* Tests Passed - Clickable for details */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tests Passed</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                stats.testPassRate >= 80 ? 'text-green-600' : 
                stats.testPassRate >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {stats.testPassRate}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchTestDetails}
                disabled={detailsLoading === 'tests'}
                className="h-6 w-6 p-0"
              >
                {detailsLoading === 'tests' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : expandedSection === 'tests' ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Test Details */}
          {expandedSection === 'tests' && (
            <div className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <TestTube className="w-4 h-4" />
                تفاصيل الاختبارات الأخيرة
              </div>
              {testDetails.length > 0 ? (
                testDetails.map((test, index) => (
                  <div key={index} className="text-xs border-b pb-2 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{test.scenario}</div>
                        <div className="text-gray-600 mt-1">
                          <span className="text-gray-500">{test.subGroup}</span> • {test.feature}
                        </div>
                      </div>
                      <div className="ml-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          test.status === 'PASSED' || test.status === 'Passed' ? 'bg-green-100 text-green-800' :
                          test.status === 'FAILED' || test.status === 'Failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {test.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500">لا توجد اختبارات للعرض</div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
