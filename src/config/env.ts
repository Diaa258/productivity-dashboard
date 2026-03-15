export const config = {
  jira: {
    email: process.env.JIRA_EMAIL || '',
    token: process.env.JIRA_TOKEN || '',
    baseUrl: process.env.JIRA_BASE_URL || '',
  },
  jenkins: {
    baseUrl: process.env.JENKINS_BASE_URL || 'https://noqodi-jenkins.emaratech.ae',
    jobPath: process.env.JENKINS_JOB_PATH || 'job/Payment%20Domain%20Automation%20Job/job/pretest',
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
};

export const workingHours = {
  monday: 8, // hours
  tuesday: 8,
  wednesday: 8,
  thursday: 8,
  friday: 4,
  saturday: 0,
  sunday: 8, // Changed from 0 to 8 to allow Sunday work
};

export const timeCategories = [
  'meetings',
  'calls', 
  'scripting',
  'refactoring',
  'break',
  'investigate',
  'reporting',
] as const;
