import { useEffect, useRef } from 'react';
import { LayoutGrid } from 'lucide-react';
import { registerSurfaceEditGroups } from '@/components/shell/surfaceFileMenu';

// The admin portal's own Edit menu entry.
//
// The portal gives its whole head to the section being read on a phone: no breadcrumb
// bar, no hamburger. The way between sections lives in the machine's Edit menu instead,
// so an operator is never more than one press from the index of the building.
export default function useAdminSectionsMenu({ enabled = true, onOpenSections }) {
  const groupsRef = useRef([]);
  groupsRef.current = onOpenSections
    ? [
        {
          key: 'admin-sections',
          label: 'Mission Control',
          items: [
            {
              key: 'open-sections',
              label: 'All sections',
              icon: LayoutGrid,
              onSelect: onOpenSections,
            },
          ],
        },
      ]
    : [];

  useEffect(() => {
    if (!enabled) return undefined;
    return registerSurfaceEditGroups(() => groupsRef.current);
  }, [enabled]);
}