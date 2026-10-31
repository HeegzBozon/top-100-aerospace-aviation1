import { Navigate, useNavigate } from 'react-router-dom';
import HostApplication from '@/components/conferences/HostApplication';
import HostGate from '@/components/conferences/HostGate';
import useHostAccess from '@/components/conferences/useHostAccess';
import { HOST_HREF } from '@/components/conferences/conferenceConfig';

// The door to the workspace. An approved host is sent straight through it; everyone else
// applies here, and the application is the only thing this address ever writes.
export default function ConferenceHostApply() {
  const navigate = useNavigate();
  const { state, access, apply, retry } = useHostAccess();

  if (state.loading || state.signedOut || state.failed) {
    return <HostGate state={state} onRetry={retry} />;
  }

  if (access.isHost || access.isAdmin) {
    return <Navigate to={HOST_HREF} replace />;
  }

  return (
    <HostApplication
      application={access.application}
      onApply={apply}
      onCancel={() => navigate('/conferences')}
    />
  );
}