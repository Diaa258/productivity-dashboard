import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { username, password, baseUrl } = await request.json();

    // Validate input
    if (!username || !password || !baseUrl) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Test Jira connectivity with both API versions
    const apiVersions = ['/rest/api/2/myself', '/rest/api/3/myself'];
    let lastError: any = null;

    for (const apiPath of apiVersions) {
      try {
        console.log(`Testing authentication with: ${baseUrl}${apiPath}`);
        
        const response = await axios.get(
          `${baseUrl}${apiPath}`,
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
              'Accept': 'application/json',
            },
            timeout: 10000,
          }
        );

        console.log(`Authentication successful with ${apiPath}`);
        console.log(`User: ${response.data.displayName || response.data.name}`);

        // If successful, return success response
        return NextResponse.json({
          success: true,
          message: 'Authentication successful',
          user: {
            name: response.data.displayName || response.data.name,
            email: response.data.emailAddress,
            active: response.data.active,
          },
          apiVersion: apiPath,
        });

      } catch (error) {
        lastError = error;
        console.log(`Failed with ${apiPath}:`, error instanceof Error ? error.message : error);
        continue; // Try next API version
      }
    }

    // If all versions failed, return error
    const errorMessage = lastError && typeof lastError === 'object' && 'response' in lastError
      ? `${lastError.response?.status}: ${lastError.response?.data?.message || lastError.response?.data?.error || 'Authentication failed'}`
      : 'Authentication failed';

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: lastError instanceof Error ? lastError.message : 'Unknown error'
      },
      { status: 401 }
    );

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
