import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import NoteEditor from './components/NoteEditor';
import PrivateRoute from './components/PrivateRoute';
import Ad from './components/Ad';

const App: React.FC = () => {
  useEffect(() => {
    // Load Google AdSense script
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    // Initialize ads
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Top Ad */}
          <div className="w-full bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Ad 
                slot="top-ad" 
                style={{ width: '100%', height: '90px' }}
                format="horizontal"
              />
            </div>
          </div>

          <div className="flex">
            {/* Main Content */}
            <div className="flex-1">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/notes/:id"
                  element={
                    <PrivateRoute>
                      <NoteEditor />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>

            {/* Right Side Ad */}
            <div className="w-64 bg-white shadow-sm">
              <div className="p-4">
                <Ad 
                  slot="right-ad" 
                  style={{ width: '160px', height: '600px' }}
                  format="vertical"
                />
              </div>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App; 