import MissionTheatre from '@/components/theatre/MissionTheatre';

// The Mission Theatre's own address. The theatre reads the launch library itself, so this
// page is the frame and nothing else.
export default function LaunchParty() {
  return <MissionTheatre variant="page" />;
}