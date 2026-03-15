import { NextRequest, NextResponse } from 'next/server';
import { jiraService } from '@/services/jiraService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = await jiraService.getTicketDetails(params.id);
    
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Error in Jira ticket details API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ticket details' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { type, content } = body;
    
    if (type === 'comment') {
      const success = await jiraService.addComment(params.id, content);
      return NextResponse.json({ success });
    } else if (type === 'worklog') {
      const { timeSpent, comment } = content;
      const success = await jiraService.logWork(params.id, timeSpent, comment);
      return NextResponse.json({ success });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in Jira ticket action API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
