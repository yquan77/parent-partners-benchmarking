// Thin fetch-based wrapper around the Supabase REST (PostgREST) API.
// No supabase-js dependency needed for something this small.
const Ratings = (() => {
  const { url, anonKey, table } = window.SUPABASE_CONFIG;
  const endpoint = `${url}/rest/v1/${table}`;
  const headers = {
    "apikey": anonKey,
    "Authorization": `Bearer ${anonKey}`,
    "Content-Type": "application/json"
  };

  async function submit(rating) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { ...headers, "Prefer": "return=minimal" },
      body: JSON.stringify({ rating })
    });
    if (!res.ok) throw new Error(`submit failed: ${res.status}`);
    return true;
  }

  async function fetchAll() {
    const res = await fetch(`${endpoint}?select=rating`, { headers });
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    return res.json();
  }

  async function summary() {
    const rows = await fetchAll();
    const count = rows.length;
    const avg = count ? rows.reduce((s, r) => s + r.rating, 0) / count : 0;
    return { count, avg };
  }

  return { submit, summary };
})();
