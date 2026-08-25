# Changelog

## 1.0.4

### Narrow screens

Measured on a real device in Chrome's device mode rather than by resizing a window — Chrome ignores
a resize while the window is maximised, and a test bench that composes at whatever width it is
handed cannot see a page that overflows.

- **The board's own mobile rule had never once applied.** It asked for `width: 240px` on a bare
  `#board th.board-column-header`, which this skin's own base rule beat on specificity — (1,3,1)
  against (1,1,1), because of the two `:not()` added to beat Kanboard. Columns stayed 268px wide on
  a phone. A column is `92vw` below 560 points and a flat 300 up to 768: one at a time on a phone,
  two and a half on a tablet. The two cases are separate queries because a single capped value,
  right for the tablet, quietly took the phone back to eleven percent of the gain — which is to
  say, to no visible change at all.
- The board **snaps by column**, in `proximity` rather than `mandatory`: dragging a card towards a
  neighbour scrolls that same container, and a mandatory snap fights the drag. At 425 points, 0.98
  of a column is on screen against 1.27 before.
- **Tables written in a description or a comment were cut, not scrolled.** Kanboard sets
  `overflow-x: hidden` on the body, so anything wider than its column is unreachable: a task page
  measured 457 points inside 390, and the 67 past the edge could not be reached by any means.
  Kanboard's own `table.table-scrolling` reaches only the tables it puts that class on, and the
  ones Markdown produces do not carry it.
- Two further overflows, invisible for the same reason and widening the page all the same: the
  application title ran 80 points past the right edge — dropping its 300-point floor let the
  container shrink, but the `span` inside keeps `min-width: auto` and would not — and the comment
  box overshot by 4, sized in absolute points under `content-box`. Fields are `border-box` now, and
  a task page overflows by **0** at 425 points.
- **The controls that are the only way into an action** — a column's menu, a card's menu, the add
  button, the view tabs — were 15 points tall. They are 40. The icons in a card's footer are
  deliberately left alone: 25 points on every card costs more than it returns where vertical space
  is the scarce thing.
- The header keeps the logo **on the left**. Kanboard sends it to `order: 3` under 480 points,
  which made sense while the three blocks each took a row and reads backwards now they share one.
  78 points tall, down to 55.
- The gear **joins the row of view tabs**, taking the toolbar from 125 points to 88. It had been
  taking a line of its own for want of seven, and the cause was subtler than it looked: the
  switcher holds a `ul` set to `width: 100%`, so its content width resolved to its own width — a
  loop that pinned its `min-content` at 405. A flex basis of zero has it take the free space
  instead of dictating it.
- The **view tabs are a segmented control** again. Kanboard rounds each tab by 5 points under 560,
  left over from when they were stacked blocks, so a rounded rectangle floated inside a pill. The
  segments are flush now and the container carries the shape — and the two end segments follow the
  container's curve rather than being squared off, because clipping alone cannot make a square fill
  meet a round rim: a hairline of page background showed along the arc. Their 5-point top margin,
  another leftover, had been putting 6 points above each tab against 1 below.
- The three tabs **shrink together**. They needed 368.7 points of min-content in the 330 the strip
  has, and with `min-width: auto` the flex algorithm makes the last one pay: "Liste" collapsed to
  two letters while the other two kept their full width. Eight points of padding either side brings
  the three to 329.6, and `min-width: 0` has them share what is still missing below about 360
  points, with an ellipsis instead of a cut word.
- The caret beside the avatar sat above its neighbour. These links are `inline-flex` with
  `align-items: normal`, so a 15-point caret was stretched into a 22-point box and its glyph
  settled at the top of it. Centring the row costs nothing and fixes every menu in the header.
- The override of Kanboard's stacked view tabs is now written down as an override. It was already
  there, winning a specificity tie on load order alone, and an override nobody wrote down is
  indistinguishable from a bug.
- **The price, stated:** 27% of a phone screen goes before the first card, against 21% before.
  Controls that can be hit take room. What was recoverable was recovered — the column header's
  padding, now carried by the menu inside it; the tabs' margins; the gear's line — and the rest is
  Kanboard's information architecture, not something a stylesheet should dismantle.

### PluginManager, third pass

