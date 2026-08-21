# Changelog

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
