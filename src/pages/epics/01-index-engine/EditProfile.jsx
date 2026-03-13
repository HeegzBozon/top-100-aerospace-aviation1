import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EditProfile() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(createPageUrl('Home') + '?tab=profile');
  }, [navigate]);
  return null;
}