import { NextRequest, NextResponse } from 'next/server';
import { timeTrackingService } from '@/services/timeTrackingService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('date') ? new Date(searchParams.get('date')!) : undefined;
    
    const report = await timeTrackingService.getWeeklyReport(weekStart);
    
    // Get detailed entries for the week
    const entries = await timeTrackingService.getTimeEntries({
      start: weekStart || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date((weekStart?.getTime() || Date.now() - 7 * 24 * 60 * 60 * 1000) + 7 * 24 * 60 * 60 * 1000),
    });

    // Group entries by date
    const entriesByDate = entries.reduce((acc, entry) => {
      const dateKey = entry.date.toLocaleDateString('en-US');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(entry);
      return acc;
    }, {} as Record<string, typeof entries>);

    // Generate CSV content grouped by date
    const csvHeaders = ['Date', 'Day', 'Category', 'Description', 'Start Time', 'End Time', 'Duration (Hours)', 'Notes'];
    
    let csvRows: string[] = [];
    
    // Add entries grouped by date
    Object.entries(entriesByDate).forEach(([date, dayEntries]) => {
      const dayName = dayEntries[0].date.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Add date header separator
      csvRows.push('');
      csvRows.push(`=== ${dayName} - ${date} ===`);
      csvRows.push(csvHeaders.join(','));
      
      // Add entries for this date
      dayEntries.forEach(entry => {
        const startTime = entry.startTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        const endTime = entry.endTime?.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) || 'Ongoing';
        const durationHours = entry.duration ? (entry.duration / 60).toFixed(2) : '0.00';
        
        csvRows.push([
          `"${date}"`,
          `"${dayName}"`,
          `"${entry.category}"`,
          `"${entry.description}"`,
          `"${startTime}"`,
          `"${endTime}"`,
          `"${durationHours}"`,
          `"${entry.notes || ''}"`
        ].join(','));
      });
      
      // Add daily total
      const dailyTotal = dayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
      csvRows.push(`"Daily Total:","","","","","${(dailyTotal / 60).toFixed(2)}","",""`);
    });

    // Add summary section at the end
    const summarySection = [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '=== WEEKLY SUMMARY ===',
      `"Total Hours: ${report.totalHours.toFixed(2)}"`,
      `"Daily Average: ${(report.totalHours / 5).toFixed(2)}"`,
      '',
      'Category Breakdown:',
      ...Object.entries(report.categoryBreakdown)
        .filter(([_, minutes]) => minutes > 0)
        .map(([category, minutes]) => 
          `"${category}: ${(minutes / 60).toFixed(2)}h"`
        ),
      '',
      'Daily Hours:',
      ...Object.entries(report.dailyHours).map(([date, hours]) => {
        const dateObj = new Date(date);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        return `"${dayName}: ${hours.toFixed(1)}h"`;
      })
    ];

    const csvContent = [
      ...csvRows,
      ...summarySection
    ].join('\n');

    // Create filename with date range
    const startDate = (weekStart || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .toLocaleDateString('en-US')
      .replace(/\//g, '-');
    const endDate = new Date((weekStart?.getTime() || Date.now() - 7 * 24 * 60 * 60 * 1000) + 6 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-US')
      .replace(/\//g, '-');
    
    const filename = `weekly-analytics-${startDate}-to-${endDate}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating CSV export:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate CSV export' },
      { status: 500 }
    );
  }
}
