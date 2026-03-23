import { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { cn } from "@/lib/utils";

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
};

export default function MentionPopover({ 
  isOpen, 
  searchQuery, 
  onSelect, 
  position,
  currentUserEmail 
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && searchQuery !== undefined) {
      setLoading(true);
      User.list()
        .then(allUsers => {
          const filtered = allUsers
            .filter(u => u.email !== currentUserEmail)
            .filter(u => {
              if (!searchQuery) return true;
              const name = (u.full_name || u.email || '').toLowerCase();
              return name.includes(searchQuery.toLowerCase());
            })
            .slice(0, 6);
          setUsers(filtered);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, searchQuery, currentUserEmail]);

  if (!isOpen) return null;

  return (
    <div 
      className="absolute z-50 w-64 rounded-lg shadow-xl overflow-hidden"
      style={{ 
        background: 'white',
        border: `1px solid ${brandColors.navyDeep}15`,
        bottom: position?.bottom || 'calc(100% + 8px)',
        left: position?.left || 0,
      }}
    >
      <div className="px-3 py-2 border-b text-xs font-medium" style={{ borderColor: `${brandColors.navyDeep}10`, color: `${brandColors.navyDeep}60` }}>
        Members matching "{searchQuery || 'all'}"
      </div>
      <div className="max-h-48 overflow-y-auto">
        {loading ? (
          <div className="p-3 text-center text-sm" style={{ color: `${brandColors.navyDeep}50` }}>
            Loading...
          </div>
        ) : users.length === 0 ? (
          <div className="p-3 text-center text-sm" style={{ color: `${brandColors.navyDeep}50` }}>
            No members found
          </div>
        ) : (
          users.map((user, idx) => (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
              )}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold shrink-0"
                style={{ background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.goldPrestige})` }}
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} className="w-8 h-8 rounded-lg object-cover" alt="" />
                ) : (
                  (user.full_name || user.email)?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: brandColors.navyDeep }}>
                  {user.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs truncate" style={{ color: `${brandColors.navyDeep}50` }}>
                  {user.email}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}