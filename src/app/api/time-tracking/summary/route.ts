import { NextRequest, NextResponse } from 'next/server';
import { timeTrackingService } from '@/services/timeTrackingService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const date = searchParams.get('date');
    
    if (type === 'daily') {
      const summary = await timeTrackingService.getDailySummary(
        date ? new Date(date) : new Date()
      );
      return NextResponse.json({ success: true, data: summary });
    } else if (type === 'weekly') {
      const weekStart = date ? new Date(date) : undefined;
      const report = await timeTrackingService.getWeeklyReport(weekStart);
      return NextResponse.json({ success: true, data: report });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid type. Use "daily" or "weekly"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in time summary API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch time summary' },
      { status: 500 }
    );
  }
}
