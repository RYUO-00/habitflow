// Small helper for calling our backend. credentials:"include" sends the login cookie.
const BASE = import.meta.env.VITE_API_URL || "";
export async function api(path, method = "GET", body) {
  const res = await fetch(BASE + "/api" + path, {
    method, credentials: "include", headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
  return res.json();
}
// Local date as YYYY-MM-DD (avoids timezone bugs from toISOString).
export const ymd = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
