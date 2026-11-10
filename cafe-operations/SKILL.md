---
name: cafe-operations
description: "Help someone who runs a café, restaurant or other food and drink outlet, or is opening a new one: log daily sales from a photo of a receipt or closing report, cost a recipe and price a menu, track stock and purchases, keep rosters and SOPs, draft replies to reviews, plan posts, and plan a new outlet's opening backwards from the date. Use whenever the user manages or owns an F&B outlet, sends a receipt, closing report, delivery app summary or supplier invoice, or asks about sales, food cost, menu prices, staff shifts, suppliers, reviews or opening a new place."
metadata:
  purpose: "An outlet manager sends half-read photos and quick numbers between rushes. Without a plan they end up scattered across chats and memory, and a month later nobody can say which item dropped or what the margin is. This skill keeps every number in one database per subject, so later questions are one query."
  for: "Café and restaurant managers and owners, and anyone opening a food and drink outlet, in Indonesia or anywhere else."
  author: "Sunnie team"
  version: "1"
---

# Café operations

The person you help is busy on the floor. They send a photo between orders and read your answer while walking. So:
reply short, ask at most one question at a time, and never make them type something you could read from the photo.
Answer in the language they write in. In Indonesia that is usually Bahasa Indonesia with English words mixed in, and
money is Rupiah without decimals (`Rp1.250.000`).

## 1. Know the outlets first

The first time this comes up, learn each outlet and `memory_save` one memory per outlet: its name, address, opening
hours, sales channels (dine-in, takeaway, GoFood, GrabFood, ShopeeFood, reservations by WhatsApp…), the POS it uses,
who runs which shift, and what kind of place it is. Use the outlet's short name in every record afterwards, as
`outlet`. A manager running one place while opening another has two outlets from day one, and the new one's records
must never mix with the running one's.

Do not ask for all of this at once. Ask for the name and what kind of place it is, and pick up the rest as it
comes.

## 2. Sales from a receipt or closing report

When they send a photo of a receipt, a POS closing report (Z report), or a screenshot of a delivery app's summary:

1. `view_image` and read every number you can: date, outlet, gross sales, discounts, tax and service, net, number
   of transactions, payment methods, and the items with quantity and amount if listed.
2. Show what you read back in a short table, and mark anything you guessed or could not read. Ask about those only.
   Never invent a number to fill a gap; leave it empty.
3. Once confirmed (or they say "ok" / "simpan"), write it with `data_execute` into the `sales` database:

   ```sql
   CREATE TABLE IF NOT EXISTS days (date TEXT, outlet TEXT, channel TEXT, gross INTEGER, discount INTEGER,
     tax_service INTEGER, net INTEGER, transactions INTEGER, currency TEXT DEFAULT 'IDR', source TEXT,
     PRIMARY KEY (date, outlet, channel));
   CREATE TABLE IF NOT EXISTS items (date TEXT, outlet TEXT, channel TEXT, item TEXT, qty INTEGER, amount INTEGER);
   CREATE TABLE IF NOT EXISTS payments (date TEXT, outlet TEXT, method TEXT, amount INTEGER);
   ```

   `channel` is `dine-in`, `gofood`, `grabfood` and so on; one report per channel is one row. `source` says where it
   came from (`z-report photo`, `typed`). Money is whole Rupiah. If that day and channel already has a row, say so and
   ask before replacing it.
4. Reply with one line that means something: today against the same weekday last week, or the average ticket
   (`net / transactions`). Not a recap of the table.

Typed numbers ("tutup 4,2jt, 87 transaksi, gofood 1,1jt") go through the same steps without the photo.

Questions later ("menu apa yang turun bulan ini?", "jam berapa paling ramai?", "GoFood worth it nggak?") are one
`data_query` each. Compute in SQL, then answer in a sentence and a small table or chart. Remember that delivery apps
take a commission: when comparing channels, ask for the rate or use what the user said before, and say which rate you
used.

## 3. Expenses, stock and suppliers

Supplier invoices and purchase receipts go into the `purchases` database, table `lines` (`date, outlet, supplier, item,
qty, unit, amount`), the same way: read, confirm, write.

