# Changelog

## 1.0.3

- The tags of the task form were two empty boxes in the dark theme. Kanboard runs one Select2 in
  the whole application, on that field, and Select2's own sheet paints the chip `#e4e4e4` without
  ever stating a text colour — so the label took the page's ink, at 1.02:1 under this skin and
  2.06:1 under Kanboard's stock dark theme, which does not mention Select2 either. The chip is now
  the pill of the board tags, at 15.4:1 in light and 12.2:1 in dark, and its cross clears AA
  instead of sitting at 2.2:1.
- The suggestion list had the same fault, opening on a hard `white` with no ink of its own. It is
  the skin's menu now, and the line under the cursor takes the accent the other menus use.
- The field also fits a phone: Select2 copies `.tag-autocomplete`'s 400 pixels onto the container
  as an inline width, and `.form-column`, being a flex item, would not shrink under it — the whole
  form scrolled sideways. The chips wrap rather than being clipped.

## 1.0.2

- PluginManager, second pass: the author cell of both plugin tables is painted white whatever the
  theme and carries the page's own text colour — 1.24:1 in dark. Its `--pp-white` token cannot be
  remapped, being white text on coloured fills fourteen times over, so the two rules that use it
  as a *background* are overridden instead.
- Its uninstall button was a pale pink carrying a link, at 1.5:1 — and would have been on the
  stock theme too. It now takes the colour of the action, with the ink that goes with it.

## 1.0.1

- Compatibility with the **PluginManager** plugin. Its stylesheet is written for a light
  interface and is attached to the same hook as this one, after it, so its palette won its
  tokens on a straight tie: its sidebar sat at 2.2:1, its table headers at 1.3:1, and the text
  in its panels at 1.06:1. Its tokens now follow the theme.
- It also reassigned `--color-light`, one of Kanboard's own tokens, without using it anywhere —
  a reassignment that reached the whole application. Put back.

## 1.0.0

First release.

- Card colours become readable: the type colour moves from the text's background to a bar on the
  leading edge, the fill becomes a deep tint in dark and keeps the pastel in light, and tags
  become pills with their own fill and ink. Task tags went from about 1.8:1 to above 7:1.
- The sixteen fills are also separated from one another, measured in CIEDE2000. Red and orange
  went from 7.5 — legible each, indistinguishable together — to 16.7.
- Task text gets a typographic scale, coloured headings, inline code with an ink of its own,
  tinted callouts and code blocks, and accent list markers.
- The application header and the project toolbar stay on screen while the content scrolls, on
  every project view. Two-pane views scroll each pane on its own.
- Quiet scrollbars, in both the standard properties and the WebKit pseudo-elements.
- `contrast.mjs` checks every colour pair the stylesheet paints, and fails the build below the
  WCAG AA line.
