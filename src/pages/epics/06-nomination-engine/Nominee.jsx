import React from 'react';
import ProfileView from '../01-index-engine/ProfileView';

// Legacy redirect stub — pages/Nominee was consolidated into ProfileView
export default function Nominee(props) {
    return <ProfileView {...props} />;
}