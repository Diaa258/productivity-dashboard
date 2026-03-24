import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.OUTLOOK_CLIENT_ID;
const CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET;
const TENANT_ID = process.env.OUTLOOK_TENANT_ID;
const REDIRECT_URI = process.env.OUTLOOK_REDIRECT_URI || 'http://localhost:3000/api/outlook/callback';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL('/?error=outlook_auth_failed', request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/?error=no_code', request.url)
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Store tokens in a secure cookie
    const response = NextResponse.redirect(
      new URL('/?outlook_auth=success', request.url)
    );

    response.cookies.set('outlook_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
    });

    response.cookies.set('outlook_refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;

  } catch (error) {
    console.error('Outlook callback error:', error);
    return NextResponse.redirect(
      new URL('/?error=outlook_callback_failed', request.url)
    );
  }
}
