---
name: widget-design
description: "Design a Home widget or a widget card in a reply that looks like it belongs on an iPhone: choosing what to show, the size, the layout and the styling, then drawing it with widget_render and fixing what looks wrong. Use whenever you make or redesign a widget, when the user says a widget looks plain, crowded or broken, or when they ask for something on Home."
metadata:
  purpose: "Widgets are the first thing the user sees. The home_widget tool says which parts exist; this skill says how to put them together so the result is calm, readable and worth keeping on Home, and how to check it before saying it is done."
  for: "Every Sunnie user with the app: anyone who keeps things on Home (a trip, a habit, a countdown, the weather) or gets cards in replies."
  author: "Sunnie team"
  version: "1"
---

# Widget design

The `home_widget` tool description lists every part, its fields and the size limits. Read it there; this skill does not
repeat it. What follows is how to design with those parts.

## 1. Decide what the widget is for

Before writing JSON, answer in one sentence: *what does the user glance at this for?* "How many days until Rome",
"whether I closed my rings", "what's next on the itinerary". That sentence picks the **focal point**: the one number,
word or picture that answers it. Everything else is context, and most of it can go.

- One widget, one question. Two questions are two widgets.
- Ask yourself what they will do after glancing. If the answer is "open the ticket" or "ask Sunnie", that is the one
  action (a tap on the widget, or one button). If the answer is "nothing", there is no button.
- Data that changes gets a `key` that names it, so a later `update` (or a watch) refreshes it without touching the design.
  Anything that goes stale gets `hours`.

## 2. Pick the size from the content, not the other way round

| Size | Good for | Not for |
| --- | --- | --- |
| Small (1) | one number with a word, one ring, one icon | headings, lists, buttons, sentences |
| Medium (2) | a focal value plus one or two lines; a tiny chart; a carousel of days | a table, more than one button |
| Large (3) | a heading, a focal value and a little detail | everything you know about it |
| Full (4) | an itinerary, a short list, a recipe with a stepper, a carousel of stories | filler |

Use the size the user asked for. When they did not ask: 2 for a single number or ring, 4 otherwise. When the content
does not fit, **show less**, never smaller type. Several things of the same kind (days, flights, headlines) are a
`carousel`, one page each, each page designed like a widget of that size.

## 3. Lay it out

Start from one of these shapes and change only what the content needs:

- **Number first** (steps, balance, days left): `stack` → small secondary label, then a `stat` or a large `text` with
  `weight: "semibold"`, then a caption in `secondary`. Small widgets drop the label and keep the word under the number.
- **Ring** (progress toward a goal): `row` with a `gauge` (`fit: true`) and a `stack` of the value and what it is out of.
- **Next thing** (a flight, the next event): heading line, then `fields` with the two or three facts that matter
  (time, place, gate), then at most one `button` with a verb.
- **Picture card** (a trip, a place): body with `backgroundImage` from Drive, a scrim gradient `["#00000000","#000000B3"]`,
  `color: "white"`, `height` 180–220, the text anchored at the bottom with a `layer` (`anchor: "bottomLeading"`).
- **Something to work out** (a recipe for N people, a loan): an input (`stepper`, `slider`, `segmented`) at the top,
  the results below as formulas, nothing else.
- **Plan for the day**: `checklist` with `time` on each item (it becomes a timeline), a heading with "{done} of N".

Rules of thumb:

- Spacing on the 8-point grid: 8 inside a group, 12–16 between groups. `padding` 16–20 on anything with a background.
- Hierarchy by weight and colour, not by many sizes: at most three text sizes and two weights in one widget.
  Secondary information is `color: "secondary"`.
- Align everything to one edge (leading). Centre only a lone number or ring.
- `row` children are equal widths; give icons, gauges and badges `fit: true`.
- A heading is a `text` part (`footnote`/`subheadline`, `semibold`, `secondary`), only when it helps; `title` is never drawn.

## 4. Style with restraint

- A plain widget needs no styling: bare parts already look like iOS. Add colour only when it carries meaning
  (a status, a brand, a mood the user asked for).
- One accent colour **or** one gradient per widget. Gradients go from a colour to a slightly darker or shifted one of the
  same hue (`#0B3D91` → `#1F6FEB`), never across the colour wheel.
- On any colour, gradient or picture, set `color` on the body so every child inherits a readable colour (white on dark,
  black or `primary` on light). Check contrast: small text needs about 4.5:1.
- System type only. No serif, no `design: "monospaced"` except for codes and numbers that must line up.
- `corner` 16–22 on cards, smaller on what sits inside them. Borders are rarely needed.
- Icons are SF Symbols that say the thing literally (`airplane`, `figure.walk`, `cloud.sun`). One icon per idea; do not
  decorate every line.

## 5. Draw it and look

Never report a widget you have not looked at, when the user is in the chat:

1. `widget_render` with the body (or the Home widget's `id`) and the `columns` it will have; `0` for a card in a reply.
2. Look at the picture as the user would, at arm's length. Check, in order:
   - Is the focal point the first thing you see?
   - Is anything cut off, wrapped badly (one word alone on a line) or touching an edge?
   - Can every line be read against its background?
   - Is there anything you could remove without losing the answer to step 1's question? Remove it.
3. Fix and draw again. Two or three rounds is normal; stop when nothing is left to fix, not after the first picture.

If no app is there to draw it (the user is away, or the render times out), check the JSON against the size limits in
the tool description, keep the design simple, and say nothing about how it looks.

## 6. Refreshing and redesigning

- A refresh is `update` with `values` by key. It never changes the design; do not `set` again for new data.
- A redesign is `set` with the same `id` (it keeps its place on Home). Only when the user asks for a new look, a new size,
  or says it looks wrong.
- When the user sends a widget back quoted with its picture, that picture is what they see: start from it, change what
  they pointed at, keep the rest.

## Common mistakes

- A heading on a Small widget, or "Steps today" where "Steps" fits.
- Every fact you have, in a list: pick the three that answer the question.
- Two filled buttons. One main action, filled; a second, if any, tinted or plain.
- White text on a light picture without a scrim.
- A picture from the web address directly: download it into Drive first (such as `Home/rome.jpg`) and use the path.
- A `reply` action on Home: it only works in a card in a reply.
- Calling it done without drawing it.
