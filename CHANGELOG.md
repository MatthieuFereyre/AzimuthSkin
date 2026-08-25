# Changelog

## Unreleased

### The stylesheet is nine sheets

- `skin.css` had reached 2 116 lines across twenty-five sections, and its zones had stopped having
  much to say to each other. It is now nine sheets — tokens, base, chrome, board, task, controls,
  colours, narrow, plugin-manager — registered in that order in `Plugin.php`, because
  `Hook::on()` appends and Kanboard renders the listeners in registration order.
- They are **contiguous slices**, cut at section boundaries and never reordered. That is the whole
  point: several rules here win on nothing but document order — the phone media query over the
  tablet one, `:root:root` over PluginManager's named rules, the segmented control over Kanboard's
  stacked tabs. A domain-shaped split would have reordered them and changed which rule wins,
  silently. Cutting contiguously makes the cascade identical *by construction*, and provable: the
  concatenation of the nine in load order reproduces the old file byte for byte, 71 747 characters.
  Verified again afterwards by diffing the computed styles of every element on six pages at two
  widths — 9 700 elements, sixty properties each, no difference.
- `contrast.mjs` no longer reads a named sheet. It walks `Assets/` instead: naming `tokens.css`
  would have made the guard go quiet the day a token moved.
- The deployment check no longer compares three named files. It enumerates everything committed,
  and asserts that every sheet named in `Plugin.php` is on disk. Naming files had already made it
  stop covering the change: `Locale/` was added and never looked at.

- The plugin description was one paragraph of 819 characters listing seven features in a row — the
  changelog, not a description. Three sentences now, 223 characters. Measured by substituting the
  text into the live tables of Settings > Plugins: the directory table, which is the one that
  showed the fault, goes from five lines to **two** at 1400px (a row of 148px down to 70) and from
  four lines to **one** at 1920px. The installed-plugins table keeps the height it already had —
  3.4 lines, a 70px row — because its description column is far narrower; the gain there is that
  three readable sentences replace a list of seven features at the same cost.
- The plugin speaks French. `getPluginDescription()` was already wrapped in `t()` — which most
  plugins do not bother with, Kanboard's own Slack plugin included — so all that was missing was a
  `Locale` folder and the `onStartup()` that loads it. It is the only string the application ever
  prints: a stylesheet has no words of its own. `plugins.json`, which feeds the directory on
  kanboard.org, is a static file in someone else's repository and stays English.
- The same short description still has to reach `plugins.json`, which means a pull request on
  `kanboard/website`. Not opened yet, on purpose.

### Narrow screens

- The board's own mobile rule had never once applied. This block asked for `width: 240px` on a
  bare `#board th.board-column-header`, which the skin's own base rule beat on specificity —
  (1,3,1) against (1,1,1), because of the two `:not()` that were added to beat Kanboard. Columns
  stayed 268px wide on a phone and 1.27 of one fitted on screen. They are `86vw` now, one at a
  time, and the container snaps to them — `proximity` rather than `mandatory`, so a card being
  dragged towards the next column does not fight the snap.
- Tables written in a description or a comment were **cut**, not scrolled. Kanboard sets
  `overflow-x: hidden` on the body, so anything wider than its column is simply unreachable:
  measured at 390 points, a task page was 457 wide, 67 of them past the edge with no way to get
  there. Kanboard's own `table.table-scrolling` only reaches the tables it puts that class on, and
  Markdown's do not carry it.
- The controls that are the only way into an action — a column's menu, a card's menu, the add
  button, the view tabs — were 15 points tall. They are 40 now. The icons in a card's footer are
  deliberately left alone: 25 points on every card costs more than it returns on a phone.
- The header no longer floors its title and project selector at 300 points each, which was making
  the shell take 21% of a 390-point screen before the first card.
- The override of Kanboard's stacked view tabs is now written down as an override. It was already
  there, winning a specificity tie on load order alone, and an override nobody wrote down is
  indistinguishable from a bug.

### PluginManager, third pass

- Its icons are 69 images delivered as `content: url("data:image/svg+xml,…")` with the fills baked
  into the paths — `fill='currentColor'` on the root does nothing, a replaced image inherits no
  colour. No custom property describes them, so no remap reaches them. Measured on the rendered
  pixels, over 40 of them: a median of 2.75:1 against the dark page, a minimum of 1.15:1, and 23
  below the 3:1 non-text line — one of them the Plugins entry of the user menu, plain black. A
  filter carried by a token takes them to a median of 8.67:1, a minimum of 5.40:1, and none below
  the line. The measurement matters as much as the fix: the elements' own `color` and `border` all
  passed while the images did not, and only sampling pixels showed it.
- Its page titles, its sidebar hover and its active count were `#B71234` — 2.75:1 on the dark page,
  against the 4.5:1 AA asks of body text. They take the danger ink.
- Its install button carried a 2px `#FF6500` border and a 3px radius, 141 times on the directory
  page alone. Not a contrast failure; a shape that belonged to another interface.
- The manual-plugins page was framed in `#D50000` twelve times over — the fieldset, the URL field,
  every edge of the table. Both that token and the orange are double-edged in the way `--pp-white`
  was in 1.0.2: remapped for the role they mostly play, then taken by name where they are a fill
  under white text.
- Each sidebar entry carried `border-left: 5px solid white`, a hard white rule down a dark page.

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
