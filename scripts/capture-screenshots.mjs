import { mkdir, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { spawn } from "node:child_process";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const outputDir = new URL("../docs/screenshots/", import.meta.url);
const pages = [
  ["dashboard", "http://localhost:5173/dashboard"],
  ["products", "http://localhost:5173/products"],
  ["funnel", "http://localhost:5173/funnel"],
  ["traffic", "http://localhost:5173/traffic"],
  ["customers", "http://localhost:5173/customers"]
];

async function cdp(method, params = {}) {
  const id = ++cdp.nextId;
  cdp.socket.send(JSON.stringify({ id, method, params }));

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cdp.pending.delete(id);
      reject(new Error(`CDP timeout: ${method}`));
    }, 10000);

    cdp.pending.set(id, { resolve, reject, timeout });
  });
}

cdp.nextId = 0;
cdp.pending = new Map();

function waitForSocket(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    socket.addEventListener("open", () => resolve(socket));
    socket.addEventListener("error", reject);
  });
}

async function waitForChrome() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:9222/json/list");
      const body = await response.json();
      const page = body.find((target) => target.type === "page");

      if (page?.webSocketDebuggerUrl) {
        return page.webSocketDebuggerUrl;
      }
    } catch {
      await delay(100);
    }
  }

  throw new Error("Chrome remote debugging endpoint did not start");
}

async function waitForSelector(selector) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const result = await cdp("Runtime.evaluate", {
      expression: `Boolean(document.querySelector(${JSON.stringify(selector)}))`,
      returnByValue: true
    });

    if (result.result.value) {
      return;
    }

    await delay(250);
  }

  throw new Error(`Selector did not appear: ${selector}`);
}

async function waitForText(text) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const result = await cdp("Runtime.evaluate", {
      expression: `document.body.innerText.includes(${JSON.stringify(text)})`,
      returnByValue: true
    });

    if (result.result.value) {
      return;
    }

    await delay(250);
  }

  throw new Error(`Text did not appear: ${text}`);
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--remote-debugging-port=9222",
    "--window-size=1440,1100",
    "--user-data-dir=/tmp/ecommerce-dashboard-chrome",
    "about:blank"
  ]);

  try {
    const websocketUrl = await waitForChrome();
    cdp.socket = await waitForSocket(websocketUrl);
    cdp.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      const pending = cdp.pending.get(message.id);

      if (!pending) {
        return;
      }

      clearTimeout(pending.timeout);
      cdp.pending.delete(message.id);

      if (message.error) {
        pending.reject(new Error(message.error.message));
      } else {
        pending.resolve(message.result);
      }
    });

    await cdp("Page.enable");
    await cdp("Runtime.enable");
    await cdp("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1100,
      deviceScaleFactor: 1,
      mobile: false
    });

    await cdp("Page.navigate", { url: "http://localhost:5173/login" });
    await waitForSelector("input[name=email]");
    await cdp("Runtime.evaluate", {
      expression: `
        document.querySelector('input[name=email]').value = 'demo@demo.com';
        document.querySelector('input[name=password]').value = 'demo1234';
        document.querySelector('form').requestSubmit();
      `
    });
    await waitForText("Dashboard");

    for (const [name, url] of pages) {
      await cdp("Page.navigate", { url });
      await waitForText(name === "dashboard" ? "Revenue trend" : name[0].toUpperCase() + name.slice(1));
      await delay(1200);
      const screenshot = await cdp("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false
      });

      await writeFile(new URL(`${name}.png`, outputDir), Buffer.from(screenshot.data, "base64"));
    }
  } finally {
    cdp.socket?.close();
    chrome.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
