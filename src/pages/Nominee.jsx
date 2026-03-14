import React from 'react';
import ProfileView from './ProfileView';

// Legacy redirect stub — pages/Nominee was consolidated into ProfileView
export default function Nominee(props) {
    return <ProfileView {...props} />;
}