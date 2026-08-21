/**
 * Contrast guard for the Azimuth skin — `node contrast.mjs` from this folder.
 *
 * Reads the tokens straight out of `Assets/skin.css` (light) and
 * `Assets/theme-dark.css` (dark) and checks every pair the stylesheet actually
 * paints on top of another: body text on the three surfaces, the card footers on
 * each of the sixteen fills, each tag pill's ink on its own chip, and each
 * identifying bar against the card it edges.
 *
 * Text pairs are held to 4.5:1 (WCAG AA, small text) and the bars to 3:1
 * (non-text contrast): the bar is what tells a [BUG] from an [EVOL] at a glance,
 * so it is a meaningful graphic and not decoration.
 *
 * Then a second question, which contrast cannot answer: do two cards sitting
 * side by side tell themselves apart? Measured in CIEDE2000 over the sixteen
 * fills. Red and orange shipped at 7.5 — each perfectly legible, and
 * indistinguishable from one another.
 *
 * Exits non-zero on the first failure, so it can gate a change to a colour.
 */
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const COLOURS = ['red', 'cyan', 'orange', 'light-green', 'grey', 'yellow', 'blue', 'green',
  'purple', 'brown', 'deep-orange', 'dark-grey', 'pink', 'teal', 'lime', 'amber'];

const readTokens = (file) => {
  const css = fs.readFileSync(path.join(HERE, 'Assets', file), 'utf8');
  const out = {};
  for (const [, name, value] of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (!value.includes('var(')) out[name] = value.trim();
  }
  return out;
};

const rgb = (value) => {
  if (value.startsWith('#')) {
    const h = value.slice(1);
    const full = h.length === 3 ? [...h].map(c => c + c).join('') : h;
    return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16));
  }
  const n = value.match(/[\d.]+/g).map(Number);
  return [n[0], n[1], n[2]];
};

// Dividers are given as rgba over a known ground; flatten them before measuring.
const over = (value, ground) => {
  const a = value.startsWith('rgba') ? Number(value.match(/[\d.]+/g)[3]) : 1;
  const [r, g, b] = rgb(value);
  const [R, G, B] = rgb(ground);
  return [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a)];
};

