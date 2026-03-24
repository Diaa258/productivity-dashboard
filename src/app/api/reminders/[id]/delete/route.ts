import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/config/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('Simple delete reminder called with ID:', id);
    
    // First check if reminder exists
    const reminder = await prisma.reminder.findUnique({
      where: { id: id },
    });
    
    if (!reminder) {
      console.log('Reminder not found:', id);
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }
    
    console.log('Found reminder, deleting...');
    const result = await prisma.reminder.delete({
      where: { id: id },
    });
    
    console.log('Reminder deleted successfully:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Reminder deleted successfully!',
      deleted: result
    });
  } catch (error: any) {
    console.error('Simple delete reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
