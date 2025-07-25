import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
// import AICompanion from './components/AICompanion'; // REMOVED
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Lesson from './pages/Lesson';
import Quiz from './pages/Quiz';
import QuizResult from './pages/QuizResult';
import PracticePage from './pages/PracticePage';


// New component to encapsulate the logic that uses AuthContext
const AppContent = ({ currentPath, navigate, locationState }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect logic based on authentication
  useEffect(() => {
    if (!isLoading) {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      const token = localStorage.getItem('userToken');

      if (!token || !user) {
        if (currentPath !== '/login' && currentPath !== '/register') {
          navigate('/login');
        }
      } else {
        // User is authenticated, redirect from login/register/diagnostic
        if (currentPath === '/login' || currentPath === '/register' || currentPath === '/diagnostic-quiz') {
          navigate('/');
        }
      }
    }
  }, [isAuthenticated, isLoading, currentPath, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading application...</p>
      </div>
    );
  }

  // Render components based on currentPath
  let ComponentToRender;
  if (!isAuthenticated && (currentPath !== '/login' && currentPath !== '/register')) {
    ComponentToRender = () => <Login navigate={navigate} />;
  } else if (currentPath === '/login') {
    ComponentToRender = () => <Login navigate={navigate} />;
  } else if (currentPath === '/register') {
    ComponentToRender = () => <Register navigate={navigate} />;
  } else if (currentPath.startsWith('/learn/')) {
    ComponentToRender = () => <Lesson navigate={navigate} currentPath={currentPath} />;
  } else if (currentPath.startsWith('/quiz/')) {
    ComponentToRender = () => <Quiz navigate={navigate} currentPath={currentPath} />;
  } else if (currentPath === '/quiz-result') {
    ComponentToRender = () => <QuizResult navigate={navigate} locationState={locationState} />;
  }
   else if (currentPath === '/practice') {
    ComponentToRender = () => <PracticePage navigate={navigate} locationState={locationState} />;
  } else {
    ComponentToRender = () => <Dashboard navigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-blue-50 font-inter">
      <Header navigate={navigate} />
      <div className="p-4">
        {ComponentToRender()}
      </div>
      {/* <AICompanion /> */} {/* REMOVED */}
    </div>
  );
};

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [locationState, setLocationState] = useState(null);

  // Simple state-based router
  const navigate = (path, state = null) => {
    try {
      window.history.pushState(state, '', path);
    } catch (e) {
      console.warn("SecurityError: Could not pushState. Internal routing will still function.", e);
    }
    setCurrentPath(path);
    setLocationState(state);
  };

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setLocationState(window.history.state);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <AuthProvider>
      <AppContent currentPath={currentPath} navigate={navigate} locationState={locationState} />
    </AuthProvider>
  );
}

export default App;