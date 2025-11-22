type ScreenerResult = {
  date: string;
  letterSpacing: number;
  lineHeight: number;
  fontWeight: number;
  level: number;
  adjScore: number;
};

const LS_KEY = "vl_screener_results_v1";
const LS_RECOMMEND = "vl_screener_recommend_v1";

type RecommendStore = {
  enabled: boolean;
  letterSpacing: number; // px
  lineHeight: number; // unitless
  fontWeight: number;
};

export function saveResult(result: ScreenerResult) {
  try {
    const existing = loadResults();
    existing.unshift(result);
    // keep last 10
    const trimmed = existing.slice(0, 10);
    localStorage.setItem(LS_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error("Failed to save screener result", e);
  }
}

export function loadResults(): ScreenerResult[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScreenerResult[];
  } catch (e) {
    console.error("Failed to load screener results", e);
    return [];
  }
}

export function clearResults() {
  localStorage.removeItem(LS_KEY);
}

export function setRecommendationEnabled(
  enabled: boolean,
  settings?: {
    letterSpacing?: number;
    lineHeight?: number;
    fontWeight?: number;
  }
) {
  try {
    const store: RecommendStore = {
      enabled,
      letterSpacing: settings?.letterSpacing ?? 0,
      lineHeight: settings?.lineHeight ?? 1.2,
      fontWeight: settings?.fontWeight ?? 400,
    };
    localStorage.setItem(LS_RECOMMEND, JSON.stringify(store));
    applyRecommendations(store);
  } catch (e) {
    console.error("Failed to persist recommendation flag", e);
  }
}

export function getRecommendationStore(): RecommendStore | null {
  try {
    const raw = localStorage.getItem(LS_RECOMMEND);
    if (!raw) return null;
    const obj = JSON.parse(raw) as RecommendStore;
    return obj;
  } catch (e) {
    return null;
  }
}

