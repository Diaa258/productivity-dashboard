import { NextRequest, NextResponse } from 'next/server';

const GRAPH_API_ENDPOINT = 'https://graph.microsoft.com/v1.0';

async function getAccessToken(request: NextRequest): Promise<string | null> {
  const accessToken = request.cookies.get('outlook_access_token')?.value;
  
  if (!accessToken) {
    return null;
  }

  // Check if token needs refresh
  try {
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = await getAccessToken(request);

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'authentication_required'
      }, { status: 401 });
    }

    // Mark email as read using Microsoft Graph API
    const emailResponse = await fetch(
      `${GRAPH_API_ENDPOINT}/me/messages/${params.id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isRead: true
        }),
      }
    );

    if (!emailResponse.ok) {
      throw new Error('Failed to mark email as read');
    }

    return NextResponse.json({
      success: true,
      message: 'Email marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to mark email as read'
    }, { status: 500 });
  }
}
