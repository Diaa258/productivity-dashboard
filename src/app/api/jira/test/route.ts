import { NextRequest, NextResponse } from 'next/server';

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
    
    // Test different Jira endpoints
    const baseUrl = 'https://jira.emaratech.ae';
    const testEndpoints = [
      '/rest/api/2/myself',
      '/rest/api/3/myself',
      '/rest/api/2/serverInfo',
      '/rest/api/3/serverInfo'
    ];
    
    const results = [];
    
    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Basic ${base64Credentials}`,
            'Accept': 'application/json',
          },
        });
        
        results.push({
          endpoint,
          status: response.status,
          success: response.ok,
          data: response.ok ? await response.json() : null
        });
        
        if (response.ok) {
          break; // Found a working endpoint
        }
      } catch (error) {
        results.push({
          endpoint,
          status: 'ERROR',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Jira connectivity test completed',
      results 
    });
    
  } catch (error) {
    console.error('Error in Jira test API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to test Jira: ${errorMessage}` },
      { status: 500 }
    );
  }
}
