# Netlify Deployment Guide

This project is configured for easy deployment on Netlify.

## Quick Deploy

### Option 1: Deploy via Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy:
```bash
netlify deploy --prod
```

### Option 2: Deploy via Git

1. Push your code to GitHub/GitLab/Bitbucket

2. Go to [Netlify](https://app.netlify.com/)

3. Click "Add new site" → "Import an existing project"

4. Connect your Git repository

5. Netlify will automatically detect the settings from `netlify.toml`

6. Click "Deploy site"

## Configuration

The project includes a `netlify.toml` file with the following settings:

- **Build Command**: `pnpm install && pnpm run build:prod`
- **Publish Directory**: `dist`
- **Node Version**: 20
- **SPA Redirects**: Configured for React Router
- **Cache Headers**: Optimized for static assets

## Build Settings

If you need to manually configure in Netlify UI:

- Build command: `pnpm install && pnpm run build:prod`
- Publish directory: `dist`
- Node version: 20

## Environment Variables

If your project needs environment variables:

1. Go to Site settings → Environment variables in Netlify dashboard
2. Add your variables (e.g., API keys)
3. Redeploy your site

## Custom Domain

To add a custom domain:

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Continuous Deployment

Once connected to Git, Netlify will automatically:
- Deploy on every push to your main branch
- Generate preview deployments for pull requests
- Run build checks before deploying
