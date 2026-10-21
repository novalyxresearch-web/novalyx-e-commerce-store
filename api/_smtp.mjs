/* Envoi d'email en SMTP (helper partagé par /api/notify et /api/review ; pas une route : le préfixe _ l'exclut de Vercel). */
import tls from "node:tls";

/* ── Envoi d'email en SMTP (TLS direct, port 465), sans dépendance externe ── */
const b64 = (s) => Buffer.from(s, "utf8").toString("base64");
const encHeader = (s) => /^[\x20-\x7E]*$/.test(s) ? s : "=?UTF-8?B?" + b64(s) + "?=";
function buildMessage({ from, fromName, to, replyTo, subject, text }) {
  const body = b64(text.replace(/\r?\n/g, "\r\n")).replace(/.{1,76}/g, "$&\r\n");
  const domain = from.split("@")[1] || "localhost";
  return [
    `From: ${encHeader(fromName)} <${from}>`,
    `To: <${to}>`,
    replyTo ? `Reply-To: <${replyTo}>` : null,
    `Subject: ${encHeader(subject)}`,
    `Date: ${new Date().toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: <${Date.now().toString(36)}.${Math.random().toString(36).slice(2)}@${domain}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    body,
  ].filter((l) => l !== null).join("\r\n");
}
export function smtpSend(cfg, mails, connect = tls.connect) {
  return new Promise((resolve, reject) => {
    const sock = connect({ host: cfg.host, port: cfg.port, servername: cfg.host });
    let buf = "", waiting = null, done = false;
    const fail = (e) => { if (done) return; done = true; try { sock.destroy(); } catch (x) {} reject(e instanceof Error ? e : new Error(String(e))); };
    const timer = setTimeout(() => fail(new Error("délai SMTP dépassé")), 20000);
    sock.setEncoding("utf8");
    sock.on("error", fail);
    sock.on("data", (d) => {
      buf += d;
      let m;
      while ((m = buf.match(/^(\d{3})([ -])(.*)\r?\n/m)) && waiting) {
        const idx = buf.indexOf(m[0]); buf = buf.slice(idx + m[0].length);
        if (m[2] === " ") { const w = waiting; waiting = null; w(Number(m[1]), m[3]); }
      }
    });
    const expect = (codes) => new Promise((res, rej) => { waiting = (code, msg) => codes.includes(code) ? res(code) : rej(new Error("SMTP " + code + " " + msg)); if (buf) sock.emit("data", ""); });
    const cmd = (line, codes) => { const p = expect(codes); sock.write(line + "\r\n"); return p; };
    (async () => {
      await expect([220]);
      await cmd("EHLO novalyxresearch.com", [250]);
      await cmd("AUTH LOGIN", [334]);
      await cmd(b64(cfg.user), [334]);
      await cmd(b64(cfg.pass), [235]);
      for (const m of mails) {
        await cmd(`MAIL FROM:<${cfg.user}>`, [250]);
        await cmd(`RCPT TO:<${m.to}>`, [250, 251]);
        await cmd("DATA", [354]);
        await cmd(buildMessage({ ...m, from: cfg.user }) + "\r\n.", [250]);
      }
      sock.write("QUIT\r\n");
      done = true; clearTimeout(timer); sock.end(); resolve();
    })().catch((e) => { clearTimeout(timer); fail(e); });
  });
}
