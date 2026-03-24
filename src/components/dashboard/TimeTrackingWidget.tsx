'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Play, Pause, Square, Plus, Timer } from 'lucide-react';
import { TimeEntry, TimeCategory, MeetingType } from '@/types';
import { formatDuration, formatTime } from '@/utils/dateUtils';

export default function TimeTrackingWidget() {
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<TimeCategory>('scripting');
  const [description, setDescription] = useState('');
  const [selectedMeetingType, setSelectedMeetingType] = useState('');
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([
    { id: 'stand-up', name: 'Stand Up', enabled: true },
    { id: 'internal-stand-up', name: 'Internal Stand Up', enabled: true },
    { id: 'grooming', name: 'Grooming', enabled: true },
    { id: 'planning', name: 'Planning', enabled: true },
    { id: 'other', name: 'Other', enabled: true },
  ]);
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeTimer && activeTimer.startTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - activeTimer.startTime.getTime()) / (1000 * 60));
        setElapsedTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeTimer]);

  useEffect(() => {
    fetchActiveTimer();
    fetchTodayEntries();
    loadMeetingTypes();
  }, []);

  const loadMeetingTypes = async () => {
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
    }
  };

  const fetchActiveTimer = async () => {
    try {
      const response = await fetch('/api/time-tracking/timer');
      const data = await response.json();
      if (data.success && data.data) {
        setActiveTimer({
          ...data.data,
          startTime: new Date(data.data.startTime),
          date: new Date(data.data.date),
        });
      }
    } catch (error) {
      console.error('Error fetching active timer:', error);
    }
  };

  const fetchTodayEntries = async () => {
    try {
      const response = await fetch('/api/time-tracking/entries');
      const data = await response.json();
      if (data.success) {
        const today = new Date().toDateString();
        const todayData = data.data.filter((entry: TimeEntry) => 
          new Date(entry.date).toDateString() === today
        );
        setTodayEntries(todayData.map((entry: any) => ({
          ...entry,
          startTime: new Date(entry.startTime),
          endTime: entry.endTime ? new Date(entry.endTime) : undefined,
          date: new Date(entry.date),
        })));
      }
    } catch (error) {
      console.error('Error fetching today entries:', error);
    }
  };

  const startTimer = async () => {
    let finalDescription = description.trim();
    
    if (selectedCategory === 'meetings') {
      if (!selectedMeetingType) {
        alert('Please select a meeting type');
        return;
      }
      finalDescription = selectedMeetingType;
    } else if (selectedCategory === 'break') {
      // Auto-start break without requiring input
      finalDescription = 'Break';
    } else {
      if (!finalDescription) {
        alert('Please enter a description');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch('/api/time-tracking/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory,
          description: finalDescription,
          startTime: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setActiveTimer({
          ...data.data,
          startTime: new Date(data.data.startTime),
          date: new Date(data.data.date),
        });
        setDescription('');
        setSelectedMeetingType('');
        fetchTodayEntries();
      }
    } catch (error) {
      console.error('Error starting timer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: TimeCategory) => {
    setSelectedCategory(category);
    setSelectedMeetingType('');
    setDescription('');
  };

  const stopTimer = async () => {
    if (!activeTimer) return;

    setLoading(true);
    try {
      const response = await fetch('/api/time-tracking/timer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stop',
          id: activeTimer.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setActiveTimer(null);
        setElapsedTime(0);
        fetchTodayEntries();
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories: TimeCategory[] = ['meetings', 'calls', 'scripting', 'refactoring', 'break', 'investigate', 'reporting'];

  const getCategoryColor = (category: TimeCategory) => {
    const colors = {
      meetings: 'bg-blue-100 text-blue-800',
      calls: 'bg-green-100 text-green-800',
      scripting: 'bg-purple-100 text-purple-800',
      refactoring: 'bg-yellow-100 text-yellow-800',
      break: 'bg-gray-100 text-gray-800',
      investigate: 'bg-orange-100 text-orange-800',
      reporting: 'bg-pink-100 text-pink-800',
    };
    return colors[category];
  };

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <Timer className="w-5 h-5" />
          Time Tracking
        </CardTitle>
        <CardDescription className="text-green-600">
          Track your work hours and activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Active Timer */}
          <div className="bg-gray-50 p-4 rounded-lg">
            {activeTimer ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatDuration(elapsedTime)}
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={stopTimer}
                    disabled={loading}
                    className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
                  >
                    <Square className="w-4 h-4" />
                    Stop
                  </Button>
                </div>
                <div className="space-y-1">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(activeTimer.category)}`}>
                    {activeTimer.category}
                  </span>
                  <p className="text-sm font-medium text-gray-900">{activeTimer.description}</p>
                  <p className="text-xs text-red-500">
                    Started at {formatTime(activeTimer.startTime)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center py-4">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-red-500">No active timer</p>
                </div>
                
                {/* New Timer Form */}
                <div className="space-y-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value as TimeCategory)}
                    className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                  {selectedCategory === 'meetings' ? (
                    <select
                      value={selectedMeetingType}
                      onChange={(e) => setSelectedMeetingType(e.target.value)}
                      className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                    >
                      <option value="">Select meeting type...</option>
                      {meetingTypes.filter(mt => mt.enabled).map(meetingType => (
                        <option key={meetingType.id} value={meetingType.name}>
                          {meetingType.name}
                        </option>
                      ))}
                    </select>
                  ) : selectedCategory === 'break' ? (
                    <div className="w-full px-3 py-2 border border-black rounded-md bg-gray-100 text-gray-600">
                      Break timer - no description needed
                    </div>
                  ) : (
                    <Input
                      placeholder="What are you working on?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && startTimer()}
                    />
                  )}
                  <Button
                    onClick={startTimer}
                    disabled={loading || (
                      selectedCategory === 'meetings' ? !selectedMeetingType.trim() : 
                      selectedCategory === 'break' ? false : 
                      !description.trim()
                    )}
                    className="w-full flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
                  >
                    <Play className="w-4 h-4" />
                    Start Timer
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Today's Entries */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Today's Entries</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {todayEntries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(entry.category)}`}>
                        {entry.category}
                      </span>
                      <span className="text-xs text-red-500">
                        {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : 'Active'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 truncate">{entry.description}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-900 ml-2">
                    {formatDuration(entry.duration || 0)}
                  </div>
                </div>
              ))}
              
              {todayEntries.length === 0 && (
                <div className="text-center py-4 text-red-500 text-sm">
                  No entries for today
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
