import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUrlAnalytics } from '../api/urlService';

const Analytics = () => {
  const { shortId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (shortId) {
      fetchAnalytics();
    }
  }, [shortId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getUrlAnalytics(shortId);
      
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTopItems = (obj, limit = 5) => {
    return Object.entries(obj)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);
  };

  const getDailyClicksArray = (dailyClicks) => {
    const sortedDates = Object.keys(dailyClicks).sort();
    return sortedDates.map(date => ({
      date,
      clicks: dailyClicks[date]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-medium text-gray-900">Analytics Error</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <Link
              to="/dashboard"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">No analytics data found</h2>
            <Link
              to="/dashboard"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const topReferrers = getTopItems(analytics.topReferrers);
  const topUserAgents = getTopItems(analytics.topUserAgents);
  const dailyClicksArray = getDailyClicksArray(analytics.dailyClicks);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">URL Analytics</h1>
              <p className="mt-2 text-gray-600">
                Detailed analytics for: <span className="font-mono text-blue-600">/{shortId}</span>
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Clicks</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalClicks}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Created</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatDate(analytics.createdAt)}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Last Click</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.lastClickedAt ? formatDate(analytics.lastClickedAt) : 'Never'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  analytics.isActive ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <svg className={`h-5 w-5 ${analytics.isActive ? 'text-green-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d={analytics.isActive 
                      ? "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      : "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    } clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Status</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.isActive ? 'Active' : 'Inactive'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Clicks Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Clicks</h3>
            {dailyClicksArray.length > 0 ? (
              <div className="space-y-3">
                {dailyClicksArray.slice(-7).map(({ date, clicks }) => (
                  <div key={date} className="flex items-center">
                    <div className="w-20 text-sm text-gray-600">{formatDate(date)}</div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.max((clicks / Math.max(...dailyClicksArray.map(d => d.clicks))) * 100, 5)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-8 text-sm font-medium text-gray-900">{clicks}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No click data available</p>
            )}
          </div>

          {/* Top Referrers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Referrers</h3>
            {topReferrers.length > 0 ? (
              <div className="space-y-3">
                {topReferrers.map(([referrer, count]) => (
                  <div key={referrer} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {referrer === 'Direct' ? '🔗 Direct' : `🌐 ${referrer}`}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center">
                      <span className="text-sm text-gray-600">{count} clicks</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No referrer data available</p>
            )}
          </div>

          {/* Top Browsers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Browsers</h3>
            {topUserAgents.length > 0 ? (
              <div className="space-y-3">
                {topUserAgents.map(([browser, count]) => (
                  <div key={browser} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {browser === 'Chrome' && '🟢'} 
                        {browser === 'Firefox' && '🟠'} 
                        {browser === 'Safari' && '🔵'} 
                        {browser === 'Edge' && '🟦'} 
                        {browser === 'Other' && '⚪'} 
                        {' '}{browser}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center">
                      <span className="text-sm text-gray-600">{count} clicks</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No browser data available</p>
            )}
          </div>

          {/* Recent Clicks */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Clicks</h3>
            {analytics.clickHistory && analytics.clickHistory.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analytics.clickHistory.slice(-10).reverse().map((click, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 truncate">
                        {formatDateTime(click.timestamp)}
                      </p>
                      <p className="text-gray-500 truncate">
                        {click.referer || 'Direct'} • {click.ip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent clicks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
