import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Named export

import { base44 } from '@/api/base44Client';
import { pagesConfig } from '@/pages.config';

const NavigationTracker = () => {
  const { user } = useAuth(); // Using the hook
  const location = useLocation();

  useEffect(() => {
    // Track navigation here
    console.log('User:', user, 'Navigated to:', location.pathname);
  }, [location, user]);

  return null; // This component doesn't render anything
};

export default NavigationTracker;
