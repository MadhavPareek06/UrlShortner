# URL Shortener Frontend

A modern, responsive React frontend for the URL shortener application built with Vite and Tailwind CSS.

## Features

- **Clean, Modern UI**: Beautiful interface with Tailwind CSS styling
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **URL Shortening**: Easy-to-use form for shortening long URLs
- **Dashboard**: View and manage all your shortened URLs
- **Copy to Clipboard**: One-click copying of shortened URLs
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Smooth loading indicators for better UX

## Tech Stack

- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   If you encounter PowerShell execution policy issues on Windows, try:
   ```bash
   node_modules\.bin\vite
   ```

4. Open your browser and visit `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Project Structure

```
client/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ErrorBoundary.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── Navbar.jsx
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx
│   │   ├── HomePage.jsx
│   │   └── NotFound.jsx
│   ├── api/                # API service functions
│   │   └── urlService.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── public/                 # Static assets
├── package.json
└── vite.config.js
```

## API Integration

The frontend integrates with the backend API running on `http://localhost:5000`. Make sure your backend server is running before using the application.

### Current API Endpoints Used:
- `POST /api/shorten` - Create a shortened URL

### Note on Dashboard Data:
Currently, the dashboard uses localStorage to store and display URLs since the backend doesn't have endpoints for listing and deleting URLs yet. In a production environment, you would want to add these endpoints to the backend.

## Features Overview

### Home Page
- URL input form with validation
- Real-time URL shortening
- Copy to clipboard functionality
- Success/error feedback
- Feature highlights section

### Dashboard
- List of all shortened URLs
- Statistics overview
- Copy and delete functionality
- Responsive table design
- Empty state handling

### Error Handling
- Global error boundary
- Form validation
- API error handling
- 404 page for unknown routes

## Customization

The app uses Tailwind CSS for styling. You can customize the design by:

1. Modifying the Tailwind configuration in `tailwind.config.js`
2. Updating the color scheme in the components
3. Adding custom CSS classes in `src/index.css`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
