import React, { useState, useEffect } from 'react';
import { List } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Standing } from '@/entities/Standing';
import { Nominee } from '@/entities/Nominee';
import { format } from 'date-fns';

export default function StandingsView({ seasonId }) {
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [dates, setDates] = useState([]);
  const [standingsByDate, setStandingsByDate] = useState({});

  useEffect(() => {
    if (!seasonId) {
      setLoading(false);
      return;
    }

    const fetchStandings = async () => {
      try {
        setLoading(true);
        // Correctly filter standings by the selected season ID
        const fetchedStandings = await Standing.filter({ season_id: seasonId });
        setStandings(fetchedStandings);

        const uniqueNomineeIds = [...new Set(fetchedStandings.map(s => s.nominee_id))];

        const nomineePromises = uniqueNomineeIds.map(id => Nominee.find(id).catch(err => {
            console.error(`Failed to fetch nominee with ID ${id}:`, err);
            return null;
        }));
        
        const fetchedNominees = (await Promise.all(nomineePromises)).filter(Boolean);

        fetchedNominees.sort((a, b) => a.name.localeCompare(b.name));
        setNominees(fetchedNominees);

        // The date field in Standing entity is `date`, not `standing_date`.
        const uniqueDates = [...new Set(fetchedStandings.map(s => s.date))]
          .sort((a, b) => new Date(a) - new Date(b));
        setDates(uniqueDates);

        const standingsByDateMap = {};
        uniqueDates.forEach(date => {
          standingsByDateMap[date] = fetchedStandings.filter(s => s.date === date);
        });
        setStandingsByDate(standingsByDateMap);

      } catch (error) {
        console.error("Failed to fetch historical standings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [seasonId]);

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (Object.keys(standingsByDate).length === 0) {
    return (
      <div className="text-center py-20 bg-[var(--card)]/50 rounded-lg">
        <List className="mx-auto h-16 w-16 text-[var(--muted)] opacity-50" />
        <h3 className="mt-4 text-xl font-semibold">No Standings Data</h3>
        <p className="mt-1 text-[var(--muted)]">
          Historical standings have not been recorded for this season yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-white/20 shadow-xl rounded-2xl p-4 md:p-6 overflow-x-auto">
      <table className="w-full min-w-[800px] text-sm text-left">
        <thead className="border-b border-white/10">
          <tr>
            <th className="p-3 font-semibold">Nominee</th>
            {dates.map(date => (
              <th key={date} className="p-3 font-semibold text-center w-24">
                {format(new Date(date), 'MMM d')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nominees.map(nominee => (
            <tr key={nominee.id} className="border-b border-white/10 last:border-b-0 hover:bg-white/5">
              <td className="p-3 font-medium">
                <div className="flex items-center gap-3">
                  <img
                    src={nominee.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nominee.name)}&size=32&background=random`}
                    alt={nominee.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span>{nominee.name}</span>
                </div>
              </td>
              {dates.map(date => {
                const standing = standingsByDate[date]?.find(s => s.nominee_id === nominee.id);
                return (
                  <td key={date} className="p-3 text-center">
                    {standing ? (
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-lg">{standing.rank}</span>
                        <span className="text-xs text-[var(--muted)]">
                          {Math.round(standing.starpower_score * 1000)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[var(--muted)]">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}