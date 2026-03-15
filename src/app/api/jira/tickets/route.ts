import { NextRequest, NextResponse } from 'next/server';
import { JiraService } from '@/services/jiraService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jql = searchParams.get('jql');
    
    console.log('=== JIRA API CALL ===');
    console.log('Received JQL:', jql);
    
    // Get credentials from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    
    // Extract username and password from Basic auth
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    // Create JiraService with credentials from request
    const jiraService = new JiraService({
      username,
      password,
      baseUrl: 'https://jira.emaratech.ae'
    });
    
    const tickets = await jiraService.getAssignedTickets(jql || undefined);
    
    console.log('=== API ROUTE DEBUG ===');
    console.log('Tickets returned:', tickets.length);
    if (tickets.length > 0) {
      console.log('First ticket in API:', {
        id: tickets[0].id,
        created: tickets[0].created,
        lastUpdated: tickets[0].lastUpdated,
        summary: tickets[0].summary
      });
      console.log('Last ticket in API:', {
        id: tickets[tickets.length - 1].id,
        created: tickets[tickets.length - 1].created,
        lastUpdated: tickets[tickets.length - 1].lastUpdated,
        summary: tickets[tickets.length - 1].summary
      });
      
      // Check if dates are different
      const firstDate = new Date(tickets[0].created || tickets[0].lastUpdated);
      const lastDate = new Date(tickets[tickets.length - 1].created || tickets[tickets.length - 1].lastUpdated);
      console.log('Date range:', {
        first: firstDate.toISOString(),
        last: lastDate.toISOString(),
        diffDays: (firstDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      });
    }
    
    return NextResponse.json(
      { success: true, data: tickets },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Error in Jira tickets API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to fetch Jira tickets: ${errorMessage}` },
      { status: 500 }
    );
  }
}
