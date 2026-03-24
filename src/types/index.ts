export interface JiraTicket {
  id: string;
  summary: string;
  status: string;
  priority?: string;
  storyPoints?: number;
  assignee?: string;
  lastUpdated: string;
  created: string;
  issuetype?: string;
}

export interface JenkinsTestCase {
  subGroup: string;
  feature: string;
  scenario: string;
  status: string;
  testCaseId?: string;
}

export interface TimeEntry {
  id: string;
  category: TimeCategory;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  notes?: string;
  date: Date;
}

export type TimeCategory = 
  | 'meetings'
  | 'calls'
  | 'scripting'
  | 'refactoring'
  | 'break'
  | 'investigate'
  | 'reporting';

export interface WorkingHours {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface DailySummary {
  worked: number; // in minutes
  remaining: number; // in minutes
  overtime: number; // in minutes
  date: Date;
}

export interface WeeklyReport {
  totalHours: number;
  categoryBreakdown: Record<TimeCategory, number>;
  dailyHours: Record<string, number>;
  notes: string[];
}

export interface JenkinsSuite {
  name: string;
  cases: JenkinsTestCase[];
}

export interface JenkinsReportData {
  suites: JenkinsSuite[];
}

export interface MeetingType {
  id: string;
  name: string;
  enabled: boolean;
}

export interface MeetingTypesSettings {
  types: MeetingType[];
}
