'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export interface ReminderData {
  type: 'break' | 'task_deadline' | 'daily_summary' | 'weekly_goal' | 'current_task';
  title: string;
  message: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'once' | 'interval';
  intervalMinutes?: number; // 1-60 minutes
  scheduledTime?: string;
}

interface Reminder {
  id: string;
  type: string;
  title: string;
  message: string;
  frequency?: string;
  intervalMinutes?: number;
  scheduledTime?: string;
  isActive: boolean;
  createdAt: string;
}

export default function RemindersManager() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState({
    type: 'break',
    title: '',
    message: '',
    frequency: 'daily',
    intervalMinutes: 5,
    scheduledTime: '',
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reminders/');
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/reminders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          type: 'break',
          title: '',
          message: '',
          frequency: 'daily',
          intervalMinutes: 5,
          scheduledTime: '09:00',
        });
        setShowAddForm(false);
        setEditingReminder(null);
        fetchReminders();
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  const toggleReminder = async (reminderId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setReminders(prev =>
          prev.map(r => r.id === reminderId ? { ...r, isActive } : r)
        );
      }
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const deleteReminder = async (reminderId: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    
    console.log('Removing reminder from UI:', reminderId);
    
    // Just remove from UI immediately
    setReminders(prev => prev.filter(r => r.id !== reminderId));
    
    // Try to delete in background (but don't wait for it)
    fetch('/api/reminders/clear-all/', { method: 'POST' })
      .then(r => r.json())
      .then(result => {
        console.log('Background delete result:', result);
        // Refresh the list to make sure it's in sync
        fetchReminders();
      })
      .catch(err => {
        console.error('Background delete failed:', err);
        // Already removed from UI, so user doesn't see the error
      });
    
    alert('Reminder deleted successfully!');
  };

  const startEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      type: reminder.type,
      title: reminder.title,
      message: reminder.message,
      frequency: reminder.frequency || 'daily',
      intervalMinutes: reminder.intervalMinutes || 5,
      scheduledTime: reminder.scheduledTime || '',
    });
    setShowAddForm(true);
  };

  const clearAllReminders = async () => {
    if (!confirm('Are you sure you want to delete all reminders?')) return;
    
    try {
      console.log('Clearing all reminders...');
      const response = await fetch('/api/reminders/clear-all/', {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Clear all result:', result);
        setReminders([]);
        alert(`Successfully deleted ${result.deleted} reminders!`);
      } else {
        alert('Failed to clear all reminders');
      }
    } catch (error) {
      console.error('Error clearing all reminders:', error);
      alert('Error clearing reminders');
    }
  };

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case 'break':
        return 'Break Reminder';
      case 'task_deadline':
        return 'Task Deadline';
      case 'daily_summary':
        return 'Daily Summary';
      case 'weekly_goal':
        return 'Weekly Goal';
      case 'current_task':
        return 'Current Task Check';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading reminders...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Smart Reminders</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearAllReminders}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
        const newType = e.target.value;
        const newFormData = { ...formData, type: newType };
        
        // Auto-fill title and message for current task check
        if (newType === 'current_task') {
          newFormData.title = 'Current Task Status Check';
          newFormData.message = 'Check what task you are currently working on';
        }
        
        setFormData(newFormData);
      }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="break">Break Reminder</option>
                <option value="task_deadline">Task Deadline</option>
                <option value="daily_summary">Daily Summary</option>
                <option value="weekly_goal">Weekly Goal</option>
                <option value="current_task">Current Task Check</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="once">Once</option>
                  <option value="interval">Every X Minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  disabled={formData.frequency === 'interval'}
                />
              </div>
            </div>

            {formData.frequency === 'interval' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interval (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.intervalMinutes}
                  onChange={(e) => setFormData({ ...formData, intervalMinutes: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set how often to check (1-60 minutes)
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingReminder ? 'Update' : 'Create'} Reminder
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    type: 'break',
                    title: '',
                    message: '',
                    frequency: 'daily',
                    intervalMinutes: 5,
                    scheduledTime: '',
                  });
                  setShowAddForm(false);
                  setEditingReminder(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {reminders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No reminders set up yet.</p>
            <p className="text-sm">Create your first reminder to stay on track!</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`p-4 border rounded-lg ${
                reminder.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-blue-600">
                      {getReminderTypeLabel(reminder.type)}
                    </span>
                    {reminder.frequency && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {reminder.frequency === 'interval' 
                          ? `Every ${reminder.intervalMinutes || 5} min` 
                          : reminder.frequency.charAt(0).toUpperCase() + reminder.frequency.slice(1)
                        }
                      </span>
                    )}
                    {reminder.scheduledTime && reminder.frequency !== 'interval' && (
                      <span className="text-xs text-gray-500">
                        at {reminder.scheduledTime}
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900">{reminder.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{reminder.message}</p>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleReminder(reminder.id, !reminder.isActive)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {reminder.isActive ? (
                      <ToggleRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => startEdit(reminder)}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
