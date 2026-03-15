import { NextRequest, NextResponse } from 'next/server';
import { timeTrackingService } from '@/services/timeTrackingService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let entries;
    if (startDate && endDate) {
      entries = await timeTrackingService.getTimeEntries({
        start: new Date(startDate),
        end: new Date(endDate),
      });
    } else {
      entries = await timeTrackingService.getTimeEntries();
    }
    
    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error('Error in time entries API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entry = await timeTrackingService.createTimeEntry(body);
    
    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create time entry' },
      { status: 500 }
    );
  }
}