export function applyRecommendations(store: RecommendStore | boolean) {
  // Applies OpenDyslexic font and spacing globally (html/body), not just reading block.
  try {
    console.debug("[screenerStore] applyRecommendations called with:", store);
    const html = document.documentElement;
    const body = document.body;
    if (!body || !html) return;

    const dysClass = "lexile-open-dyslexic";
    const lfClass = "lexile-line-focus";

    // support being called with boolean (legacy) or store object.
    let storeObj: RecommendStore | null = null;
    if (typeof store === "boolean") {
      // load from storage
      storeObj = getRecommendationStore();
      if (!storeObj) {
        // default
        storeObj = {
          enabled: store,
          letterSpacing: 0,
          lineHeight: 1.2,
          fontWeight: 400,
        };
      }
    } else {
      storeObj = store;
    }

    if (!storeObj.enabled) {
      html.classList.remove(dysClass);
      body.classList.remove(dysClass);
      html.classList.remove(lfClass);
      body.classList.remove(lfClass);
      const styleEl = document.getElementById("lexile-dyslexic-style");
      if (styleEl) styleEl.remove();
      const fontEl = document.getElementById("lexile-dyslexic-font");
      if (fontEl) fontEl.remove();
      // remove css variables
      html.style.removeProperty("--lexile-letter-spacing");
      html.style.removeProperty("--lexile-line-height");
      html.style.removeProperty("--lexile-font-weight");
      // remove inline overrides
      html.style.removeProperty("font-family");
      html.style.removeProperty("letter-spacing");
      html.style.removeProperty("line-height");
      html.style.removeProperty("font-weight");
      body.style.removeProperty("font-family");
      body.style.removeProperty("letter-spacing");
      body.style.removeProperty("line-height");
      body.style.removeProperty("font-weight");
      return;
    }

    // enabled: inject font then apply variables and class
    if (!document.getElementById("lexile-dyslexic-font")) {
      // Try local WOFF2 files first (more reliable offline / blocked-CDN).
      // If local files aren't present or fail to load, fall back to the CDN stylesheet.
      (async () => {
        const fontId = "lexile-dyslexic-font";
        const insertCdn = () => {
          if (document.getElementById(fontId)) return;
          const link = document.createElement("link");
          link.id = fontId;
          link.rel = "stylesheet";
          link.href =
            "https://cdn.jsdelivr.net/gh/antijingoist/open-dyslexic/webkit/OpenDyslexic.css";
          link.onload = () => {
            console.debug("[screenerStore] opendyslexic.css loaded from CDN");
          };
          document.head.appendChild(link);
        };

        // Attempt to load local WOFF2 files using the FontFace API.
        let localLoaded = false;
        try {
          if (typeof (window as any).FontFace === "function") {
            const regular = new (window as any).FontFace(
              "OpenDyslexic",
              "url('/fonts/OpenDyslexic-Regular.woff2') format('woff2')",
              { weight: "400", style: "normal", display: "swap" }
            );
            const bold = new (window as any).FontFace(
              "OpenDyslexic",
              "url('/fonts/OpenDyslexic-Bold.woff2') format('woff2')",
              { weight: "700", style: "normal", display: "swap" }
            );

            try {
              await regular.load();
              (document as any).fonts.add(regular);
              console.debug(
                "[screenerStore] Loaded local OpenDyslexic-Regular.woff2"
              );
              try {
                await bold.load();
                (document as any).fonts.add(bold);
                console.debug(
                  "[screenerStore] Loaded local OpenDyslexic-Bold.woff2"
                );
              } catch (e) {
                // bold may be missing; that's okay
                console.debug("[screenerStore] local bold failed to load", e);
              }
              localLoaded = true;
            } catch (e) {
              console.debug(
                "[screenerStore] local OpenDyslexic-Regular failed to load",
                e
              );
              localLoaded = false;
            }
          }
        } catch (err) {
          console.debug("[screenerStore] FontFace local load error", err);
          localLoaded = false;
        }

        if (!localLoaded) {
          // fallback to CDN stylesheet if local files unavailable
          insertCdn();
        } else {
          // create a tiny marker element so future calls skip loading again
          const marker = document.createElement("meta");
          marker.id = "lexile-dyslexic-font";
          marker.setAttribute("data-source", "local");
          document.head.appendChild(marker);
        }
      })();
    }

    html.classList.add(dysClass);
    body.classList.add(dysClass);
    html.classList.add(lfClass);
    body.classList.add(lfClass);

    // set CSS variables on :root
    // letterSpacing stored in px -> set as px
    html.style.setProperty(
      "--lexile-letter-spacing",
      `${storeObj.letterSpacing}px`
    );
    html.style.setProperty("--lexile-line-height", `${storeObj.lineHeight}`);
    html.style.setProperty("--lexile-font-weight", `${storeObj.fontWeight}`);

    if (!document.getElementById("lexile-dyslexic-style")) {
      const style = document.createElement("style");
      style.id = "lexile-dyslexic-style";
      style.innerHTML = `
          html.lexile-open-dyslexic, body.lexile-open-dyslexic, .lexile-open-dyslexic * {
            font-family: 'OpenDyslexic', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial !important;
            letter-spacing: var(--lexile-letter-spacing, 0.04em) !important;
            line-height: var(--lexile-line-height, 1.6) !important;
            font-weight: var(--lexile-font-weight, 400) !important;
          }
          /* Only apply the line-focus gradient when the OpenDyslexic class is active */
          .lexile-open-dyslexic .lexile-line-focus .bionic-reading,
          .lexile-open-dyslexic .lexile-line-focus p {
            background: linear-gradient(transparent 70%, rgba(255,255,255,0.6) 70%);
          }
        `;
      document.head.appendChild(style);
    }

    // Also set inline styles on html/body to ensure immediate global effect and override
    try {
      const fontFamily =
        "'OpenDyslexic', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";
      // try using setProperty with priority
      html.style.setProperty("font-family", fontFamily, "important");
      body.style.setProperty("font-family", fontFamily, "important");
      // inline letter-spacing and line-height
      html.style.setProperty(
        "letter-spacing",
        `${storeObj.letterSpacing}px`,
        "important"
      );
      html.style.setProperty(
        "line-height",
        `${storeObj.lineHeight}`,
        "important"
      );
      html.style.setProperty(
        "font-weight",
        `${storeObj.fontWeight}`,
        "important"
      );
      body.style.setProperty(
        "letter-spacing",
        `${storeObj.letterSpacing}px`,
        "important"
      );
      body.style.setProperty(
        "line-height",
        `${storeObj.lineHeight}`,
        "important"
      );
      body.style.setProperty(
        "font-weight",
        `${storeObj.fontWeight}`,
        "important"
      );
    } catch (e) {
      // some browsers may ignore 'important' flag in setProperty; fall back to direct assignment
      try {
        html.style.fontFamily =
          "'OpenDyslexic', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";
        body.style.fontFamily =
          "'OpenDyslexic', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";
        html.style.letterSpacing = `${storeObj.letterSpacing}px`;
        html.style.lineHeight = `${storeObj.lineHeight}`;
        html.style.fontWeight = `${storeObj.fontWeight}`;
        body.style.letterSpacing = `${storeObj.letterSpacing}px`;
        body.style.lineHeight = `${storeObj.lineHeight}`;
        body.style.fontWeight = `${storeObj.fontWeight}`;
      } catch (err) {
        console.error("Failed to set inline font styles", err);
      }
    }
    console.debug("[screenerStore] applied css variables", {
      letterSpacing: storeObj.letterSpacing,
      lineHeight: storeObj.lineHeight,
      fontWeight: storeObj.fontWeight,
    });
    console.debug("[screenerStore] inline styles applied to html/body");
  } catch (e) {
    console.error("Failed to apply recommendations", e);
  }
}

export function initRecommendationsFromStore() {
  try {
    const store = getRecommendationStore();
    if (store) applyRecommendations(store);
  } catch (e) {
    console.error(e);
  }
}

export type { ScreenerResult };
