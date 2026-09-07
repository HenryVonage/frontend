// Shared helpers used by 2+ pages on this site — see also site.css for
// the shared styling this pairs with. Loaded on every page (even ones
// that don't call every helper here) so the convention stays "add it
// once here" instead of "copy it into whichever page needs it next",
// which is exactly the drift pattern a 2026-09 review flagged: the
// phone regex, the email regex, and the QR-render try/catch had each
// been independently retyped into 2+ pages already.

// --- Phone validation (demo.html, music-lovers.html) ---
// Loose E.164 check: leading "+", country code, 7-15 digits total.
// Catches the common mistake of typing a local-format number without a
// country code — not trying to be a full libphonenumber-grade validator.
const INTL_PHONE_RE = /^\+[1-9]\d{6,14}$/;
function isValidInternationalPhone(value) {
  return INTL_PHONE_RE.test(value.replace(/[\s-]/g, ''));
}

// --- Email validation (demo.html's feedback form, music-lovers.html's
// Spotify-tester-request form) ---
// Deliberately simple/permissive — not RFC 5322-complete, just enough to
// catch an obvious typo before a request round-trips to the backend
// (which re-validates regardless; client-side checks are never
// trustworthy alone).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(value) {
  return EMAIL_RE.test(String(value).trim());
}

// --- Greeting fallback (demo.html, music-lovers.html) ---
// The "no name entered yet" greeting, derived from a demo's display
// label the same way in every place that needs one, instead of each
// page separately hand-typing its own copy of the output (which is how
// music-lovers.html's fallback drifted out of sync with this exact
// derivation before the 2026-09 cleanup). Strips any parenthetical
// channel suffix ("Henry's Real Estate (WhatsApp)" -> "Henry's Real
// Estate") and apostrophes (deep-link/QR consumers that mishandle the
// encoded apostrophe are why the named-greeting strings elsewhere are
// apostrophe-free too).
function greetingFallback(label) {
  return `Welcome to ${label.replace(/\s*\([^)]*\)\s*$/, '').replace(/'/g, '')} demo!`;
}

// --- QR rendering (demo.html, music-lovers.html) ---
// Renders a QR code for `url` into `container` (an element, not a
// selector — callers already have the element via getElementById).
// correctLevel L (lowest error-correction, highest data capacity) is
// used site-wide: the qrcodejs library defaults to H, which throws
// "code length overflow" once a long enough URL is encoded (e.g.
// demo.html's officially-generated RCS deep link once a greeting is
// appended) — L still scans reliably on a controlled demo screen, and
// the extra data headroom is worth the small resilience tradeoff.
// Degrades to a text fallback instead of throwing on overflow either
// way, since letting it throw out of a caller's own try block used to
// surface as a wildly misleading unrelated error message.
function renderQrCode(container, url, opts = {}) {
  const {
    width = 220,
    height = 220,
    colorDark = '#10254d',
    errorHtml = '<p style="font-size:13px;color:#b91c1c;padding:8px;">Could not render the QR code (link too long).</p>',
  } = opts;
  container.innerHTML = '';
  try {
    return new QRCode(container, { text: url, width, height, colorDark, colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.L });
  } catch (err) {
    console.error('QR code rendering failed:', err.message);
    container.innerHTML = errorHtml;
    return null;
  }
}
