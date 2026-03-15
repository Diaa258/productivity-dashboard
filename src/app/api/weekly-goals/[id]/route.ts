import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/services/notificationService';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    const goal = await notificationService.updateWeeklyGoal(id, data);
    
    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error updating weekly goal:', error);
    return NextResponse.json(
      { error: 'Failed to update weekly goal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await notificationService.deleteWeeklyGoal(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting weekly goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete weekly goal' },
      { status: 500 }
    );
  }
}
