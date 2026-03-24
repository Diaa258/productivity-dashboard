import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/config/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('Simple single delete reminder called with ID:', id);
    
    // Delete the specific reminder
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
    console.error('Simple single delete reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
