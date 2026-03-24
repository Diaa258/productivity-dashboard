import { NextRequest, NextResponse } from 'next/server';

const GRAPH_API_ENDPOINT = 'https://graph.microsoft.com/v1.0';

async function getAccessToken(request: NextRequest): Promise<string | null> {
  const accessToken = request.cookies.get('outlook_access_token')?.value;
  
  if (!accessToken) {
    return null;
  }

  // Check if token needs refresh (simple check - in production, you'd check expiry)
  try {
    // Test the token with a simple API call
    const testResponse = await fetch(`${GRAPH_API_ENDPOINT}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (testResponse.ok) {
      return accessToken;
    }

    // Token is invalid, try to refresh
    const refreshToken = request.cookies.get('outlook_refresh_token')?.value;
    if (!refreshToken) {
      return null;
    }

    const CLIENT_ID = process.env.OUTLOOK_CLIENT_ID;
    const CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET;
    const TENANT_ID = process.env.OUTLOOK_TENANT_ID;

    if (!CLIENT_ID || !CLIENT_SECRET || !TENANT_ID) {
      return null;
    }

    const refreshResponse = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!refreshResponse.ok) {
      return null;
    }

    const refreshData = await refreshResponse.json();
    return refreshData.access_token;

  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if we have demo mode enabled
    const demoMode = process.env.OUTLOOK_DEMO_MODE === 'true';
    
    if (demoMode) {
      // Return demo emails for testing
      const demoEmails = [
        {
          id: 'demo-1',
          subject: 'Welcome to Productivity Dashboard',
          from: {
            emailAddress: {
              name: 'System Administrator',
              address: 'admin@flairstech.com'
            }
          },
          receivedDateTime: new Date().toISOString(),
          body: {
            contentType: 'text',
            content: 'This is a demo email to test the Outlook integration. Contact your IT administrator to set up proper Azure AD permissions.'
          },
          isRead: false,
          hasAttachments: false
        },
        {
          id: 'demo-2',
          subject: 'Daily Standup Meeting',
          from: {
            emailAddress: {
              name: 'Team Lead',
              address: 'teamlead@flairstech.com'
            }
          },
          receivedDateTime: new Date(Date.now() - 3600000).toISOString(),
          body: {
            contentType: 'text',
            content: 'Reminder: Daily standup at 10 AM today. Please prepare your updates.'
          },
          isRead: true,
          hasAttachments: false
        },
        {
          id: 'demo-3',
          subject: 'Code Review Request',
          from: {
            emailAddress: {
              name: 'Developer Team',
              address: 'dev@flairstech.com'
            }
          },
          receivedDateTime: new Date(Date.now() - 7200000).toISOString(),
          body: {
            contentType: 'text',
            content: 'Please review the latest pull request for the productivity dashboard.'
          },
          isRead: false,
          hasAttachments: true
        }
      ];

      return NextResponse.json({
        success: true,
        data: demoEmails
      });
    }

    const accessToken = await getAccessToken(request);

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'azure_admin_required',
        message: 'Please contact your IT administrator to set up Azure AD app registration'
      }, { status: 403 });
    }

    // Fetch emails from Microsoft Graph API
    const emailResponse = await fetch(
      `${GRAPH_API_ENDPOINT}/me/messages?$top=20&$orderby=receivedDateTime desc&$select=id,subject,from,receivedDateTime,body,isRead,hasAttachments`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!emailResponse.ok) {
      throw new Error('Failed to fetch emails');
    }

    const emailData = await emailResponse.json();

    return NextResponse.json({
      success: true,
      data: emailData.value || []
    });

  } catch (error) {
    console.error('Email fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch emails'
    }, { status: 500 });
  }
}