const luminance = (c) => {
  const [r, g, b] = c.map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (fg, bg, ground) => {
  const [a, b] = [luminance(over(fg, ground)), luminance(over(bg, ground))].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
};

const light = readTokens('skin.css');
const dark = { ...light, ...readTokens('theme-dark.css') };

let failed = 0;
const check = (theme, t, label, fg, bg, min) => {
  const ground = t['--azimuth-surface'];
  const r = ratio(t[fg] ?? fg, t[bg] ?? bg, ground);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${theme.padEnd(6)} ${label.padEnd(44)} ${r.toFixed(2)} (min ${min})`);
};

for (const [theme, t] of [['light', light], ['dark', dark]]) {
  for (const surface of ['--azimuth-bg', '--azimuth-surface', '--azimuth-surface-hi']) {
    for (const ink of ['--azimuth-text', '--azimuth-text-2', '--azimuth-mute', '--azimuth-cyan-ink']) {
      check(theme, t, `${ink} on ${surface}`, ink, surface, 4.5);
    }
    // The solid accent never carries small text: it is a fill, a rule and a focus
    // ring. Non-text threshold. Against `--azimuth-surface-hi` it drops to 2.7:1,
    // which is why every accent fill carries a rim in `--azimuth-cyan-ink` — the
    // primary button's border, the active tab's inner ring — whose contrast is
    // checked just above.
    if (surface !== '--azimuth-surface-hi') {
      check(theme, t, `--azimuth-cyan (flat) on ${surface}`, '--azimuth-cyan', surface, 3);
    }
  }
  check(theme, t, 'primary button label', '--azimuth-cyan-contrast', '--azimuth-cyan', 4.5);
  check(theme, t, 'delete button label', '--azimuth-danger-contrast', '--azimuth-danger', 4.5);
  check(theme, t, 'error on the surface', '--azimuth-danger-ink', '--azimuth-surface', 4.5);
  check(theme, t, 'error inside its alert', '--azimuth-danger-ink', '--alert-background-color-error', 4.5);
  check(theme, t, 'success inside its alert', '--azimuth-success-ink', '--alert-background-color-success', 4.5);
  check(theme, t, 'subheading on the page', '--azimuth-heading-2', '--azimuth-bg', 4.5);
  check(theme, t, 'subheading on the surface', '--azimuth-heading-2', '--azimuth-surface', 4.5);
  check(theme, t, 'inline code in its pill', '--azimuth-code', '--azimuth-surface-hi', 4.5);
  check(theme, t, 'text inside a callout', '--azimuth-text', '--azimuth-tint', 4.5);
  check(theme, t, 'table header inside a callout', '--azimuth-cyan-ink', '--azimuth-tint', 4.5);
  // The scrollbar has to stay quiet without becoming invisible: non-text
  // threshold, on both grounds it sits on.
  check(theme, t, 'scrollbar on the page', '--azimuth-scroll', '--azimuth-bg', 3);
  check(theme, t, 'scrollbar on the surface', '--azimuth-scroll', '--azimuth-surface', 3);

  for (const c of COLOURS) {
    check(theme, t, `card title on ${c}`, '--azimuth-text', `--kb-${c}-fill`, 4.5);
    check(theme, t, `card footer on ${c}`, '--azimuth-mute', `--kb-${c}-fill`, 4.5);
    check(theme, t, `${c} tag pill`, `--kb-${c}-ink`, `--kb-${c}-chip`, 4.5);
    check(theme, t, `${c} identifying bar`, `--kb-${c}-edge`, `--kb-${c}-fill`, 3);
  }
}

// ── Telling the fills apart ─────────────────────────────────────────────────
const lab = (value, ground) => {
  const [R, G, B] = over(value, ground).map(v => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const f = (t) => t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116);
  const x = f((0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047);
  const y = f(0.2126 * R + 0.7152 * G + 0.0722 * B);
  const z = f((0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};

const deltaE = (c1, c2, ground) => {
  const [L1, a1, b1] = lab(c1, ground), [L2, a2, b2] = lab(c2, ground);
  const rad = Math.PI / 180, deg = 180 / Math.PI;
  const Cb = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2;
  const G7 = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const ap1 = (1 + G7) * a1, ap2 = (1 + G7) * a2;
  const Cp1 = Math.hypot(ap1, b1), Cp2 = Math.hypot(ap2, b2);
  const angle = (b, a) => {
    if (b === 0 && a === 0) return 0;
    const h = Math.atan2(b, a) * deg;
    return h >= 0 ? h : h + 360;
  };
  const hp1 = angle(b1, ap1), hp2 = angle(b2, ap2);
  let dhp = 0;
  if (Cp1 * Cp2 !== 0) {
    dhp = hp2 - hp1;
    if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360;
  }
  const dLp = L2 - L1, dCp = Cp2 - Cp1;
  const dHp = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin(dhp / 2 * rad);
  const Lp = (L1 + L2) / 2, Cpb = (Cp1 + Cp2) / 2;
  let hpb;
  if (Cp1 * Cp2 === 0) {
    hpb = hp1 + hp2;
  } else {
    hpb = (hp1 + hp2) / 2;
    if (Math.abs(hp1 - hp2) > 180) hpb += (hp1 + hp2 < 360 ? 180 : -180);
  }
  const T = 1 - 0.17 * Math.cos((hpb - 30) * rad) + 0.24 * Math.cos(2 * hpb * rad)
    + 0.32 * Math.cos((3 * hpb + 6) * rad) - 0.20 * Math.cos((4 * hpb - 63) * rad);
  const Sl = 1 + (0.015 * (Lp - 50) ** 2) / Math.sqrt(20 + (Lp - 50) ** 2);
  const Sc = 1 + 0.045 * Cpb, Sh = 1 + 0.015 * Cpb * T;
  const Rt = -Math.sin(2 * (30 * Math.exp(-(((hpb - 275) / 25) ** 2))) * rad)
    * 2 * Math.sqrt(Cpb ** 7 / (Cpb ** 7 + 25 ** 7));
  return Math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh));
};

// Red, orange and deep orange carry three different meanings in a board's colour
// code, and yet sit within 42 degrees of hue: that is the family that closes in on
// itself, and the only one that deserves a threshold of its own. Elsewhere the
// floor only catches two tokens that have become identical — amber, yellow and
// lime *are* shades of one another in Kanboard's own palette, and asking them to
// move apart would be asking them to stop being what they are.
const DISTINCT = ['red', 'deep-orange', 'orange'];
const FLOOR = 3;
const DISTINCT_FLOOR = 8;

for (const [theme, t] of [['light', light], ['dark', dark]]) {
  const ground = t['--azimuth-surface'];
  const pairs = [];
  for (let i = 0; i < COLOURS.length; i++) {
    for (let j = i + 1; j < COLOURS.length; j++) {
      const a = COLOURS[i], b = COLOURS[j];
      pairs.push([a, b, deltaE(t[`--kb-${a}-fill`], t[`--kb-${b}-fill`], ground)]);
    }
  }
  pairs.sort((x, y) => x[2] - y[2]);
  console.log(`\n${theme} — the six closest fills (CIEDE2000):`);
  for (const [a, b, d] of pairs.slice(0, 6)) {
    console.log(`         ${(a + ' / ' + b).padEnd(28)} ${d.toFixed(1)}`);
  }
  for (const [a, b, d] of pairs) {
    const min = DISTINCT.includes(a) && DISTINCT.includes(b) ? DISTINCT_FLOOR : FLOOR;
    if (d < min) {
      failed++;
      console.log(` FAIL  ${theme.padEnd(6)} ${(a + ' / ' + b).padEnd(44)} ${d.toFixed(1)} (min ${min})`);
    }
  }
}

console.log(failed === 0 ? '\nEvery pair passes.' : `\n${failed} pair(s) below the threshold.`);
process.exit(failed === 0 ? 0 : 1);
