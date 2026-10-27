// A surface's own entries in the machine's File menu.
//
// File belongs to the machine — the front screen and the platform's surfaces — but the
// surface a reader is standing on can have work of its own in it: an issue being read
// keeps its own list there (follow an honoree, connect her, share her profile, take the
// issue away as a PDF). That list belongs to the reading and not to the machine, so it is
// registered for exactly as long as the surface is on the glass and gone the moment it is
// left. The registry is a stack — the innermost surface stands on top, which is the one
// the reader is actually looking at.
//
// The groups are read through a getter rather than handed in once, so the entries a drawer
// opens always speak for the surface as it stands now: the honoree the reader has turned to,
// not the one that was open when the surface mounted.
let stack = [];

export function registerSurfaceFileGroups(getGroups) {
  stack.push(getGroups);
  return () => {
    stack = stack.filter((entry) => entry !== getGroups);
  };
}

export const surfaceFileGroups = () => {
  const top = stack[stack.length - 1];
  return (top && top()) || [];
};

// The machine's own list, led by the surface's — the work at hand first, the way home after.
export const fileGroupsWith = (machineGroups) => {
  const own = surfaceFileGroups().filter((group) => group.items?.length);
  return own.length ? [...own, ...machineGroups] : machineGroups;
};

export const flatSurfaceFileItems = () =>
  surfaceFileGroups().flatMap((group) => group.items || []);