import { NextRequest, NextResponse } from 'next/server';
import { jenkinsService } from '@/services/jenkinsService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testCases } = body;
    
    const csv = jenkinsService.exportToCSV(testCases);
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="jenkins-report.csv"',
      },
    });
  } catch (error) {
    console.error('Error in Jenkins export API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
