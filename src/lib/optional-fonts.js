const FONT_ID = 'hrs-optional-fonts';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Display:wght@400;500;600;700;800;900&family=Noto+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap';

export function scheduleOptionalFonts(doc = document, frame = callback => window.requestAnimationFrame(callback)) {
  // Two frames give the already-rendered website a paint before optional CSS is fetched.
  const load = () => {
    try {
      if (doc.getElementById(FONT_ID)) return;
      const link = doc.createElement('link');
      link.id = FONT_ID;
      link.rel = 'stylesheet';
      link.href = FONT_URL;
      doc.head.appendChild(link);
    } catch { /* System fonts remain usable if optional font loading is unavailable. */ }
  };
  try { frame(() => { try { frame(load); } catch { /* Keep the system font. */ } }); }
  catch { /* Keep the system font. */ }
}
