

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ className = '', children = 'Logout' }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <button onClick={handleLogout} className={className}>
      {children}
    </button>
  );
};

export default LogoutButton;
