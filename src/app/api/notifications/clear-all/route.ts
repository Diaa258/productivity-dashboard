import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/config/database';

export async function POST() {
  try {
    console.log('Clear all notifications endpoint called');
    
    // Delete all notifications
    const result = await prisma.notification.deleteMany({});
    
    console.log(`Deleted ${result.count} notifications`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${result.count} notifications`,
      deleted: result.count
    });
  } catch (error: any) {
    console.error('Error clearing all notifications:', error);
    return NextResponse.json(
      { error: 'Failed to clear notifications', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
