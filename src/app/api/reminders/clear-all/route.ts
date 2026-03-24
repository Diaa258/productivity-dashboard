import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/config/database';

export async function POST() {
  try {
    console.log('Clear all reminders endpoint called');
    
    // Delete all reminders
    const result = await prisma.reminder.deleteMany({});
    
    console.log(`Deleted ${result.count} reminders`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${result.count} reminders`,
      deleted: result.count
    });
  } catch (error: any) {
    console.error('Error clearing all reminders:', error);
    return NextResponse.json(
      { error: 'Failed to clear reminders', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
