#!/usr/bin/env node
/**
 * YJL Radiopaedia Playlist Scraper
 *
 * Fetches YJL 2B Radiopaedia playlists and upserts cases into Convex.
 * Usage:
 *   node scripts/radiopaedia-playlist-scraper.js
 *   node scripts/radiopaedia-playlist-scraper.js 10519 10520
 *
 * Add new playlists to the PLAYLISTS array below.
 */

const { execSync } = require("child_process");

// ─── Playlist Catalog ───────────────────────────────────────────────────────
// Add all YJL 2B playlist IDs and their category names here.
const PLAYLISTS = [
  { id: 10519, name: "YJL 2B Spine",          category: "Spine" },
  // Add more as you discover them:
  // { id: XXXXX, name: "YJL 2B Chest",          category: "Chest" },
  // { id: XXXXX, name: "YJL 2B GI",             category: "GI" },
  // { id: XXXXX, name: "YJL 2B GI Oncology",    category: "GI Oncology" },
  // { id: XXXXX, name: "YJL 2B GU",             category: "GU" },
  // { id: XXXXX, name: "YJL 2B Head and Neck",  category: "Head and Neck" },
  // { id: XXXXX, name: "YJL 2B MSK",            category: "MSK" },
  // { id: XXXXX, name: "YJL 2B Multi-system",   category: "Multi-system" },
  // { id: XXXXX, name: "YJL 2B Neuro",          category: "Neuro" },
  // { id: XXXXX, name: "YJL 2B Nuclear Medicine", category: "Nuclear Medicine" },
  // { id: XXXXX, name: "YJL 2B Pediatrics",     category: "Pediatrics" },
  // { id: XXXXX, name: "YJL 2B Abdominal Trauma", category: "Abdominal Trauma" },
  // { id: XXXXX, name: "YJL 2B Acute Pancreatitis", category: "Acute Pancreatitis" },
  // { id: XXXXX, name: "YJL 2B Colorectal",     category: "Colorectal" },
  // { id: XXXXX, name: "YJL 2B GI Emergencies", category: "GI Emergencies" },
  // { id: XXXXX, name: "YJL 2B HPB",            category: "HPB" },
  // { id: XXXXX, name: "YJL 2B HPB Acute",      category: "HPB Acute" },
  // { id: XXXXX, name: "YJL 2B Upper GI",       category: "Upper GI" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stripHtml(html) {
  return html?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPlaylist(playlistId) {
  const url = `https://radiopaedia.org/play/${playlistId}?lang=gb`;
  console.log(`  Fetching: ${url}`);

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; RadQuiz-Scraper/1.0)",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "en-GB,en;q=0.9",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for playlist ${playlistId}`);
  }

  const html = await res.text();

  // Extract JSON from the hidden data div
  const match = html.match(/<div[^>]+class="hidden data"[^>]*>([\s\S]*?)<\/div>/);
  if (!match) {
    throw new Error(`Could not find hidden data div in playlist ${playlistId}`);
  }

  const data = JSON.parse(match[1].trim());
  return data;
}

function parseCases(data, playlist) {
  const entries = (data.playlist?.entries ?? []).filter((e) => e.type === "Case");

  return entries.map((entry, i) => {
    const item = entry.item ?? {};
    const studyIds = (item.components ?? [])
      .filter((c) => c.type === "Study")
      .map((c) => c.id);

    const discussionComponent = (item.components ?? []).find(
      (c) => c.type === "Discussion"
    );
    const findings = discussionComponent
      ? stripHtml(discussionComponent.body ?? "")
      : "";

    return {
      playlistId: data.playlist.id,
      playlistName: playlist.name,
      playlistCategory: playlist.category,
      sortOrder: i + 1,
      entryId: entry.id,
      radiopaediaCaseId: item.id,
      radiopaediaCaseUrl: item.url ?? "",
      title: entry.title ?? item.name ?? "",
      studyIds,
      presentation: item.presentation?.text ?? "",
      findings,
      top3Differentials: [],
      attribution: item.author?.name ?? "",
    };
  });
}

async function upsertToConvex(cases) {
  const payload = JSON.stringify({ cases });
  // Write to a temp file to avoid shell escaping issues with large payloads
  const fs = require("fs");
  const tmpFile = "/tmp/yjl_scrape_payload.json";
  fs.writeFileSync(tmpFile, payload);

  const result = execSync(
    `npx convex run yjlCases:upsertFromScrape "$(cat ${tmpFile})"`,
    { encoding: "utf8", cwd: process.cwd() }
  );
  return JSON.parse(result.trim());
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Allow passing specific playlist IDs as CLI args
  const cliIds = process.argv.slice(2).map(Number).filter(Boolean);
  const playlists = cliIds.length
    ? PLAYLISTS.filter((p) => cliIds.includes(p.id))
    : PLAYLISTS;

  if (playlists.length === 0) {
    console.error("No matching playlists found. Check your PLAYLISTS array or CLI args.");
    process.exit(1);
  }

  console.log(`Scraping ${playlists.length} playlist(s)...\n`);

  let totalCreated = 0;
  let totalUpdated = 0;
  let totalErrors = 0;

  for (const playlist of playlists) {
    console.log(`▶ [${playlist.category}] ${playlist.name} (ID: ${playlist.id})`);
    try {
      const data = await fetchPlaylist(playlist.id);
      const cases = parseCases(data, playlist);
      console.log(`  Parsed ${cases.length} cases`);

      if (cases.length > 0) {
        const result = await upsertToConvex(cases);
        console.log(`  ✓ Created: ${result.created}, Updated: ${result.updated}`);
        totalCreated += result.created;
        totalUpdated += result.updated;
      }
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
      totalErrors++;
    }

    // Rate limit: 1.5s between requests
    if (playlists.indexOf(playlist) < playlists.length - 1) {
      await sleep(1500);
    }
  }

  console.log(`\n─────────────────────────────`);
  console.log(`Done. Created: ${totalCreated}, Updated: ${totalUpdated}, Errors: ${totalErrors}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
