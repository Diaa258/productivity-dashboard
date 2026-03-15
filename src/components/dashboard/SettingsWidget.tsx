'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Save, TestTube } from 'lucide-react';

interface JiraSettings {
  username: string;
  password: string;
  baseUrl: string;
}

interface JenkinsSettings {
  baseUrl: string;
  jobPath: string;
}

export default function SettingsWidget() {
  const [jiraSettings, setJiraSettings] = useState<JiraSettings>({
    username: '',
    password: '',
    baseUrl: '',
  });
  
  const [jenkinsSettings, setJenkinsSettings] = useState<JenkinsSettings>({
    baseUrl: '',
    jobPath: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState<'jira' | 'jenkins' | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load from environment or localStorage
      setJiraSettings({
        username: process.env.NEXT_PUBLIC_JIRA_USERNAME || 'v-diaaeldin.saved',
        password: process.env.NEXT_PUBLIC_JIRA_PASSWORD || 'Yousef@01141739623',
        baseUrl: process.env.NEXT_PUBLIC_JIRA_BASE_URL || 'https://jira.emaratech.ae',
      });
      
      setJenkinsSettings({
        baseUrl: process.env.NEXT_PUBLIC_JENKINS_BASE_URL || '',
        jobPath: process.env.NEXT_PUBLIC_JENKINS_JOB_PATH || '',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save to localStorage for demo purposes
      localStorage.setItem('jiraSettings', JSON.stringify(jiraSettings));
      localStorage.setItem('jenkinsSettings', JSON.stringify(jenkinsSettings));
      
      setTestResult({ success: true, message: 'Settings saved successfully!' });
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to save settings' });
    } finally {
      setLoading(false);
    }
  };

  const testJiraConnection = async () => {
    setTesting('jira');
    try {
      // Test basic connectivity first
      console.log('Testing Jira connection...');
      console.log('URL:', jiraSettings.baseUrl);
      console.log('Username:', jiraSettings.username);
      
      const response = await fetch('/api/jira/tickets', {
        headers: {
          'Authorization': `Basic ${btoa(`${jiraSettings.username}:${jiraSettings.password}`)}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        setTestResult({ success: true, message: `Jira connection successful! Found ${data.data?.length || 0} tickets.` });
      } else {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        setTestResult({ success: false, message: `Jira connection failed (${response.status}): ${errorData}` });
      }
    } catch (error) {
      console.error('Connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult({ success: false, message: `Jira connection failed: ${errorMessage}` });
    } finally {
      setTesting(null);
      setTimeout(() => setTestResult(null), 10000); // Keep message longer for debugging
    }
  };

  const testJiraConnectivity = async () => {
    setTesting('jira');
    try {
      console.log('Testing Jira basic connectivity...');
      
      const response = await fetch('/api/jira/test', {
        headers: {
          'Authorization': `Basic ${btoa(`${jiraSettings.username}:${jiraSettings.password}`)}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('Test results:', data);
      
      if (data.success) {
        const workingEndpoint = data.results.find((r: any) => r.success);
        if (workingEndpoint) {
          setTestResult({ 
            success: true, 
            message: `Jira connectivity OK! Working endpoint: ${workingEndpoint.endpoint}` 
          });
        } else {
          setTestResult({ 
            success: false, 
            message: `Jira connectivity failed. No working endpoints found.` 
          });
        }
      } else {
        setTestResult({ success: false, message: `Jira test failed: ${data.error}` });
      }
    } catch (error) {
      console.error('Test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult({ success: false, message: `Jira test failed: ${errorMessage}` });
    } finally {
      setTesting(null);
      setTimeout(() => setTestResult(null), 15000);
    }
  };

  const testJenkinsConnection = async () => {
    setTesting('jenkins');
    try {
      const response = await fetch('/api/jenkins/builds');
      
      if (response.ok) {
        setTestResult({ success: true, message: 'Jenkins connection successful!' });
      } else {
        setTestResult({ success: false, message: 'Jenkins connection failed. Check URL.' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Jenkins connection failed. Network error.' });
    } finally {
      setTesting(null);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          إعدادات النظام
        </CardTitle>
        <CardDescription>
          قم بإعداد اتصال Jira و Jenkins
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Test Result Message */}
          {testResult && (
            <div className={`p-4 rounded-lg ${
              testResult.success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {testResult.message}
            </div>
          )}

          {/* Jira Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">إعدادات Jira</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المستخدم
                </label>
                <Input
                  type="text"
                  placeholder="your-username"
                  value={jiraSettings.username}
                  onChange={(e) => setJiraSettings(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <Input
                  type="password"
                  placeholder="Your password"
                  value={jiraSettings.password}
                  onChange={(e) => setJiraSettings(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط Jira Base URL
                </label>
                <Input
                  type="url"
                  placeholder="https://your-domain.atlassian.net"
                  value={jiraSettings.baseUrl}
                  onChange={(e) => setJiraSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={testJiraConnectivity}
                disabled={testing === 'jira' || !jiraSettings.username || !jiraSettings.password || !jiraSettings.baseUrl}
                className="flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                {testing === 'jira' ? 'جاري الفحص...' : 'فحص الاتصال'}
              </Button>
              <Button
                variant="outline"
                onClick={testJiraConnection}
                disabled={testing === 'jira' || !jiraSettings.username || !jiraSettings.password || !jiraSettings.baseUrl}
                className="flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                {testing === 'jira' ? 'جاري الاختبار...' : 'اختبار التذاكر'}
              </Button>
            </div>
          </div>

          {/* Jenkins Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">إعدادات Jenkins</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط Jenkins Base URL
                </label>
                <Input
                  type="url"
                  placeholder="https://jenkins.your-company.com"
                  value={jenkinsSettings.baseUrl}
                  onChange={(e) => setJenkinsSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مسار الوظيفة Job Path
                </label>
                <Input
                  placeholder="job/Payment%20Domain%20Automation%20Job/job/pretest"
                  value={jenkinsSettings.jobPath}
                  onChange={(e) => setJenkinsSettings(prev => ({ ...prev, jobPath: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={testJenkinsConnection}
              disabled={testing === 'jenkins' || !jenkinsSettings.baseUrl}
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              {testing === 'jenkins' ? 'جاري الاختبار...' : 'اختبار الاتصال'}
            </Button>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={saveSettings}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