- **Its icons are 69 images**, delivered as `content: url("data:image/svg+xml,…")` with the fills
  baked into the paths. `fill='currentColor'` on the root does nothing: an image loaded through
  `content` is a replaced element and inherits no colour, so no custom property can reach it.
  Measured on the rendered pixels of 40 of them, composited over the real page ground: a median of
  2.75:1, a minimum of 1.15:1, and 23 below the 3:1 non-text line — one of them the Plugins entry
  of the user menu, plain black. A filter carried by a token takes them to a median of 8.67:1, a
  minimum of 5.40:1, and none below the line. The measurement matters as much as the fix: the
  elements' own `color` and `border` all passed while the images did not, and only sampling pixels
  showed it.
- Its page titles, its sidebar hover and its active count were `#B71234` — 2.75:1 on the dark page,
  against the 4.5:1 AA asks of body text. They take the danger ink, at 7.81:1.
- Its install button carried a 2px `#FF6500` border and a 3px radius, 141 times on the directory
  page alone. Not a contrast failure; a shape belonging to another interface.
- The manual-plugins page was framed in `#D50000` twelve times over — the fieldset, the URL field,
  every edge of the table. That token and the orange are both double-edged in the way `--pp-white`
  was in 1.0.2: remapped for the role they mostly play, then taken by name where they are a fill
  under white text. `--azimuth-attention` is new and exists for exactly that — one value that has
  to carry white text *and* read as a hairline, which is a narrow window, and not the same window
  in the two palettes.
- Each sidebar entry carried `border-left: 5px solid white`, a hard white rule down a dark page.
- Every selector in that section is doubled, and the buttons' are tripled. This sheet is served
  *before* PluginManager's, so a tie on specificity goes to PluginManager on order — the same
  reason `:root:root` was already doubled. Written plainly the first time, three of these rules
  simply did not apply, and the count badge came out wearing the hairline colour meant for the
  table borders. The buttons needed a third class because PluginManager styles them through
  `.install-plugin:link`, and `:link` counts as one.

### A description, and French

- The plugin description was one paragraph of 819 characters listing seven features in a row — the
  changelog, not a description. Three sentences now, 223 characters. Measured by substituting the
  text into the live tables of Settings > Plugins: the directory table, the one that showed the
  fault, goes from five lines to **two** at 1400px and from four to **one** at 1920px. The
  installed-plugins table keeps the height it had, its description column being far narrower; the
  gain there is three readable sentences in place of a list of seven features, at the same cost.
- **The plugin speaks French.** `getPluginDescription()` was already wrapped in `t()` — which most
  plugins do not bother with, Kanboard's own Slack plugin included — so all that was missing was a
  `Locale` folder and the `onStartup()` that loads it. It is the only string the application ever
  prints: a stylesheet has no words of its own.
- `plugins.json`, which feeds the directory on kanboard.org, is a static file in someone else's
  repository. It still carries the old description; updating it means a pull request there.

### The stylesheet is nine sheets

- `skin.css` had reached 2 116 lines across twenty-five sections. It is now nine — `tokens`,
  `base`, `chrome`, `board`, `task`, `controls`, `colours`, `narrow`, `compat-plugin-manager` —
  registered in that order in `Plugin.php`, because `Hook::on()` appends and Kanboard renders the
  listeners in registration order.
- They are **contiguous slices**, cut at section boundaries and never reordered, and that is the
  whole point: several rules here win on nothing but document order — the phone media query over
  the tablet one, `:root:root` over PluginManager's named rules, the segmented control over
  Kanboard's stacked tabs. A split by subject would have reordered them and changed which rule
  wins, silently. Cutting contiguously makes the cascade identical *by construction*, and provable:
  the concatenation of the nine in load order reproduces the old file byte for byte, 71 747
  characters. Confirmed in the browser as well, by an A/B inside a single page load — the nine
  sheets against their concatenation inlined in their place — over five page and width
  combinations, up to 5 533 elements and sixty computed properties each: no difference.
- The compatibility sheet is `compat-plugin-manager.css` and not `plugin-manager.css`, which is
  what PluginManager calls its own.
- `contrast.mjs` no longer reads a named sheet; it walks `Assets/`. Naming `tokens.css` would have
  made the guard go quiet the day a token moved.

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
