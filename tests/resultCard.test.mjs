import assert from "node:assert/strict";
import test from "node:test";

const resultCardModule = await import("../src/resultCard.mjs").catch(() => null);
const summary = {
  gwa: 1.51,
  courseCount: 8,
  totalUnits: 40,
  totalPoints: 60.5,
  academicStanding: "College Scholar",
};

test("[AC-SCHOLAR1027-F2] share card image includes award, GWA, totals, and theme", () => {
  assert.ok(resultCardModule, "result card helpers are missing");
  const svg = resultCardModule.createShareResultSvg(summary, true);

  assert.match(svg, /width="1200" height="630"/);
  assert.match(svg, /GWA Calculator/);
  assert.match(svg, /College Scholar/);
  assert.match(svg, /ACADEMIC ACHIEVEMENT/);
  assert.match(svg, /font-size="18"[^>]*>ACADEMIC ACHIEVEMENT/);
  assert.match(svg, /<rect x="96" y="142" width="1008" height="118"/);
  assert.match(svg, />1\.5100</);
  assert.match(svg, />8</);
  assert.match(svg, />40</);
  assert.match(svg, />60\.5000</);
  assert.match(svg, /#1E2B4D/);
  assert.match(svg, /#C39A32/);
  assert.match(svg, /<circle cx="1080" cy="70" r="170"/);
});

test("[AC-SCHOLAR1027-E2] result card XML escapes award text and requires a standing", () => {
  assert.ok(resultCardModule, "result card helpers are missing");
  const deanSummary = { ...summary, academicStanding: "Dean's Lister" };
  const svg = resultCardModule.createShareResultSvg(deanSummary, false);

  assert.match(svg, /Dean&apos;s Lister/);
  assert.match(svg, /#D9E2FC/);
  assert.throws(
    () =>
      resultCardModule.createShareResultSvg(
        { ...summary, academicStanding: "" },
        false,
      ),
    /academic standing/i,
  );
});

test("[AC-SCHOLAR1027-E3] SVG converts to a 1200 by 630 PNG before download", async () => {
  assert.ok(resultCardModule, "result card helpers are missing");
  const pngBlob = new Blob(["png-data"], { type: "image/png" });
  const browser = createFakeBrowser(pngBlob);
  const svg = resultCardModule.createShareResultSvg(summary, true);
  const resultBlob = await resultCardModule.createShareResultPng(svg, browser);

  assert.equal(resultBlob, pngBlob);
  assert.equal(browser.canvas.width, 1200);
  assert.equal(browser.canvas.height, 630);
  assert.equal(browser.drawCount, 1);
  assert.deepEqual(browser.revokedUrls, ["blob:1"]);
});

test("[AC-SCHOLAR1027-F2] download creates a named image file and cleans up", () => {
  assert.ok(resultCardModule, "result card helpers are missing");
  const browser = createFakeBrowser(new Blob(["png-data"], { type: "image/png" }));
  const imageBlob = new Blob(["png-data"], { type: "image/png" });

  resultCardModule.downloadPngBlob(
    imageBlob,
    resultCardModule.getResultCardFilename(summary.academicStanding, summary.gwa),
    browser,
  );

  assert.equal(browser.anchor.download, "college-scholar-gwa-1-51.png");
  assert.equal(browser.anchor.clickCount, 1);
  assert.equal(browser.anchor.removeCount, 1);
  assert.deepEqual(browser.revokedUrls, ["blob:1"]);
});

test("[AC-SCHOLAR1027-F4] share uses a file when supported and text as fallback", async () => {
  assert.ok(resultCardModule, "result card helpers are missing");
  const shared = [];
  const browser = {
    File: class FakeFile extends Blob {
      constructor(parts, name, options) {
        super(parts, options);
        this.name = name;
      }
    },
    location: { href: "https://example.test/gwa-calculator" },
    navigator: {
      canShare: ({ files }) => files?.[0]?.type === "image/svg+xml",
      share: async (data) => shared.push(data),
    },
  };

  const result = await resultCardModule.shareResult(summary, true, browser);

  assert.equal(result, "shared");
  assert.equal(shared.length, 1);
  assert.equal(shared[0].files[0].name, "college-scholar-gwa-1-51.svg");
  assert.match(shared[0].text, /College Scholar/);
  assert.match(shared[0].text, /1\.51/);
});

test("[AC-SCHOLAR1027-F4] share falls back to result text and page URL", async () => {
  const shared = [];
  const browser = {
    File: class FakeFile extends Blob {
      constructor(parts, name, options) {
        super(parts, options);
        this.name = name;
      }
    },
    location: { href: "https://example.test/gwa-calculator" },
    navigator: {
      canShare: () => false,
      share: async (data) => shared.push(data),
    },
  };

  const result = await resultCardModule.shareResult(summary, true, browser);

  assert.equal(result, "shared");
  assert.equal(shared.length, 1);
  assert.equal(shared[0].url, browser.location.href);
  assert.equal("files" in shared[0], false);
});

test("[AC-SCHOLAR1027-E4] unsupported device sharing copies a text result when possible", async () => {
  assert.ok(resultCardModule, "result card helpers are missing");
  let copiedText = "";
  const browser = {
    location: { href: "https://example.test/gwa-calculator" },
    navigator: {
      clipboard: {
        writeText: async (value) => {
          copiedText = value;
        },
      },
    },
  };

  const result = await resultCardModule.shareResult(summary, false, browser);

  assert.equal(result, "copied");
  assert.match(copiedText, /College Scholar/);
  assert.match(copiedText, /https:\/\/example\.test\/gwa-calculator/);
});

test("[AC-SCHOLAR1027-E5] sharing reports unsupported when neither share nor clipboard exists", async () => {
  assert.ok(resultCardModule, "result card helpers are missing");
  const browser = {
    location: { href: "https://example.test/gwa-calculator" },
    navigator: {},
  };

  assert.equal(
    await resultCardModule.shareResult(summary, true, browser),
    "unsupported",
  );
});

test("[AC-SCHOLAR1027-E6] failed PNG creation rejects so no completion can be reported", async () => {
  assert.ok(resultCardModule, "result card helpers are missing");
  const browser = createFakeBrowser(null);
  const svg = resultCardModule.createShareResultSvg(summary, true);

  await assert.rejects(
    resultCardModule.createShareResultPng(svg, browser),
    /Could not create the result card image/,
  );
  assert.deepEqual(browser.revokedUrls, ["blob:1"]);
});

const createFakeBrowser = (pngBlob) => {
  const revokedUrls = [];
  let nextUrl = 0;
  let drawCount = 0;
  let anchor;
  let canvas;

  class FakeImage {
    set src(value) {
      this.source = value;
      queueMicrotask(() => this.onload?.());
    }
  }

  const browser = {
    Image: FakeImage,
    URL: {
      createObjectURL: () => `blob:${++nextUrl}`,
      revokeObjectURL: (url) => revokedUrls.push(url),
    },
    document: {
      createElement: (tag) => {
        if (tag === "canvas") {
          canvas = {
            width: 0,
            height: 0,
            getContext: () => ({ drawImage: () => drawCount++ }),
            toBlob: (callback, type) => {
              assert.equal(type, "image/png");
              callback(pngBlob);
            },
          };
          return canvas;
        }
        anchor = {
          clickCount: 0,
          removeCount: 0,
          click() {
            this.clickCount++;
          },
          remove() {
            this.removeCount++;
          },
        };
        return anchor;
      },
      body: { appendChild: () => {} },
    },
    setTimeout: (callback) => {
      callback();
    },
  };

  Object.defineProperties(browser, {
    canvas: { get: () => canvas },
    anchor: { get: () => anchor },
    drawCount: { get: () => drawCount },
    revokedUrls: { get: () => revokedUrls },
  });

  return browser;
};
