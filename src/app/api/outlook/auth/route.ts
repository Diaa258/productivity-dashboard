import { NextRequest, NextResponse } from 'next/server';

// Microsoft Graph API configuration
const CLIENT_ID = process.env.OUTLOOK_CLIENT_ID;
const CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET;
const TENANT_ID = process.env.OUTLOOK_TENANT_ID;
const REDIRECT_URI = process.env.OUTLOOK_REDIRECT_URI || 'http://localhost:3000/api/outlook/callback';

const GRAPH_API_ENDPOINT = 'https://graph.microsoft.com/v1.0';

export async function POST() {
  try {
    if (!CLIENT_ID || !TENANT_ID) {
      return NextResponse.json(
        { error: 'Missing Outlook configuration' },
        { status: 500 }
      );
    }

    // Generate authorization URL
    const authUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?` +
      `client_id=${CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_mode=query&` +
      `scope=https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/User.Read&` +
      `state=${Math.random().toString(36).substring(7)}`;

    return NextResponse.json({
      success: true,
      authUrl
    });

  } catch (error) {
    console.error('Outlook auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}
