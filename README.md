# Productivity Dashboard

A modern local web application built with Next.js that integrates with Jira, Jenkins, and provides a comprehensive time tracking system.

## Features

### 🎯 Core Features
- **Jira Integration**: Fetch and display assigned tasks, status, priority, and story points
- **Jenkins Automation Reports**: View test automation results with dynamic build selection
- **Time Tracking System**: Start/stop timers, manual time entry, and comprehensive analytics
- **Working Hours Rules**: Automatic calculation of remaining hours and overtime
- **Daily & Weekly Reports**: Productivity insights with category breakdowns
- **Modern Dashboard UI**: Clean, responsive design with dark mode support

### 📊 Dashboard Widgets
- **Today's Summary**: Worked time, remaining hours, and overtime tracking
- **Time Tracking**: Active timer with category selection
- **Jira Tasks**: Filterable task list with status indicators
- **Jenkins Reports**: Test results with export functionality
- **Weekly Analytics**: Productivity trends and insights
- **Quick Stats**: At-a-glance productivity metrics

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 19**
- **TypeScript**
- **TailwindCSS**
- **ShadCN UI components**
- **Lucide React icons**

### Backend
- **Next.js API routes**
- **Node.js**
- **Axios** for external API calls

### Database
- **SQLite**
- **Prisma ORM**

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp env-template.txt .env
```

Edit the `.env` file with your credentials:

```env
# Jira Configuration
JIRA_EMAIL=your-email@example.com
JIRA_TOKEN=your-jira-api-token
JIRA_BASE_URL=https://your-domain.atlassian.net

# Jenkins Configuration
JENKINS_BASE_URL=https://noqodi-jenkins.emaratech.ae
JENKINS_JOB_PATH=job/Payment%20Domain%20Automation%20Job/job/pretest

# Database
DATABASE_URL="file:./dev.db"

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Generate Prisma client and create the database:

```bash
npm run db:generate
npm run db:push
```

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Configuration

### Jira Setup
1. Get your Jira API token from [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Add your email and token to the `.env` file
3. Set your Jira base URL (e.g., `https://your-domain.atlassian.net`)

### Jenkins Setup
1. Configure the Jenkins base URL in `.env`
2. Set the job path for your automation reports
3. Ensure the Jenkins server is accessible from your network

### Working Hours Configuration
Default working hours are configured in `src/config/env.ts`:
- Monday-Thursday: 8 hours
- Friday: 4 hours
- Saturday-Sunday: 0 hours

## Usage

### Time Tracking
1. Select a category (meetings, calls, scripting, etc.)
2. Enter a description of your work
3. Click "Start Timer" to begin tracking
4. Click "Stop" when finished
5. View your daily summary and weekly analytics

### Jira Integration
1. View your assigned tickets in the Jira Tasks widget
2. Use search and filters to find specific tickets
3. Click on ticket IDs to open them in Jira
4. Status and priority are color-coded for quick identification

### Jenkins Reports
1. Select a build number from the dropdown
2. View test results with pass/fail statistics
3. Use filters to focus on specific test statuses
4. Export results to CSV for further analysis

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── settings/          # Settings pages
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── dashboard/        # Dashboard widgets
│   ├── jira/            # Jira components
│   ├── jenkins/         # Jenkins components
│   └── time-tracking/   # Time tracking components
├── services/            # Business logic services
├── repositories/        # Data access layer
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── config/             # Configuration files
└── lib/                # Library utilities
```

## Database Schema

### TimeEntry
- `id` - Unique identifier
- `category` - Task category (meetings, calls, etc.)
- `description` - Work description
- `startTime` - Start timestamp
- `endTime` - End timestamp (nullable)
- `duration` - Duration in minutes
- `notes` - Additional notes
- `date` - Date entry (for grouping)

### Settings
- `id` - Unique identifier
- `key` - Setting key
- `value` - Setting value

### JiraTicket
- `id` - Ticket ID
- `summary` - Ticket summary
- `status` - Current status
- `priority` - Priority level
- `storyPoints` - Story points
- `assignee` - Assigned user
- `lastUpdated` - Last update timestamp

### JenkinsReport
- `id` - Unique identifier
- `buildNumber` - Build number
- `subGroup` - Test sub-group
- `feature` - Feature name
- `scenario` - Test scenario
- `status` - Test status
- `testCaseId` - Test case ID

## Development

### Adding New Features
1. Create types in `src/types/`
2. Implement services in `src/services/`
3. Add API routes in `src/app/api/`
4. Create UI components in `src/components/`
5. Update the dashboard as needed

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Update types and services accordingly

## Troubleshooting

### Common Issues

**Database connection errors**
- Ensure SQLite is properly installed
- Check the DATABASE_URL in `.env`
- Run `npm run db:push` to create tables

**Jira API errors**
- Verify your Jira credentials
- Check if your API token is valid
- Ensure the base URL is correct

**Jenkins connection issues**
- Verify Jenkins server accessibility
- Check the job path configuration
- Ensure build numbers are valid

## License

This project is for internal use only.
