'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Settings, Save, TestTube, Info, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MeetingType, MeetingTypesSettings } from '@/types';

interface JiraSettings {
  username: string;
  password: string;
  baseUrl: string;
}

interface JenkinsSettings {
  baseUrl: string;
  jobPath: string;
}

interface StandardHoursSettings {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

interface SettingsPopupProps {
  children: React.ReactNode;
}

export default function SettingsPopup({ children }: SettingsPopupProps) {
  const { credentials } = useAuth();
  const [jiraSettings, setJiraSettings] = useState<JiraSettings>({
    username: '',
    password: '',
    baseUrl: '',
  });
  
  const [jenkinsSettings, setJenkinsSettings] = useState<JenkinsSettings>({
    baseUrl: '',
    jobPath: '',
  });
  
  const [standardHours, setStandardHours] = useState<StandardHoursSettings>({
    monday: 8,
    tuesday: 8,
    wednesday: 8,
    thursday: 8,
    friday: 4,
    saturday: 0,
    sunday: 0,
  });

  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([
    { id: 'stand-up', name: 'Stand Up', enabled: true },
    { id: 'internal-stand-up', name: 'Internal Stand Up', enabled: true },
    { id: 'grooming', name: 'Grooming', enabled: true },
    { id: 'planning', name: 'Planning', enabled: true },
    { id: 'other', name: 'Other', enabled: true },
  ]);
  
  const [newMeetingType, setNewMeetingType] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState<'jira' | 'jenkins' | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [credentials]);

  const loadSettings = async () => {
    try {
      // Load Jira settings from authenticated session
      if (credentials) {
        setJiraSettings({
          username: credentials.username,
          password: credentials.password,
          baseUrl: credentials.baseUrl,
        });
      }
      
      setJenkinsSettings({
        baseUrl: process.env.NEXT_PUBLIC_JENKINS_BASE_URL || '',
        jobPath: process.env.NEXT_PUBLIC_JENKINS_JOB_PATH || '',
      });

      // Load Standard Hours from API
      try {
        const response = await fetch('/api/settings?type=standard-hours');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setStandardHours(data.data);
          }
        }
      } catch (error) {
        console.error('Error loading standard hours:', error);
        // Keep default values if API fails
      }

      // Load Meeting Types from API
      try {
        const response = await fetch('/api/settings?type=meeting-types');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setMeetingTypes(data.data.types);
          }
        }
      } catch (error) {
        console.error('Error loading meeting types:', error);
        // Keep default values if API fails
      }
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
      
      // Save Standard Hours to API
      try {
        const response = await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'standard-hours',
            settings: standardHours
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to save standard hours');
        }
      } catch (error) {
        console.error('Error saving standard hours:', error);
        setTestResult({ success: false, message: 'Failed to save standard hours' });
        return;
      }

      // Save Meeting Types to API
      try {
        const response = await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'meeting-types',
            settings: { types: meetingTypes }
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to save meeting types');
        }
      } catch (error) {
        console.error('Error saving meeting types:', error);
        setTestResult({ success: false, message: 'Failed to save meeting types' });
        return;
      }
      
      setTestResult({ success: true, message: 'Settings saved successfully!' });
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to save settings' });
    } finally {
      setLoading(false);
    }
  };

  const addMeetingType = () => {
    if (newMeetingType.trim() && !meetingTypes.find(mt => mt.name.toLowerCase() === newMeetingType.trim().toLowerCase())) {
      const newType: MeetingType = {
        id: newMeetingType.trim().toLowerCase().replace(/\s+/g, '-'),
        name: newMeetingType.trim(),
        enabled: true
      };
      setMeetingTypes([...meetingTypes, newType]);
      setNewMeetingType('');
    }
  };

  const toggleMeetingType = (id: string) => {
    setMeetingTypes(meetingTypes.map(mt => 
      mt.id === id ? { ...mt, enabled: !mt.enabled } : mt
    ));
  };

  const deleteMeetingType = (id: string) => {
    setMeetingTypes(meetingTypes.filter(mt => mt.id !== id));
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-6 h-6" />
            إعدادات النظام
          </DialogTitle>
          <DialogDescription>
            قم بإعداد اتصال Jira و Jenkins
          </DialogDescription>
        </DialogHeader>
        
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
            
            {/* Info Message */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">بيانات الاعتماد مُدارة عبر تسجيل الدخول</p>
                  <p>يتم حفظ بيانات Jira الخاصة بك بشكل آمن عند تسجيل الدخول وتبقى نشطة لمدة 24 ساعة.</p>
                  {credentials && (
                    <p className="mt-2">
                      <strong>المستخدم الحالي:</strong> {credentials.username}<br/>
                      <strong>رابط Jira:</strong> {credentials.baseUrl}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Read-only display of current settings */}
            {credentials && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المستخدم
                  </label>
                  <Input
                    type="text"
                    value={credentials.username}
                    disabled
                    className="w-full text-black bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رابط Jira Base URL
                  </label>
                  <Input
                    type="url"
                    value={credentials.baseUrl}
                    disabled
                    className="w-full text-black bg-gray-50"
                  />
                </div>
              </div>
            )}

            {/* Test Connection Button */}
            <Button
              variant="outline"
              onClick={testJiraConnectivity}
              disabled={testing === 'jira' || !credentials}
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              {testing === 'jira' ? 'جاري الفحص...' : 'فحص الاتصال'}
            </Button>
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
                  className="w-full text-black"
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
                  className="w-full text-black"
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

          {/* Standard Hours Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">الساعات القياسية الأسبوعية</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الإثنين
                </label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={standardHours.monday}
                  onChange={(e) => setStandardHours(prev => ({ ...prev, monday: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الثلاثاء
                </label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={standardHours.tuesday}
                  onChange={(e) => setStandardHours(prev => ({ ...prev, tuesday: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الأربعاء
                </label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={standardHours.wednesday}
                  onChange={(e) => setStandardHours(prev => ({ ...prev, wednesday: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الخميس
                </label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={standardHours.thursday}
                  onChange={(e) => setStandardHours(prev => ({ ...prev, thursday: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الجمعة
                </label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={standardHours.friday}
                  onChange={(e) => setStandardHours(prev => ({ ...prev, friday: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السبت
                </label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={standardHours.saturday}
                  onChange={(e) => setStandardHours(prev => ({ ...prev, saturday: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الأحد
                </label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={standardHours.sunday}
                  onChange={(e) => setStandardHours(prev => ({ ...prev, sunday: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-black"
                />
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  الإجمالي: {Object.values(standardHours).reduce((sum, hours) => sum + hours, 0)} ساعة
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Types Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">أنواع الاجتماعات</h3>
            
            <div className="space-y-3">
              {meetingTypes.map((meetingType) => (
                <div key={meetingType.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={meetingType.enabled}
                      onChange={() => toggleMeetingType(meetingType.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`font-medium ${meetingType.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                      {meetingType.name}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMeetingType(meetingType.id)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              {meetingTypes.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  لا توجد أنواع اجتماعات مضافة
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="نوع اجتماع جديد..."
                value={newMeetingType}
                onChange={(e) => setNewMeetingType(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMeetingType()}
                className="flex-1 text-black"
              />
              <Button
                onClick={addMeetingType}
                disabled={!newMeetingType.trim()}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة
              </Button>
            </div>
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
      </DialogContent>
    </Dialog>
  );
}
