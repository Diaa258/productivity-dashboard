'use client';

import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit2, Trash2, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

interface WeeklyGoal {
  id: string;
  title: string;
  description?: string;
  targetValue?: number;
  currentValue: number;
  unit?: string;
  weekStart: string;
  weekEnd: string;
  isCompleted: boolean;
  createdAt: string;
}

export default function WeeklyGoalsManager() {
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<WeeklyGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetValue: '',
    unit: 'hours',
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/weekly-goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Error fetching weekly goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate current week dates
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    try {
      const response = await fetch('/api/weekly-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          targetValue: formData.targetValue ? parseFloat(formData.targetValue) : undefined,
          weekStart,
          weekEnd,
        }),
      });

      if (response.ok) {
        setFormData({
          title: '',
          description: '',
          targetValue: '',
          unit: 'hours',
        });
        setShowAddForm(false);
        setEditingGoal(null);
        fetchGoals();
      }
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const updateProgress = async (goalId: string, currentValue: number) => {
    try {
      const response = await fetch(`/api/weekly-goals/${goalId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentValue }),
      });

      if (response.ok) {
        setGoals(prev =>
          prev.map(g => g.id === goalId ? { ...g, currentValue } : g)
        );
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      console.log('Attempting to delete goal:', goalId);
      const response = await fetch(`/api/weekly-goals/${goalId}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Delete result:', result);
        setGoals(prev => prev.filter(g => g.id !== goalId));
        alert('Goal deleted successfully!');
      } else {
        const error = await response.json();
        console.error('Delete failed:', error);
        alert(`Failed to delete goal: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Error deleting goal. Please try again.');
    }
  };

  const startEdit = (goal: WeeklyGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      targetValue: goal.targetValue?.toString() || '',
      unit: goal.unit || 'hours',
    });
    setShowAddForm(true);
  };

  const getProgressPercentage = (goal: WeeklyGoal) => {
    if (!goal.targetValue) return 0;
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading weekly goals...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Weekly Goals</h2>
          <p className="text-sm text-gray-600 mt-1">
            {formatDate(goals.length > 0 ? goals[0].weekStart : new Date())} - {formatDate(goals.length > 0 ? goals[0].weekEnd : new Date())}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Set Goal</span>
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingGoal ? 'Edit Goal' : 'Set New Weekly Goal'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Complete 5 tasks, Study 20 hours"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description of your goal"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Value
                </label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  placeholder="e.g., 20"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="hours">Hours</option>
                  <option value="tasks">Tasks</option>
                  <option value="points">Points</option>
                  <option value="projects">Projects</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingGoal ? 'Update' : 'Set'} Goal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingGoal(null);
                  setFormData({
                    title: '',
                    description: '',
                    targetValue: '',
                    unit: 'hours',
                  });
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
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No weekly goals set yet.</p>
            <p className="text-sm">Set your first goal to track your progress!</p>
          </div>
        ) : (
          goals.map((goal) => {
            const percentage = getProgressPercentage(goal);
            return (
              <div
                key={goal.id}
                className={`p-4 border rounded-lg ${
                  goal.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{goal.title}</h4>
                      {goal.isCompleted && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(goal)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {goal.targetValue && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{percentage}% complete</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateProgress(goal.id, Math.max(0, goal.currentValue - 1))}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          -1
                        </button>
                        <input
                          type="number"
                          value={goal.currentValue}
                          onChange={(e) => updateProgress(goal.id, parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-center border border-gray-300 rounded"
                          step="0.1"
                        />
                        <button
                          onClick={() => updateProgress(goal.id, goal.currentValue + 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          +1
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {goals.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Weekly Summary</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{goals.length}</p>
              <p className="text-sm text-blue-700">Total Goals</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {goals.filter(g => g.isCompleted).length}
              </p>
              <p className="text-sm text-green-700">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {goals.filter(g => !g.isCompleted).length}
              </p>
              <p className="text-sm text-orange-700">In Progress</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
