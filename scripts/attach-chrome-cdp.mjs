/**
 * Attach Playwright to an already-running Chrome via CDP (cheapest option).
 *
 * 1. Start Chrome with remote debugging (separate profile recommended):
 *    macOS:
 *      /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
 *        --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-cdp
 *    Linux:
 *      google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-cdp
 *    Windows:
 *      chrome.exe --remote-debugging-port=9222 --user-data-dir=%TEMP%\chrome-cdp
 *
 * 2. Run this script:
 *      npm run chrome:attach
 *      npm run chrome:attach -- --url https://example.com
 *      npm run chrome:attach -- --url https://example.com --screenshot /tmp/shot.png
 *
 * Env:
 *   CDP_URL  default http://127.0.0.1:9222
 */

import { chromium } from "playwright";
import process from "node:process";

function usage() {
  console.log(`Usage: npm run chrome:attach -- [options]

Options:
  --cdp <url>         CDP endpoint (default: $CDP_URL or http://127.0.0.1:9222)
  --url <url>         Navigate the active tab to this URL
  --screenshot <path> Save a screenshot of the active tab
  --title             Print the active tab title
  --help              Show this help

Does not close your Chrome when the script exits.`);
}

function parseArgs(argv) {
  const opts = {
    cdp: process.env.CDP_URL || "http://127.0.0.1:9222",
    url: null,
    screenshot: null,
    title: false,
    help: false,
  };

  const takeValue = (flag, i) => {
    const value = argv[i + 1];
    if (value == null || value.startsWith("--")) {
      throw new Error(`${flag} requires a value`);
    }
    return value;
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      opts.help = true;
    } else if (arg === "--cdp") {
      opts.cdp = takeValue(arg, i);
      i++;
    } else if (arg === "--url") {
      opts.url = takeValue(arg, i);
      i++;
    } else if (arg === "--screenshot") {
      opts.screenshot = takeValue(arg, i);
      i++;
    } else if (arg === "--title") {
      opts.title = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return opts;
}

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    usage();
    process.exit(1);
  }

  if (opts.help) {
    usage();
    process.exit(0);
  }

  let browser;
  try {
    browser = await chromium.connectOverCDP(opts.cdp);
  } catch (err) {
    console.error(
      `Failed to connect to Chrome at ${opts.cdp}.\n` +
        `Start Chrome with --remote-debugging-port=9222 first.\n` +
        `Detail: ${err.message}`
    );
    process.exit(1);
  }

  try {
    const context = browser.contexts()[0] ?? (await browser.newContext());
    const page = context.pages()[0] ?? (await context.newPage());

    console.log(`Connected to ${opts.cdp}`);
    console.log(`Active tab: ${page.url() || "(blank)"}`);

    if (opts.url) {
      console.log(`Navigating to ${opts.url}`);
      await page.goto(opts.url, { waitUntil: "domcontentloaded" });
    }

    if (opts.title || opts.url) {
      const title = await page.title();
      console.log(`Title: ${title}`);
    }

    if (opts.screenshot) {
      await page.screenshot({ path: opts.screenshot, fullPage: true });
      console.log(`Screenshot: ${opts.screenshot}`);
    }

    if (!opts.url && !opts.screenshot && !opts.title) {
      console.log(
        "Attached. Pass --url, --screenshot, and/or --title to drive the tab."
      );
    }
  } finally {
    // Disconnect Playwright only — leave the user's Chrome running.
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
