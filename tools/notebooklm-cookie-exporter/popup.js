// Cookies needed for NotebookLM CLI auth
const CRITICAL_NAMES = new Set([
  "SID", "HSID", "SSID", "APISID", "SAPISID",
  "__Secure-1PSID", "__Secure-3PSID",
  "__Secure-1PAPISID", "__Secure-3PAPISID",
  "__Secure-1PSIDTS", "__Secure-3PSIDTS",
  "SIDCC", "__Secure-1PSIDCC", "__Secure-3PSIDCC",
  "NID", "OSID", "LSID",
]);

document.getElementById("export").addEventListener("click", async () => {
  const status = document.getElementById("status");
  const count = document.getElementById("count");

  try {
    // Get ALL cookies from .google.com and notebooklm.google.com
    const [googleCookies, nlmCookies] = await Promise.all([
      chrome.cookies.getAll({ domain: ".google.com" }),
      chrome.cookies.getAll({ domain: "notebooklm.google.com" }),
    ]);

    // Deduplicate by name+domain+path
    const seen = new Set();
    const all = [];
    for (const c of [...googleCookies, ...nlmCookies]) {
      const key = `${c.name}|${c.domain}|${c.path}`;
      if (!seen.has(key)) {
        seen.add(key);
        all.push(c);
      }
    }

    // Convert to Cookie Editor JSON format (what refresh_notebooklm_auth.py expects)
    const exported = all.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      sameSite: c.sameSite === "unspecified" ? "no_restriction" : c.sameSite,
      expirationDate: c.expirationDate || undefined,
    }));

    // Check which critical cookies we found
    const foundNames = new Set(exported.map((c) => c.name));
    const foundCritical = [...CRITICAL_NAMES].filter((n) => foundNames.has(n));
    const missingCritical = [...CRITICAL_NAMES].filter((n) => !foundNames.has(n));

    // Copy to clipboard
    await navigator.clipboard.writeText(JSON.stringify(exported, null, 2));

    count.textContent = `${exported.length} cookies copied (${foundCritical.length} critical found)`;

    if (missingCritical.length > 0 && missingCritical.length < 5) {
      status.className = "info";
      status.textContent = `Note: missing ${missingCritical.join(", ")} — usually OK`;
    } else {
      status.className = "success";
      status.textContent = "Copied! Paste into refresh_notebooklm_auth.py";
    }
    status.style.display = "block";
  } catch (err) {
    status.className = "error";
    status.textContent = `Error: ${err.message}`;
    status.style.display = "block";
  }
});
