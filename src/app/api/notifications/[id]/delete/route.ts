import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/config/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('Simple delete endpoint called with ID:', id);
    
    // Direct database delete
    const result = await prisma.notification.delete({
      where: { id: id },
    });
    
    console.log('Delete result:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Notification deleted successfully!',
      deleted: result
    });
  } catch (error: any) {
    console.error('Simple delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
