// Small fetch-based wrapper for the single-row `current_slide` table.
// Writes are queued so rapid navigation cannot leave an older request as
// the final value. The deck never awaits this queue, so navigation stays fast.
window.SlideSync = (() => {
  const { url, anonKey } = window.SUPABASE_CONFIG;
  const endpoint = `${url}/rest/v1/current_slide`;
  const headers = {
    "apikey": anonKey,
    "Authorization": `Bearer ${anonKey}`,
    "Content-Type": "application/json"
  };
  let writeQueue = Promise.resolve();

  async function write(slideIndex) {
    const res = await fetch(`${endpoint}?id=eq.1`, {
      method: "PATCH",
      headers: { ...headers, "Prefer": "return=minimal" },
      body: JSON.stringify({
        slide_index: slideIndex,
        updated_at: new Date().toISOString()
      })
    });
    if (!res.ok) throw new Error(`slide sync failed: ${res.status}`);
  }

  function update(slideIndex) {
    writeQueue = writeQueue.catch(() => {}).then(() => write(slideIndex));
    return writeQueue;
  }

  async function current() {
    const query = "?select=slide_index,updated_at&id=eq.1&limit=1";
    const res = await fetch(`${endpoint}${query}`, {
      headers,
      cache: "no-store"
    });
    if (!res.ok) throw new Error(`slide fetch failed: ${res.status}`);
    const rows = await res.json();
    if (!rows.length) throw new Error("current_slide row is missing");
    return rows[0];
  }

  return { update, current };
})();
