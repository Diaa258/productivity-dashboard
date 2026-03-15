# GitHub Pages Deployment Guide

## 🚀 Deploy Your Productivity Dashboard to GitHub Pages

This will make your application accessible via a public link like:
`https://YOUR_USERNAME.github.io/productivity-dashboard`

## Step 1: Push to GitHub

If you haven't already, push your code to GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/productivity-dashboard.git
git branch -M main
git push -u origin main
```

## Step 2: Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under "Build and deployment", select **GitHub Actions**
5. Save the settings

## Step 3: Automatic Deployment

Once you push to GitHub, the deployment will happen automatically:

1. GitHub Actions will build your Next.js app
2. It will be deployed to GitHub Pages
3. Your app will be live at: `https://YOUR_USERNAME.github.io/productivity-dashboard`

## Step 4: Access Your App

After deployment (usually takes 2-3 minutes), visit:
```
https://YOUR_USERNAME.github.io/productivity-dashboard
```

## 📱 Important Notes

### Database Limitations
Since this is a static deployment on GitHub Pages:
- **SQLite database won't work** (requires server)
- Time tracking data won't persist between sessions
- Jira/Jenkins integrations may have CORS issues

### For Full Functionality
If you need the complete app with database and API integrations:
1. Use **Vercel** (recommended) - free hosting with serverless functions
2. Or **Netlify** with serverless functions
3. Or **Railway/Render** for full backend hosting

### Quick Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your project folder
vercel

# Follow the prompts to connect to your GitHub
```

## 🔧 Troubleshooting

### If Build Fails
1. Check the Actions tab in your GitHub repo
2. Look for error messages in the build logs
3. Make sure all dependencies are installed correctly

### If App Doesn't Load
1. Wait a few minutes for GitHub Pages to activate
2. Check that GitHub Actions completed successfully
3. Verify the URL path includes `/productivity-dashboard`

### For API Issues
Since GitHub Pages is static hosting, API routes won't work. For full functionality, deploy to Vercel instead.

## 🌐 Alternative: Vercel Deployment (Full Features)

For the best experience with all features working:

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import your repository
4. Vercel will automatically deploy with serverless functions
5. All features will work including database and APIs

Your Vercel URL will be: `https://productivity-dashboard-[your-username].vercel.app`
