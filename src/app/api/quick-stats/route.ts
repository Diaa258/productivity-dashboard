import { NextRequest, NextResponse } from 'next/server';
import { timeTrackingService } from '@/services/timeTrackingService';
import { jiraService } from '@/services/jiraService';
import { jenkinsService } from '@/services/jenkinsService';
import { JiraService } from '@/services/jiraService';
import { config } from '@/config/env';
import { settingsRepository } from '@/repositories/settingsRepository';

export async function GET(request: NextRequest) {
  try {
    // Get today's focus from time entries
    const todayEntries = await timeTrackingService.getTodayTimeEntries();
    const categoryCounts: Record<string, number> = {};
    let totalMinutes = 0;

    todayEntries.forEach(entry => {
      if (entry.duration) {
        categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + entry.duration;
        totalMinutes += entry.duration;
      }
    });

    // Find the category with most time spent today
    const todayFocus = Object.keys(categoryCounts).length > 0 
      ? Object.keys(categoryCounts).reduce((a, b) => 
          categoryCounts[a] > categoryCounts[b] ? a : b
        )
      : 'development'; // Default fallback

    // Calculate week progress based on working hours
    const weeklyReport = await timeTrackingService.getWeeklyReport();
    const currentWeek = new Date();
    const weekStart = new Date(currentWeek);
    weekStart.setDate(currentWeek.getDate() - currentWeek.getDay()); // Start of week
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of week
    weekEnd.setHours(23, 59, 59, 999);
    
    // Calculate required working hours for this week using configurable standard hours
    let requiredWeeklyHours = 0;
    
    try {
      // Get standard hours from database
      const allSettings = await settingsRepository.getAllSettings();
      const defaultHours = {
        monday: 8,
        tuesday: 8,
        wednesday: 8,
        thursday: 8,
        friday: 4,
        saturday: 0,
        sunday: 0,
      };
      
      // Create array of standard hours for each day of week (Sunday = 0, Monday = 1, etc.)
      const weekDayHours = [
        parseFloat(allSettings['standard_hours_sunday'] || defaultHours.sunday.toString()),
        parseFloat(allSettings['standard_hours_monday'] || defaultHours.monday.toString()),
        parseFloat(allSettings['standard_hours_tuesday'] || defaultHours.tuesday.toString()),
        parseFloat(allSettings['standard_hours_wednesday'] || defaultHours.wednesday.toString()),
        parseFloat(allSettings['standard_hours_thursday'] || defaultHours.thursday.toString()),
        parseFloat(allSettings['standard_hours_friday'] || defaultHours.friday.toString()),
        parseFloat(allSettings['standard_hours_saturday'] || defaultHours.saturday.toString()),
      ];
      
      // Calculate required hours for each day of the current week
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        requiredWeeklyHours += weekDayHours[dayOfWeek];
      }
    } catch (error) {
      console.error('Error loading standard hours, using defaults:', error);
      // Fallback to hardcoded values if database fails
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday - Thursday
          requiredWeeklyHours += 8;
        } else if (dayOfWeek === 5) { // Friday
          requiredWeeklyHours += 4;
        }
        // Saturday and Sunday = 0 hours
      }
    }
    
    const weekProgress = requiredWeeklyHours > 0 
      ? Math.min(100, Math.round((weeklyReport.totalHours / requiredWeeklyHours) * 100))
      : 0;

    // Get active tasks count from Jira (exclude completed tasks)
    let activeTasks = 0;
    try {
      console.log('=== CONFIG DEBUG ===');
      console.log('JIRA_EMAIL:', config.jira.email ? 'SET' : 'NOT SET');
      console.log('JIRA_TOKEN:', config.jira.token ? 'SET' : 'NOT SET');
      console.log('JIRA_BASE_URL:', config.jira.baseUrl);
      
      // Use hardcoded credentials that work with the tickets API
      const baseUrl = 'https://jira.emaratech.ae';
      const username = 'v-diaaeldin.saved';
      const password = 'Yousef@01141739623';
      
      console.log('Using hardcoded credentials that work with tickets API');
      
      // Create JiraService with working credentials
      const jiraServiceWithCreds = new JiraService({
        username,
        password,
        baseUrl
      });
      
      const jiraTickets = await jiraServiceWithCreds.getAssignedTickets();
      const completedStatuses = ['Done', 'Closed', 'Resolved', 'Complete', 'Finished'];
      activeTasks = jiraTickets.filter((ticket: any) => 
        ticket.status && !completedStatuses.some(status => 
          ticket.status.toLowerCase().includes(status.toLowerCase())
        )
      ).length;
      
      console.log('=== QUICK STATS JIRA DEBUG ===');
      console.log('Total tickets:', jiraTickets.length);
      console.log('Active tasks:', activeTasks);
      console.log('Ticket statuses:', jiraTickets.map((t: any) => t.status));
    } catch (error) {
      console.error('Error fetching Jira tasks:', error);
      activeTasks = 0;
    }

    // Get test pass rate from Jenkins (latest build)
    let testPassRate = 0;
    try {
      const recentBuilds = await jenkinsService.getRecentBuilds(1);
      if (recentBuilds.length > 0) {
        const testCases = await jenkinsService.getAutomationReport(recentBuilds[0].number);
        const passedTests = testCases.filter(test => 
          test.status?.toLowerCase() === 'passed' || test.status?.toLowerCase() === 'pass'
        ).length;
        const totalTests = testCases.length;
        testPassRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
      }
    } catch (error) {
      console.error('Error fetching Jenkins tests:', error);
      testPassRate = 0;
    }

    const stats = {
      todayFocus,
      weekProgress,
      activeTasks,
      testPassRate,
      lastUpdated: new Date().toISOString(),
      metadata: {
        totalTodayMinutes: totalMinutes,
        weeklyHours: weeklyReport.totalHours,
        requiredWeeklyHours,
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quick stats' },
      { status: 500 }
    );
  }
}
