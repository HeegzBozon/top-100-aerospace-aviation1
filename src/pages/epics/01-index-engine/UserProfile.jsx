import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProfileView from '@/pages/epics/01-index-engine/ProfileView';

export default function UserProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const user = params.get('user');

  // If viewing specific user, show ProfileView
  if (id || user) {
    return <ProfileView />;
  }

  // Otherwise redirect to My Profile dashboard
  useEffect(() => {
    navigate(createPageUrl('Home') + '?tab=profile');
  }, [navigate]);

  return null;
}