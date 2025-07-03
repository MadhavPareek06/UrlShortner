# 🚀 Deployment Guide - URL Shortener

## Prerequisites
- GitHub account
- Vercel account (free)
- MongoDB Atlas account (free)

## Step 1: Set up MongoDB Atlas (Database)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new project

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "M0 Sandbox" (Free tier)
   - Select your preferred region
   - Name your cluster (e.g., "urlshortener")

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
   - Set privileges to "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0)
   - Confirm

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `urlshortener`

## Step 2: Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   In Vercel dashboard, go to your project → Settings → Environment Variables:
   
   ```
   NODE_ENV=production
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   BASE_URL=https://your-vercel-app.vercel.app
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-project-name.vercel.app`

## Step 3: Test Your Deployment

1. Visit your deployed URL
2. Test URL shortening functionality
3. Test user registration and login
4. Test dashboard features

## Environment Variables Reference

### Required Variables:
- `NODE_ENV`: Set to "production"
- `MONGO_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string (min 32 characters)
- `BASE_URL`: Your deployed Vercel URL
- `CORS_ORIGIN`: Your deployed Vercel URL

### Optional Variables:
- `RATE_LIMIT_WINDOW`: Rate limiting window (default: 900000)
- `RATE_LIMIT_MAX`: Max requests per window (default: 100)

## Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Go to Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update `BASE_URL` and `CORS_ORIGIN` environment variables

## Troubleshooting

### Common Issues:
1. **Database Connection Error**: Check MongoDB Atlas connection string and network access
2. **CORS Error**: Ensure CORS_ORIGIN matches your deployed URL
3. **Build Error**: Check that all dependencies are in package.json
4. **API Routes Not Working**: Ensure vercel.json is configured correctly

### Logs:
- Check Vercel function logs in the dashboard
- Use `console.log` for debugging (visible in Vercel logs)

## Alternative Hosting Options

### Option 2: Railway (Backend) + Netlify (Frontend)
- Deploy backend to Railway
- Deploy frontend to Netlify
- Configure environment variables on both platforms

### Option 3: Heroku + Netlify
- Deploy backend to Heroku
- Deploy frontend to Netlify
- Configure environment variables

### Option 4: DigitalOcean App Platform
- Full-stack deployment on DigitalOcean
- Configure database and environment variables

## Security Considerations

1. **Environment Variables**: Never commit .env files
2. **JWT Secret**: Use a strong, random secret
3. **Database**: Use MongoDB Atlas with proper authentication
4. **CORS**: Configure CORS properly for your domain
5. **Rate Limiting**: Keep rate limiting enabled

## Monitoring

1. **Vercel Analytics**: Enable in Vercel dashboard
2. **MongoDB Atlas Monitoring**: Check database performance
3. **Error Tracking**: Consider adding Sentry for error tracking

---

🎉 **Your URL Shortener is now live!**
