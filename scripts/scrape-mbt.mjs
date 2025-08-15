
import fs from "node:fs/promises";
import puppeteer from "puppeteer";

const URL = "https://mc.momah.gov.sa/directory-ar.html";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ABS = (href) => {
  try { return new URL(href, URL).href; } catch { return href || null; }
};
const clean = (t = "") => t.replace(/\s+/g, " ").trim();

const CITY_RX = /(الرياض|جدة|جده|مكة|المدينة|الدمام|الخبر|القطيف|الأحساء|بريدة|عنيزة|تبوك|جازان|حائل|نجران|عسير|الباحة|سكاكا|عرعر|ينبع)/;
const PHONE_RX = /(\+?\d[\d\s\-]{6,}|0\d{8,})/; // loose; picks Saudi 05xxxxxxxx etc.

const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });

try {
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  page.setDefaultNavigationTimeout(120000);

  await page.goto(URL, { waitUntil: "networkidle2" });

  // Prefer clicking the exact tab by href
  await page.evaluate(() => {
    const byHref = document.querySelector("a[href='#ex1-tabs-1']");
    byHref?.click();
  });
  // Fallback: click by text (just in case the site changed)
  await page.evaluate(() => {
    const re = /مزودو\s+أساليب\s+البناء\s+الحديث/;
    const el = Array.from(document.querySelectorAll("a,button,[role='button']")).find((n) => re.test((n.textContent || "").trim()));
    el?.click();
  });
  await sleep(1000);

  // Wait for the tab container
  await page.waitForSelector("#ex1-tabs-1", { timeout: 20000 }).catch(() => {});

  // Scroll to load more cards
  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(650);
  }

  // Extract only rows that look like provider cards (must contain a "الملف التعريفي" link)
  const providers = await page.evaluate(({ CITY_RX_S, PHONE_RX_S, URL }) => {
    const CITY_RX = new RegExp(CITY_RX_S);
    const PHONE_RX = new RegExp(PHONE_RX_S);
    const TABS = document.querySelector("#ex1-tabs-1") || document;

    const nodes = Array.from(
      TABS.querySelectorAll(".row, .provider, .directory-card, .card, li")
    );

    function byText(root, rx) {
      return Array.from(root.querySelectorAll("a,button,span,div,td,th"))
        .find((n) => rx.test((n.textContent || "").trim()));
    }

    function abs(href) {
      try { return new URL(href, URL).href; } catch { return href || null; }
    }

    const out = [];
    for (const el of nodes) {
      const hasProfile = !!byText(el, /الملف\s*التعريفي/);
      if (!hasProfile) continue; // skip non-provider blocks (menus/sections)

      const nameEl = el.querySelector("h1,h2,h3,h4");
      const name = (nameEl ? nameEl.textContent : "").trim();
      if (!name || name.length < 3) continue;

      const txt = (el.textContent || "").replace(/\s+/g, " ").trim();
      const city = (txt.match(CITY_RX) || [])[0] || "KSA";
      const phone = (txt.match(PHONE_RX) || [])[0] || null;

      const profile = Array.from(el.querySelectorAll("a[href]"))
        .find((a) => /الملف\s*التعريفي/.test((a.textContent || "").trim()))?.getAttribute("href") || null;
      const website = Array.from(el.querySelectorAll("a[href^='http']"))
        .map((a) => a.getAttribute("href"))
        .find((h) => h && !/mc\.momah\.gov\.sa\/.*#/.test(h)) || null;

      const logo = el.querySelector("img")?.getAttribute("src") || null;

      out.push({
        name,
        city,
        phone,
        website: website ? abs(website) : null,
        url: profile ? abs(profile) : null,
        logo: logo ? abs(logo) : null,
      });
    }

    // De-dup by name
    const map = new Map();
    for (const p of out) if (!map.has(p.name)) map.set(p.name, p);
    return Array.from(map.values());
  }, { CITY_RX_S: CITY_RX.source, PHONE_RX_S: PHONE_RX.source, URL });

  await fs.mkdir("src/data", { recursive: true });
  await fs.writeFile("src/data/providers.json", JSON.stringify(providers, null, 2), "utf8");
  console.log(`Saved ${providers.length} providers → src/data/providers.json`);
  if (!providers.length) console.warn("⚠️ No providers captured. The site markup may have changed.");
} finally {
  await browser.close();
}
