/**
 * UX audit exploration script — captures first-user journey through Forge production.
 */
import { chromium } from "@playwright/test";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const BASE = "https://forge-web-blue-three.vercel.app";
const OUT = join(process.cwd(), "ux-audit-output");

mkdirSync(OUT, { recursive: true });

const journey = [];

function log(step, observation) {
  journey.push({ step, observation, ts: new Date().toISOString() });
  console.log(`\n[${step}] ${observation}`);
}

async function capture(page, name) {
  const path = join(OUT, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function getVisibleText(page) {
  return page.evaluate(() => {
    const nav = [...document.querySelectorAll("nav a, nav button, [role='tablist'] a")].map(
      (el) => el.textContent?.trim()
    );
    const headings = [...document.querySelectorAll("h1, h2, h3")].map(
      (el) => `${el.tagName}: ${el.textContent?.trim()}`
    );
    const buttons = [...document.querySelectorAll("button")].map((el) =>
      el.textContent?.trim().slice(0, 60)
    );
    const links = [...document.querySelectorAll("a[href]")].map((el) =>
      `${el.textContent?.trim()} → ${el.getAttribute("href")}`
    );
    return { nav, headings, buttons: buttons.filter(Boolean), links: links.slice(0, 20) };
  });
}

async function timeToFirstMeaningful(page) {
  const start = Date.now();
  await page.waitForSelector("h1, nav", { timeout: 15000 }).catch(() => null);
  return Date.now() - start;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
  });
  const page = await context.newPage();

  // ── First Launch ──
  log("FIRST_LAUNCH", "Opening home URL with no prior knowledge...");
  const loadMs = await timeToFirstMeaningful(page);
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  const homeText = await getVisibleText(page);
  log("FIRST_LAUNCH", `Load to first content: ~${loadMs}ms`);
  log("FIRST_LAUNCH", `Headings: ${JSON.stringify(homeText.headings)}`);
  log("FIRST_LAUNCH", `Nav items: ${JSON.stringify(homeText.nav)}`);
  await capture(page, "01-dashboard-first");

  // Check for onboarding dialog
  const onboarding = await page.locator("[role='dialog']").count();
  if (onboarding > 0) {
    const dialogText = await page.locator("[role='dialog']").textContent();
    log("ONBOARDING", `Dialog visible: ${dialogText?.slice(0, 300)}`);
    await capture(page, "01b-onboarding");
    const dismiss = page.getByRole("button", { name: /got it|continue|start|close|dismiss/i });
    if (await dismiss.count()) await dismiss.first().click();
  } else {
    log("ONBOARDING", "No onboarding dialog detected on first visit");
  }

  // ── Dashboard deep dive ──
  log("DASHBOARD", "Scanning all visible cards and CTAs...");
  const dashCards = await page.evaluate(() =>
    [...document.querySelectorAll("[class*='Glass'], .rounded-2xl, section")].length
  );
  log("DASHBOARD", `Approx card-like elements: ${dashCards}`);
  const dashButtons = homeText.buttons;
  log("DASHBOARD", `Buttons visible: ${JSON.stringify(dashButtons.slice(0, 15))}`);
  const dashLinks = homeText.links.filter((l) => l.includes("/today"));
  log("DASHBOARD", `Links to Today: ${JSON.stringify(dashLinks)}`);

  // Scroll dashboard
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await capture(page, "02-dashboard-scrolled");

  // ── Today ──
  log("TODAY", "Navigating to Today — beginning daily workflow...");
  const todayNav = page.locator("a[href='/today'], a[href*='today']").first();
  if (await todayNav.count()) {
    await todayNav.click();
  } else {
    await page.goto(`${BASE}/today`, { waitUntil: "networkidle" });
  }
  await page.waitForTimeout(1500);
  const todayText = await getVisibleText(page);
  log("TODAY", `Headings: ${JSON.stringify(todayText.headings)}`);
  await capture(page, "03-today-top");

  // Count interactive elements on Today
  const todayStats = await page.evaluate(() => {
    const sections = [...document.querySelectorAll("[id]")].filter((el) =>
      ["morning", "nutrition", "water", "workout", "habits", "night", "sleep"].includes(el.id)
    );
    const inputs = document.querySelectorAll("input").length;
    const toggles = document.querySelectorAll("button").length;
    const scrollHeight = document.body.scrollHeight;
    return { sectionIds: sections.map((s) => s.id), inputs, toggles, scrollHeight };
  });
  log("TODAY", `Sections: ${JSON.stringify(todayStats.sectionIds)}`);
  log("TODAY", `Inputs: ${todayStats.inputs}, Buttons: ${todayStats.toggles}, Scroll height: ${todayStats.scrollHeight}px`);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await capture(page, "04-today-bottom");

  // Try completing one habit/checklist if present
  const checklistBtn = page.locator("button").filter({ hasText: /.+/ }).first();
  if (await checklistBtn.count()) {
    log("TODAY", "Attempting first checklist/habit tap...");
    await checklistBtn.click().catch(() => {});
    await page.waitForTimeout(500);
  }

  // ── Calendar ──
  log("CALENDAR", "Opening Calendar tab...");
  await page.goto(`${BASE}/calendar`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const calText = await getVisibleText(page);
  log("CALENDAR", `Headings: ${JSON.stringify(calText.headings)}`);
  await capture(page, "05-calendar");

  // Tap a day if grid exists
  const dayCell = page.locator("button").filter({ hasText: /^\d{1,2}$/ }).first();
  if (await dayCell.count()) {
    await dayCell.click();
    await page.waitForTimeout(800);
    const dialog = await page.locator("[role='dialog']").count();
    log("CALENDAR", dialog ? "Day detail dialog opened" : "Day tap — no dialog");
    await capture(page, "05b-calendar-day");
  }

  // ── Progress ──
  log("PROGRESS", "Opening Progress...");
  await page.goto(`${BASE}/progress`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const progText = await getVisibleText(page);
  log("PROGRESS", `Headings: ${JSON.stringify(progText.headings)}`);
  const chartCount = await page.locator("svg").count();
  log("PROGRESS", `Chart/SVG elements: ${chartCount}`);
  await capture(page, "06-progress-top");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await capture(page, "07-progress-bottom");

  // ── Blueprint ──
  log("BLUEPRINT", "Opening Blueprint — would a normal user understand this?");
  await page.goto(`${BASE}/blueprint`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const bpText = await getVisibleText(page);
  log("BLUEPRINT", `Headings: ${JSON.stringify(bpText.headings)}`);
  const accordionCount = await page.locator("[data-state]").count();
  log("BLUEPRINT", `Expandable sections: ~${accordionCount}`);
  await capture(page, "08-blueprint");

  // ── Settings ──
  log("SETTINGS", "Opening Settings...");
  await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const setText = await getVisibleText(page);
  log("SETTINGS", `Headings: ${JSON.stringify(setText.headings)}`);
  log("SETTINGS", `Buttons: ${JSON.stringify(setText.buttons.slice(0, 10))}`);
  await capture(page, "09-settings");

  // ── Navigation inventory ──
  await page.goto(BASE, { waitUntil: "networkidle" });
  const navInventory = await page.evaluate(() => {
    const items = [...document.querySelectorAll("nav a")].map((a) => ({
      label: a.textContent?.trim(),
      href: a.getAttribute("href"),
      active: a.getAttribute("aria-current") === "page" || a.className.includes("active"),
    }));
    return items;
  });
  log("NAV", `Bottom nav: ${JSON.stringify(navInventory, null, 2)}`);

  // Priority list tap test from dashboard
  const priorityLink = page.locator("a[href*='today#']").first();
  if (await priorityLink.count()) {
    await priorityLink.click();
    await page.waitForTimeout(1200);
    const hash = await page.evaluate(() => window.location.hash);
    log("DASHBOARD", `Priority link deep-linked to: ${hash || "no hash"}`);
    await capture(page, "10-priority-deeplink");
  }

  writeFileSync(join(OUT, "journey-log.json"), JSON.stringify(journey, null, 2));
  writeFileSync(
    join(OUT, "page-inventory.json"),
    JSON.stringify({ navInventory, homeText, todayText, calText, progText, bpText, setText, todayStats }, null, 2)
  );

  await browser.close();
  console.log("\n✓ UX audit capture complete → ux-audit-output/");
})();
