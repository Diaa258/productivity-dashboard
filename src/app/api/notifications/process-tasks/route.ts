import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/services/notificationService';

export async function POST() {
  try {
    // Process all scheduled tasks
    await notificationService.processScheduledTasks();
    
    return NextResponse.json({ success: true, message: 'Scheduled tasks processed' });
  } catch (error) {
    console.error('Error processing scheduled tasks:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled tasks' },
      { status: 500 }
    );
  }
}
