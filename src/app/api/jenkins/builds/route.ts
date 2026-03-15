import { NextRequest, NextResponse } from 'next/server';
import { jenkinsService } from '@/services/jenkinsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = searchParams.get('count');
    
    const builds = await jenkinsService.getRecentBuilds(count ? parseInt(count) : 10);
    
    return NextResponse.json({ success: true, data: builds });
  } catch (error) {
    console.error('Error in Jenkins builds API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Jenkins builds' },
      { status: 500 }
    );
  }
}
