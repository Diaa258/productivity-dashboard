import { NextRequest, NextResponse } from 'next/server';
import { settingsRepository } from '@/repositories/settingsRepository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (type === 'jira') {
      const settings = {
        email: process.env.JIRA_EMAIL || '',
        baseUrl: process.env.JIRA_BASE_URL || '',
        // Don't return the token for security
      };
      return NextResponse.json({ success: true, data: settings });
    }
    
    if (type === 'jenkins') {
      const settings = {
        baseUrl: process.env.JENKINS_BASE_URL || '',
        jobPath: process.env.JENKINS_JOB_PATH || '',
      };
      return NextResponse.json({ success: true, data: settings });
    }
    
    if (type === 'standard-hours') {
      try {
        const defaultHours = {
          monday: 8,
          tuesday: 8,
          wednesday: 8,
          thursday: 8,
          friday: 4,
          saturday: 0,
          sunday: 0,
        };
        
        const settings = await settingsRepository.getAllSettings();
        const standardHours = { ...defaultHours };
        
        // Override with saved values if they exist
        (Object.keys(defaultHours) as Array<keyof typeof defaultHours>).forEach(day => {
          const savedValue = settings[`standard_hours_${day}`];
          if (savedValue) {
            standardHours[day] = parseFloat(savedValue);
          }
        });
        
        return NextResponse.json({ success: true, data: standardHours });
      } catch (error) {
        console.error('Error fetching standard hours:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch standard hours' }, { status: 500 });
      }
    }
    
    if (type === 'meeting-types') {
      try {
        const defaultMeetingTypes = [
          { id: 'stand-up', name: 'Stand Up', enabled: true },
          { id: 'internal-stand-up', name: 'Internal Stand Up', enabled: true },
          { id: 'grooming', name: 'Grooming', enabled: true },
          { id: 'planning', name: 'Planning', enabled: true },
          { id: 'other', name: 'Other', enabled: true },
        ];
        
        const settings = await settingsRepository.getAllSettings();
        const savedMeetingTypes = settings.meeting_types;
        
        if (savedMeetingTypes) {
          try {
            const parsed = JSON.parse(savedMeetingTypes);
            return NextResponse.json({ success: true, data: { types: parsed } });
          } catch (parseError) {
            console.error('Error parsing meeting types:', parseError);
          }
        }
        
        return NextResponse.json({ success: true, data: { types: defaultMeetingTypes } });
      } catch (error) {
        console.error('Error fetching meeting types:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch meeting types' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Error in settings API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, settings } = body;
    
    if (type === 'standard-hours') {
      try {
        // Save each day's hours to database
        const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
        
        for (const day of dayKeys) {
          const hours = settings[day];
          if (typeof hours === 'number') {
            await settingsRepository.setSetting(`standard_hours_${day}`, hours.toString());
          }
        }
        
        return NextResponse.json({ success: true, message: 'Standard hours saved successfully' });
      } catch (error) {
        console.error('Error saving standard hours:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to save standard hours' },
          { status: 500 }
        );
      }
    }
    
    if (type === 'meeting-types') {
      try {
        if (settings.types && Array.isArray(settings.types)) {
          await settingsRepository.setSetting('meeting_types', JSON.stringify(settings.types));
          return NextResponse.json({ success: true, message: 'Meeting types saved successfully' });
        } else {
          return NextResponse.json({ success: false, error: 'Invalid meeting types format' }, { status: 400 });
        }
      } catch (error) {
        console.error('Error saving meeting types:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to save meeting types' },
          { status: 500 }
        );
      }
    }
    
    // For demo purposes, we'll just return success for other types
    // In a real app, you would save these to a database or .env file
    console.log(`Saving ${type} settings:`, settings);
    
    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
