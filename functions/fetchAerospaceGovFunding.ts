import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const DISCIPLINES = [
  { name: "Space", keywords: ["spacecraft", "satellite", "orbital launch", "space exploration"] },
  { name: "Aviation", keywords: ["commercial aviation", "aircraft maintenance", "aeronautics"] },
  { name: "Defense", keywords: ["unmanned aerial vehicle", "UAV defense", "defense aerospace"] },
  { name: "Engineering", keywords: ["propulsion engineering", "avionics systems", "aerospace engineering"] },
  { name: "Manufacturing", keywords: ["aerospace manufacturing", "aircraft components", "space components"] },
];

async function fetchUSASpendingAwards(keywords) {
  try {
    const res = await fetch("https://api.usaspending.gov/api/v2/search/spending_by_award/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filters: {
          keywords,
          time_period: [{ start_date: "2023-01-01", end_date: "2024-12-31" }],
          award_type_codes: ["A", "B", "C", "D"],
        },
        fields: ["Award Amount", "Recipient Name", "Awarding Agency Name", "Award ID"],
        page: 1,
        limit: 5,
        sort: "Award Amount",
        order: "desc",
      })
    });
    if (!res.ok) return { totalAmount: 0, count: 0, topAwardees: [] };
    const data = await res.json();
    const results = data.results || [];
    const totalAmount = results.reduce((sum, r) => sum + (r["Award Amount"] || 0), 0);
    return {
      totalAmount,
      count: data.page_metadata?.count || data.page_metadata?.total || results.length,
      topAwardees: results.slice(0, 3).map(r => ({
        name: r["Recipient Name"] || "Unknown",
        amount: r["Award Amount"] || 0,
        agency: r["Awarding Agency Name"] || "",
      }))
    };
  } catch (e) {
    return { totalAmount: 0, count: 0, topAwardees: [] };
  }
}

async function fetchNASAPatentCount(term) {
  try {
    const res = await fetch(
      `https://api.nasa.gov/techtransfer/patent/?engine=${encodeURIComponent(term)}&api_key=DEMO_KEY`
    );
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch {
    return 0;
  }
}

Deno.serve(async (req) => {
  try {
    const results = {};
    for (const disc of DISCIPLINES) {
      const [usaData, nasaPatents] = await Promise.all([
        fetchUSASpendingAwards(disc.keywords),
        fetchNASAPatentCount(disc.name),
      ]);
      results[disc.name] = {
        discipline: disc.name,
        usFederalFunding: usaData.totalAmount,
        contractCount: usaData.count,
        topAwardees: usaData.topAwardees,
        nasaPatents,
      };
    }
    return Response.json({ success: true, data: results });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});