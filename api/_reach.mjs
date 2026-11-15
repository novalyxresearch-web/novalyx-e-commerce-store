/* Hostinger Reach (liste e-mail) : ajout d'un contact avec une étiquette.
   Nécessite HOSTINGER_API_TOKEN dans Vercel. Ne lève jamais d'erreur : renvoie "ok" ou la raison de l'échec. */
export const REACH_TAGS = {
  prevenir: "ee24fd2d-d6ef-4c9a-a0c4-8c0ed29ad2a9",   // prevenez-moi-site
  guide: "24b2e7c3-c224-4280-bd66-77e1150cf64b",      // guide-coa
  clients: "76d8a99a-f3d5-48c6-b19a-f83e1f66b6e4",    // clients-nouveaux-lots
};
export async function addToReach(email, note, tag) {
  const token = process.env.HOSTINGER_API_TOKEN;
  if (!token) return "non configuré";
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 8000);
  try {
    const r = await fetch("https://developers.hostinger.com/api/reach/v1/contacts", {
      method: "POST", signal: ctl.signal,
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, note, tag_uuids: [tag] }),
    });
    return r.ok ? "ok" : "http " + r.status;
  } catch (e) { return "erreur " + ((e && e.name) || "?"); } finally { clearTimeout(t); }
}
