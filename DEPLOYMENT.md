# 🚀 Deploying NoCSLOL to Vercel

This guide will walk you through deploying your NoCSLOL website to Vercel, the recommended hosting platform for Next.js applications.

## 📋 Prerequisites

- A GitHub, GitLab, or Bitbucket account
- Your NoCSLOL project pushed to a repository
- A Discord server for webhook integration

## 🔧 Step 1: Prepare Your Project

1. **Ensure all files are committed and pushed to your repository**
   ```bash
   git add .
   git commit -m "Initial NoCSLOL website commit"
   git push origin main
   ```

2. **Verify your project structure looks like this:**
   ```
   nocslol/
   ├── app/
   ├── package.json
   ├── tailwind.config.js
   ├── tsconfig.json
   └── README.md
   ```

## 🌐 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com) and sign in**
   - Use your GitHub/GitLab/Bitbucket account

2. **Click "New Project"**

3. **Import your repository**
   - Select your NoCSLOL repository
   - Vercel will automatically detect it's a Next.js project

4. **Configure project settings**
   - **Project Name**: `nocslol` (or your preferred name)
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. **Click "Deploy"**

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**
   ```bash
   vercel
   ```

4. **Follow the prompts to configure your project**

## ⚙️ Step 3: Configure Environment Variables

1. **In your Vercel project dashboard, go to Settings > Environment Variables**

2. **Add the following variables:**
   ```
   Name: NEXT_PUBLIC_DISCORD_WEBHOOK_URL
   Value: https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
   Environment: Production (and Preview if you want)
   ```

3. **Click "Add"**

4. **Redeploy your project** (Settings > General > Redeploy)

## 🔗 Step 4: Set Up Discord Webhook

1. **In your Discord server, go to Server Settings > Integrations > Webhooks**

2. **Click "New Webhook"**

3. **Configure the webhook:**
   - **Name**: `NoCSLOL Submissions`
   - **Channel**: Choose a channel for submissions
   - **Copy the webhook URL**

4. **Add the webhook URL to your Vercel environment variables**

## 🎯 Step 5: Custom Domain (Optional)

1. **In Vercel dashboard, go to Settings > Domains**

2. **Add your custom domain**
   - Example: `nocslol.com` or `nocslol.yourdomain.com`

3. **Configure DNS records as instructed by Vercel**

4. **Wait for DNS propagation (can take up to 48 hours)**

## 🔄 Step 6: Automatic Deployments

Vercel will automatically:
- Deploy when you push to your main branch
- Create preview deployments for pull requests
- Optimize your Next.js application
- Handle SSL certificates
- Provide CDN distribution

## 📱 Step 7: Test Your Deployment

1. **Visit your deployed URL**
   - Check all pages load correctly
   - Test the navigation
   - Verify forms work

2. **Test Discord webhook**
   - Submit a test entry via the Submit Info page
   - Verify it appears in your Discord channel

3. **Test responsive design**
   - Check mobile and tablet layouts
   - Verify all interactive elements work

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check your `package.json` scripts
   - Ensure all dependencies are properly listed
   - Verify TypeScript compilation

2. **Environment Variables Not Working**
   - Ensure variables are set for the correct environment
   - Redeploy after adding variables
   - Check variable names match exactly

3. **Discord Webhook Issues**
   - Verify webhook URL is correct
   - Check Discord server permissions
   - Test webhook manually

4. **Image Loading Issues**
   - Ensure image URLs are accessible
   - Check Next.js image configuration
   - Verify domain whitelist in `next.config.js`

### Getting Help

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Support**: Available in your dashboard

## 🎉 Success!

Once deployed, your NoCSLOL website will be:
- ✅ Live and accessible worldwide
- ✅ Automatically optimized by Vercel
- ✅ Integrated with Discord for submissions
- ✅ Ready for the NoCS community!

## 🔮 Next Steps

Consider adding:
- **Analytics**: Google Analytics or Vercel Analytics
- **Monitoring**: Uptime monitoring services
- **Backup**: Regular database backups if you add one
- **CDN**: Additional CDN services for global performance

---

**Your NoCSLOL website is now live! 🏆⚔️**

Share it with the League of Legends community and start building the ultimate NoCS database!
