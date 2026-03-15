# Deployment Guide: Productivity Dashboard

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" button in the top right corner and select "New repository"
3. Repository name: `productivity-dashboard`
4. Description: `A modern productivity dashboard with Jira, Jenkins integration and time tracking`
5. Make it **Public** (for free deployment)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Step 2: Push Code to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/productivity-dashboard.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in with your GitHub account
2. Click "Add New..." → "Project"
3. Import your `productivity-dashboard` repository from GitHub
4. Vercel will automatically detect it's a Next.js project
5. Click "Deploy"

## Step 4: Configure Environment Variables

After deployment, you need to set up environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add these variables:

```
JIRA_EMAIL=your-email@example.com
JIRA_TOKEN=your-jira-api-token
JIRA_BASE_URL=https://your-domain.atlassian.net
JENKINS_BASE_URL=https://noqodi-jenkins.emaratech.ae
JENKINS_JOB_PATH=job/Payment%20Domain%20Automation%20Job/job/pretest
DATABASE_URL=file:./dev.db
NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app
```

## Step 5: Redeploy

After adding environment variables, click "Deployments" → "Redeploy" to apply the changes.

## Important Notes

### Database Considerations
- Your current setup uses SQLite (`file:./dev.db`)
- For production, you might want to use Vercel's Postgres or another cloud database
- If you keep SQLite, the database will be reset on each deployment

### Jira & Jenkins Integration
- Make sure your Jira API token has the right permissions
- Ensure Jenkins server is accessible from the internet
- Test the integrations after deployment

### Your Live URL
Once deployed, your app will be available at:
`https://productivity-dashboard-[your-username].vercel.app`

## Troubleshooting

If you get build errors:
1. Check that all environment variables are set correctly
2. Make sure the build command works locally (`npm run build`)
3. Check Vercel's build logs for specific errors

## Alternative: Manual GitHub Commands

If you prefer not to use the GitHub web interface:

```bash
# Create repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/productivity-dashboard.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.
