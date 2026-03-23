import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProfileView from '@/pages/ProfileView';

export default function UserProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const user = params.get('user');

  // Otherwise redirect to My Profile dashboard
  useEffect(() => {
    if (!id && !user) {
      navigate(createPageUrl('Home') + '?tab=profile');
    }
  }, [navigate, id, user]);

  // If viewing specific user, show ProfileView
  if (id || user) {
    return <ProfileView />;
  }

  return null;
}