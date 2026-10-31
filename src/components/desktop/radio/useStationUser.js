import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { isViewingAsVisitor } from "@/lib/viewerPreview";

// Who is standing at the machine. The faceplate's TX lamp and its station key both
// read this, so the record is asked once per sitting and the answer is shared.
let request = null;

function ask() {
  if (isViewingAsVisitor()) return Promise.resolve(null);
  if (!request) {
    request = base44.auth
      .me()
      .then((user) => user || null)
      .catch(() => null);
  }
  return request;
}

// undefined while the record is being read, null for a visitor, the record when signed in.
export default function useStationUser() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    let live = true;
    ask().then((answer) => {
      if (live) setUser(answer);
    });
    return () => {
      live = false;
    };
  }, []);

  return user;
}