import { NextRequest, NextResponse } from 'next/server';
import { JiraService } from '@/services/jiraService';

export async function GET(request: NextRequest) {
  try {
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
    
    const latestTask = await jiraService.getLatestTask();
    
    if (!latestTask) {
      return NextResponse.json(
        { success: false, error: 'No tasks found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: latestTask });
  } catch (error) {
    console.error('Error in latest task API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to fetch latest task: ${errorMessage}` },
      { status: 500 }
    );
  }
}
