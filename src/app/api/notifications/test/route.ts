import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/services/notificationService';

export async function POST() {
  try {
    // Create a test notification
    const notification = await notificationService.createNotification({
      type: 'current_task',
      title: '🔔 New Test Notification',
      message: 'This is a fresh notification created at ' + new Date().toLocaleTimeString(),
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test notification created successfully!',
      notification 
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    return NextResponse.json(
      { error: 'Failed to create test notification' },
      { status: 500 }
    );
  }
}
