import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { shortenUrl } from '../api/urlService';

const HomePage = () => {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await shortenUrl(url);
      if (response.success) {
        setShortUrl(response.shortUrl);
      } else {
        setError(response.message || 'Failed to shorten URL');
      }
    } catch (err) {
      setError(err.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleReset = () => {
    setUrl('');
    setShortUrl('');
    setError('');
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          {isAuthenticated ? (
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Welcome back,</span>
                <span className="block text-blue-600">{user?.firstName || user?.username}!</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Ready to create more short links? Your URLs are automatically saved to your dashboard.
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 mt-4"
              >
                View Dashboard →
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Shorten Your</span>
                <span className="block text-blue-600">Long URLs</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Transform your lengthy URLs into short, shareable links in seconds.
                Perfect for social media, emails, and anywhere you need clean, professional links.
              </p>
            </>
          )}
        </div>

        {/* URL Shortener Form */}
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your long URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/very-long-url-that-needs-shortening"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Shortening...
                    </div>
                  ) : (
                    'Shorten URL'
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </form>

          {/* Result Section */}
          {shortUrl && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-medium text-green-800 mb-4">Your shortened URL is ready!</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={shortUrl}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  {copied ? (
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                      Copy
                    </div>
                  )}
                </button>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-green-700">
                  Original: <span className="font-mono text-xs break-all">{url}</span>
                </p>
                <button
                  onClick={handleReset}
                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  Shorten Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Fast & Reliable</h3>
            <p className="mt-2 text-sm text-gray-500">
              Generate short URLs instantly with our high-performance service.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Clean & Simple</h3>
            <p className="mt-2 text-sm text-gray-500">
              No clutter, no ads. Just clean, professional short links.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Easy Sharing</h3>
            <p className="mt-2 text-sm text-gray-500">
              Perfect for social media, emails, and professional communications.
            </p>
          </div>
        </div>

        {/* Call to Action for Non-Authenticated Users */}
        {!isAuthenticated && (
          <div className="mt-16 bg-white rounded-lg shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Want More Features?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Create a free account to unlock analytics, URL management, custom short IDs, and more!
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Sign Up Free
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
            </div>

            {/* Benefits */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                URL Analytics
              </div>
              <div className="flex items-center justify-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Custom Short IDs
              </div>
              <div className="flex items-center justify-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                URL Management
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
