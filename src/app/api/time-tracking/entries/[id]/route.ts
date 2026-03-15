import { NextRequest, NextResponse } from 'next/server';
import { timeTrackingService } from '@/services/timeTrackingService';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const entry = await timeTrackingService.updateTimeEntry(params.id, body);
    
    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Time entry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error('Error updating time entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update time entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await timeTrackingService.deleteTimeEntry(params.id);
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete time entry' },
      { status: 500 }
    );
  }
}
