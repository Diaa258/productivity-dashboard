import { NextRequest, NextResponse } from 'next/server';
import { JiraService } from '@/services/jiraService';
import { config } from '@/config/env';

export async function GET(request: NextRequest) {
  try {
    console.log('=== AUTOMATION TEST CASES API ===');
    
    // Use hardcoded credentials that work with the tickets API
    const baseUrl = 'https://jira.emaratech.ae';
    const username = 'v-diaaeldin.saved';
    const password = 'Yousef@01141739623';
    
    console.log('Using hardcoded credentials for automation test cases');
    
    // Create JiraService with working credentials
    const jiraServiceWithCreds = new JiraService({
      username,
      password,
      baseUrl
    });
    
    const automationTestCases = await jiraServiceWithCreds.getAutomationTestCases();
    
    console.log(`Returning ${automationTestCases.length} automation test cases`);
    
    return NextResponse.json({
      success: true,
      data: automationTestCases,
      count: automationTestCases.length,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching automation test cases:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch automation test cases',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
