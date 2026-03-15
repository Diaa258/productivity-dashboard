import { NextRequest, NextResponse } from 'next/server';
import { timeTrackingService } from '@/services/timeTrackingService';

export async function GET(request: NextRequest) {
  try {
    const activeTimer = await timeTrackingService.getActiveTimer();
    
    return NextResponse.json({ success: true, data: activeTimer });
  } catch (error) {
    console.error('Error fetching active timer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch active timer' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, id } = body;
    
    if (action === 'stop' && id) {
      const entry = await timeTrackingService.stopTimer(id);
      return NextResponse.json({ success: true, data: entry });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error handling timer action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to handle timer action' },
      { status: 500 }
    );
  }
}
