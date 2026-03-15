import { NextRequest, NextResponse } from 'next/server';
import { jenkinsService } from '@/services/jenkinsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buildNumber = searchParams.get('buildNumber');
    
    if (!buildNumber) {
      return NextResponse.json(
        { success: false, error: 'Build number is required' },
        { status: 400 }
      );
    }
    
    const report = await jenkinsService.getAutomationReport(parseInt(buildNumber));
    
    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('Error in Jenkins report API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Jenkins report' },
      { status: 500 }
    );
  }
}
