import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/services/notificationService';

export async function POST() {
  try {
    await notificationService.checkCurrentTasks();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Current task check completed successfully!' 
    });
  } catch (error) {
    console.error('Error checking current tasks:', error);
    return NextResponse.json(
      { error: 'Failed to check current tasks' },
      { status: 500 }
    );
  }
}
