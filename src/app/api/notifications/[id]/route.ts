import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/services/notificationService';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await notificationService.deleteNotification(id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Notification deleted successfully!' 
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
