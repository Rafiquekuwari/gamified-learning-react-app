// src/contexts/AuthContext.js
import React, { useState, useEffect, createContext, useContext } from 'react';
import { initialContent } from '../constants/contentData'; // Import initialContent

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        let storedUser = JSON.parse(localStorage.getItem('currentUser'));
        if (storedUser && storedUser.username === token) {
          // *** Crucial Update for existing users: Ensure progress_data structure is complete ***
          storedUser = ensureUserDataStructure(storedUser); // Call a new helper function
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('userToken');
          localStorage.removeItem('currentUser');
        }
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem('userToken');
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  // Helper function to ensure user data has the correct structure
  const ensureUserDataStructure = (userData) => {
    const updatedUser = { ...userData };

    if (!updatedUser.progress_data) {
      updatedUser.progress_data = {};
    }

    if (!updatedUser.progress_data.skillProficiency) {
      updatedUser.progress_data.skillProficiency = {};
    }

    // Initialize all known skills to 0 proficiency if they don't exist
    const allSkills = [...new Set(initialContent.flatMap(item => item.skill_tags || []))];
    allSkills.forEach(skill => {
      if (updatedUser.progress_data.skillProficiency[skill] === undefined) {
        updatedUser.progress_data.skillProficiency[skill] = 0;
      }
    });

    if (!updatedUser.progress_data.subjectProgress) {
      updatedUser.progress_data.subjectProgress = { math: null, literacy: null, science: null };
    }

    if (!updatedUser.progress_data.lastQuizResult) {
      updatedUser.progress_data.lastQuizResult = { math: null, literacy: null, science: null };
    }

    // Ensure avatar_items is an array
    if (!updatedUser.avatar_items) {
        updatedUser.avatar_items = [];
    }
    // Ensure avatar_choice has a default if missing
    if (!updatedUser.avatar_choice) {
        updatedUser.avatar_choice = 'https://placehold.co/35x35/4CAF50/fff?text=😊';
    }


    return updatedUser;
  };

  const login = (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
        let storedUser = storedUsers[username]; // Use 'let' to reassign

        if (storedUser && storedUser.password === password) {
          // Ensure structure for the logged-in user
          storedUser = ensureUserDataStructure(storedUser);
          // And crucially, update the stored data immediately after ensuring structure
          storedUsers[username] = storedUser;
          localStorage.setItem('users', JSON.stringify(storedUsers));

          setUser(storedUser);
          setIsAuthenticated(true);
          localStorage.setItem('userToken', username);
          localStorage.setItem('currentUser', JSON.stringify(storedUser));
          resolve(storedUser);
        } else {
          reject(new Error('Invalid username or password.'));
        }
      }, 500);
    });
  };

  const register = (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
        if (storedUsers[username]) {
          reject(new Error('Username already exists.'));
        } else {
          let newUser = { // Use 'let' to reassign
            username,
            password,
            id: Date.now().toString(),
            current_level: 1,
            points: 0,
            avatar_choice: 'https://placehold.co/35x35/4CAF50/fff?text=😊', // Default avatar
            avatar_items: [], // New: owned avatar items
            progress_data: {} // Initialize as empty object, then fill via ensureUserDataStructure
          };
          
          // Ensure full structure for the new user
          newUser = ensureUserDataStructure(newUser);

          storedUsers[username] = newUser;
          localStorage.setItem('users', JSON.stringify(storedUsers));
          setUser(newUser);
          setIsAuthenticated(true);
          localStorage.setItem('userToken', username);
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          resolve(newUser);
        }
      }, 500);
    });
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUserData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
        // Ensure structure before saving to main 'users' store
        const userToStore = ensureUserDataStructure(updatedUserData);
        storedUsers[userToStore.username] = userToStore;
        localStorage.setItem('users', JSON.stringify(storedUsers)); // Fix: Store `storedUsers` not `updatedUserData`
        localStorage.setItem('currentUser', JSON.stringify(userToStore)); // Use the structure-ensured data here too
        setUser(userToStore); // Update local state with the structure-ensured data
        resolve(userToStore);
      }, 100);
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error("useAuth must be used within an AuthProvider");
    return { user: null, isAuthenticated: false, isLoading: true, login: async()=>{}, register: async()=>{}, logout: ()=>{}, updateUser: async()=>{} };
  }
  return context;
};