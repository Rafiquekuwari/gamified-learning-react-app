import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ navigate }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-teal-600 text-white p-4 text-center shadow-md flex justify-between items-center rounded-b-xl">
      <h1 className="text-2xl font-bold">
        <button onClick={() => navigate('/')} className="text-white no-underline">Edutech Fun Learn!</button>
      </h1>
      {isAuthenticated && user ? (
        <div className="flex items-center space-x-4">
          <img src={user.avatar_choice} alt="Avatar" className="w-9 h-9 rounded-full border-2 border-white" />
          <span className="text-lg">
            {user.username} | Points: {user.points} | Math Level: {user.subject_levels.math} | Literacy Level: {user.subject_levels.literacy}
          </span>
          <button
            onClick={handleLogout}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
          >
            Logout
          </button>
        </div>
      ) : (
        <nav className="space-x-4">
          <button onClick={() => navigate('/login')} className="text-white font-bold hover:underline">Login</button>
          <button onClick={() => navigate('/register')} className="text-white font-bold hover:underline">Register</button>
        </nav>
      )}
    </header>
  );
};

export default Header;