import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/services/notificationService';

export async function GET() {
  try {
    const goals = await notificationService.getWeeklyGoals();
    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching weekly goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const goal = await notificationService.createWeeklyGoal(data);
    
    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error creating weekly goal:', error);
    return NextResponse.json(
      { error: 'Failed to create weekly goal' },
      { status: 500 }
    );
  }
}