For stock, keep the `stock` database, table `levels` (`outlet, item, unit, on_hand, par, updated`), and update it when they report a count. When an
item falls under `par`, say so and offer a reorder reminder with `task_add` at the time they usually order. When they
want a supplier's price watched and the price is on a public page, a `watch_create` that wakes you only when it changes
is enough; do not check it by hand every day.

To compare suppliers or equipment (espresso machines, grinders, POS systems, chillers), use `delegate` with one helper
per option, then give one comparison table with prices, links and the one difference that matters.

## 4. Recipe costing and menu prices

Food cost decides whether a menu item earns anything. For each item, build the recipe with quantities, the purchase
price and unit of each ingredient, and the yield. Make it a spreadsheet with `document_create` (xlsx), one row per
ingredient, with live formulas: cost per gram or ml = purchase price / purchase quantity, line cost = cost per unit ×
quantity used, plate cost = sum, food cost % = plate cost / selling price before tax. Put the target percentage in one
cell the formulas read, so the user can change it.

Common targets are roughly 25–35 % for food and 15–30 % for drinks, but the owner's own target wins: ask once and
save it. When a price changes in `purchases`, offer to update the costing.

For a quick question ("kalau harga susu naik jadi Rp22.000, HPP latte jadi berapa?"), work it out in the reply and
show the steps in one or two lines.

## 5. Staff

- Rosters: `document_create` an xlsx, one column per day, shifts as rows, with the hours summed per person.
- SOPs and checklists (opening, closing, cleaning, food safety, cash handling): a short docx or PDF with numbered
  steps and a tick box per step. Write them from what the user tells you about their place, not a generic template.
- Interview questions and a first-week plan for a new hire, when they are hiring.

Keep staff details to names, roles and shifts. Do not store ID numbers, salaries or bank details unless the user
insists, and never put them in a file meant to be printed or shared.

## 6. Reviews and posts

Reviews: when they paste a review or send a screenshot, draft a reply in the outlet's voice (ask for two or three
words that describe it, once, and save them). Thank them by name if given, address the actual complaint, offer a way
to make it right without promising refunds the user did not offer, and keep it under 80 words. They post it
themselves.

Posts: plan a week of posts around what the outlet already does (its specials, its regulars, its neighbourhood),
write captions, and improve their own food photos with `image_edit` (light, crop, background) rather than generating
food that does not exist. A generated picture of a dish they do not sell is misleading; do not make one for a post.

## 7. Opening a new outlet

1. Ask for the target opening date, the location, the format (dine-in, takeaway, express) and the budget.
2. Plan backwards from the date in phases: permits and licences, location and fit-out, equipment, suppliers, menu and
   costing, hiring and training, brand and pre-opening posts, soft opening, opening. Look up the permits the place
   actually needs with `web_fetch` at the time, from official sources (in Indonesia this usually starts with an NIB
   through OSS and halal certification for food); do not answer from memory, since rules and fees change.
3. Every step with a date becomes a `task_add` with a reminder a few days before it is due, in the new outlet's name.
4. Keep the budget in a `budget` database (`category, item, planned, actual, vendor, date`) and say plainly when a
   category goes over.
5. To understand the area, `delegate` one helper per nearby competitor: prices, opening hours, best sellers and what
   reviews complain about. Give back one table and three things the new outlet could do differently.
6. Offer a Home widget with the days left to opening and the budget used (see the widget-design skill).

## 8. Every day

When this skill's playbook is at work, the comparison with last week, the Monday summary, food cost and low stock come
by themselves: do not ask the user to set reminders for them, and keep the menu's `plate_cost` and `food_cost_pct`
filled in `menu.items` so the checks can see them. Keep the records with `record_add` then.

If the user agrees, keep a Home widget per outlet with yesterday's net, the transactions and today's open tasks, and
refresh it after each sales entry. Offer once; do not add widgets they did not ask for.

## Check before you answer

- Every number you saved came from the user or their photo, and they confirmed it.
- The outlet is right: nothing from one outlet landed in the other's rows.
- The answer starts with what they asked, in their language, short enough to read between orders.
