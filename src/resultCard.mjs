const WIDTH = 1200;
const HEIGHT = 630;

const COLORS = {
  dark: {
    background: "#1E2B4D",
    panel: "#1A1F32",
    content: "#DAE2F1",
    muted: "#9DAAC4",
    accent: "#C39A32",
    accentText: "#1A1F32",
    divider: "#39435C",
  },
  light: {
    background: "#D9E2FC",
    panel: "#CDD1E5",
    content: "#0E1625",
    muted: "#46536D",
    accent: "#0234CA",
    accentText: "#FFFFFF",
    divider: "#AEB6CD",
  },
};

const escapeXml = (value) =>
  String(value).replace(/[<>&"']/g, (character) => {
    const entities = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character];
  });

export const getResultCardFilename = (academicStanding, gwa) => {
  const standingSlug = academicStanding
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const gwaSlug = Number(gwa).toFixed(2).replace(".", "-");
  return `${standingSlug}-gwa-${gwaSlug}.png`;
};

export const createShareResultSvg = (summary, isDark) => {
  if (!summary.academicStanding) {
    throw new Error("An academic standing is required to create a result card.");
  }

  const colors = COLORS[isDark ? "dark" : "light"];
  const standing = escapeXml(summary.academicStanding);
  const gwa = Number(summary.gwa).toFixed(4);
  const courseCount = escapeXml(summary.courseCount.toLocaleString());
  const totalUnits = escapeXml(summary.totalUnits.toLocaleString());
  const totalPoints = Number(summary.totalPoints).toFixed(4);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${colors.background}" />
  <circle cx="1080" cy="70" r="170" fill="${colors.accent}" opacity="0.08" />
  <rect x="48" y="36" width="1104" height="558" rx="30" fill="${colors.panel}" />
  <text x="96" y="104" fill="${colors.content}" font-family="Outfit, Arial, sans-serif" font-size="28" font-weight="700">GWA Calculator</text>
  <rect x="96" y="142" width="1008" height="118" rx="18" fill="${colors.accent}" />
  <text x="126" y="183" fill="${colors.accentText}" font-family="Outfit, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="1">ACADEMIC ACHIEVEMENT</text>
  <text x="126" y="238" fill="${colors.accentText}" font-family="Outfit, Arial, sans-serif" font-size="48" font-weight="700">${standing}</text>
  <text x="96" y="388" fill="${colors.content}" font-family="Outfit, Arial, sans-serif" font-size="132" font-weight="700" letter-spacing="-4">${gwa}</text>
  <text x="102" y="430" fill="${colors.muted}" font-family="Outfit, Arial, sans-serif" font-size="18" letter-spacing="1.1">GENERAL WEIGHTED AVERAGE</text>
  <line x1="96" y1="466" x2="1104" y2="466" stroke="${colors.divider}" stroke-width="2" />
  <text x="100" y="510" fill="${colors.muted}" font-family="Outfit, Arial, sans-serif" font-size="18">Total courses</text>
  <text x="100" y="556" fill="${colors.content}" font-family="Outfit, Arial, sans-serif" font-size="34" font-weight="700">${courseCount}</text>
  <line x1="420" y1="492" x2="420" y2="562" stroke="${colors.divider}" stroke-width="2" />
  <text x="458" y="510" fill="${colors.muted}" font-family="Outfit, Arial, sans-serif" font-size="18">Total units</text>
  <text x="458" y="556" fill="${colors.content}" font-family="Outfit, Arial, sans-serif" font-size="34" font-weight="700">${totalUnits}</text>
  <line x1="770" y1="492" x2="770" y2="562" stroke="${colors.divider}" stroke-width="2" />
  <text x="808" y="510" fill="${colors.muted}" font-family="Outfit, Arial, sans-serif" font-size="18">Total points</text>
  <text x="808" y="556" fill="${colors.content}" font-family="Outfit, Arial, sans-serif" font-size="34" font-weight="700">${totalPoints}</text>
</svg>`;
};

export const createShareResultPng = async (svg, browser = globalThis.window) => {
  if (!browser) throw new Error("Image download is only available in a browser.");

  const svgUrl = browser.URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
  );

  try {
    const image = await new Promise((resolve, reject) => {
      const element = new browser.Image();
      element.onload = () => resolve(element);
      element.onerror = () =>
        reject(new Error("Could not load the result card image."));
      element.src = svgUrl;
    });

    const canvas = browser.document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare the result card image.");

    context.drawImage(image, 0, 0, WIDTH, HEIGHT);
    const png = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!png) throw new Error("Could not create the result card image.");
    return png;
  } finally {
    browser.URL.revokeObjectURL(svgUrl);
  }
};

export const downloadPngBlob = (blob, filename, browser = globalThis.window) => {
  if (!browser) throw new Error("Image download is only available in a browser.");

  const imageUrl = browser.URL.createObjectURL(blob);
  let cleanupScheduled = false;
  try {
    const link = browser.document.createElement("a");
    link.href = imageUrl;
    link.download = filename;
    link.hidden = true;
    browser.document.body.appendChild(link);
    try {
      link.click();
    } finally {
      link.remove();
    }
    browser.setTimeout(() => browser.URL.revokeObjectURL(imageUrl), 1000);
    cleanupScheduled = true;
  } finally {
    if (!cleanupScheduled) browser.URL.revokeObjectURL(imageUrl);
  }
};

export const shareResult = async (
  summary,
  isDark,
  browser = globalThis.window,
) => {
  if (!browser) return "unsupported";

  const gwa = Number(summary.gwa).toFixed(4);
  const title = `My ${summary.academicStanding} achievement`;
  const text = `I earned ${summary.academicStanding} with a GWA of ${gwa} in the GWA Calculator.`;
  const url = browser.location.href;
  const navigator = browser.navigator;

  if (navigator.share) {
    const svg = createShareResultSvg(summary, isDark);
    const file = browser.File
      ? new browser.File(
          [svg],
          getResultCardFilename(summary.academicStanding, summary.gwa).replace(
            /\.png$/,
            ".svg",
          ),
          { type: "image/svg+xml" },
        )
      : undefined;

    if (file && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title, text });
    } else {
      await navigator.share({ title, text, url });
    }
    return "shared";
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(`${text} ${url}`);
    return "copied";
  }

  return "unsupported";
};
