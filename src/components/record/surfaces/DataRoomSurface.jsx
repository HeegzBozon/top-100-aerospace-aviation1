import DataRoomVault from '@/components/record/dataroom/DataRoomVault';

// The Data Room: what a founder, an investor, an employer or an employee is handed.
//
// The words used to live here. They are the Interview now — a reader being introduced to a
// person, not someone checking a file — so the room is left to documents, filed under the
// four readers who open it.
export default function DataRoomSurface({ account }) {
  return <DataRoomVault email={account?.email || ''} />;
}