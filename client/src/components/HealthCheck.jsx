import React, { useState, useEffect } from 'react';
import { checkApiHealth } from '../api/urlService';

const HealthCheck = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      setStatus('checking');
      setError('');
      const response = await checkApiHealth();
      if (response.success) {
        setStatus('healthy');
      } else {
        setStatus('unhealthy');
        setError('API is not responding properly');
      }
    } catch (err) {
      setStatus('unhealthy');
      setError(err.message || 'Failed to connect to API');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      case 'checking':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return (
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'unhealthy':
        return (
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'checking':
        return (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="ml-1">
          {status === 'healthy' && 'API Connected'}
          {status === 'unhealthy' && 'API Disconnected'}
          {status === 'checking' && 'Checking...'}
        </span>
      </div>
      {status === 'unhealthy' && (
        <button
          onClick={checkHealth}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Retry
        </button>
      )}
      {error && (
        <span className="text-xs text-red-600" title={error}>
          ⚠️
        </span>
      )}
    </div>
  );
};

export default HealthCheck;
