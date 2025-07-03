# URL Shortener

A simple and clean URL shortener built with React and Node.js. Shorten long URLs, track clicks, and manage your links with an easy-to-use dashboard.

## Features

- Shorten long URLs into easy-to-share links
- User registration and login system
- Personal dashboard to manage your URLs
- Click tracking and basic analytics
- Admin panel for managing all URLs and users
- Responsive design that works on mobile and desktop

## Tech Stack

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT tokens

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/url-shortener.git
   cd urlshortner
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your MongoDB connection
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## Configuration

Create a `.env` file in the `server` folder:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/urlshortener
BASE_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=secrete key
```

## How to Use

1. **Register/Login**: Create an account or log in
2. **Shorten URLs**: Paste a long URL and get a short link
3. **Manage Links**: View all your shortened URLs in the dashboard
4. **Track Clicks**: See how many times your links were clicked
5. **Admin Features**: If you're an admin, manage all users and URLs

## Deployment

You can deploy this app to platforms like:
- **Vercel** (recommended for easy deployment)
- **Heroku**
- **Railway**
- **DigitalOcean**

For detailed deployment instructions, check the `DEPLOYMENT.md` file.


