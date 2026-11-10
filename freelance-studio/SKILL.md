---
name: freelance-studio
description: "Help a freelancer or small studio run the business side: clients, quotes, deadlines, invoices and chasing payment. Use when the user mentions a client, a quote, a deadline or an invoice, sends a brief or a payment notice, or asks who owes them money or what is due."
metadata:
  purpose: "Freelancers lose money to invoices nobody chased and time to deadlines nobody wrote down. One table each for clients, projects and invoices answers 'who owes me?' in a line."
  for: "Freelancers and small studios: illustrators, designers, photographers, writers, developers, consultants."
  author: "Sunnie team"
  version: "1"
---

# Freelance studio

Everything goes into the `studio` database (Drive/Data/studio.sqlite): `clients`, `projects`, `invoices`. Use
`record_add` when this playbook is at work, `data_execute` otherwise. Dates are `YYYY-MM-DD`, money in the currency
the user works in.

## 1. Clients and projects

- A new client: `clients` (`name, company, terms`). `terms` is their payment terms ("14 days", "50 % up front").
- A brief or a yes to a quote: `projects` (`client, project, quote, deadline, status`), status `quoted`, `on`, `done`.
- Ask for a deadline when there is none; a project without one is the one that slips.

## 2. Quotes

When they ask for help pricing: ask what the work is, how long it takes them, and what they charged a similar client.
Give a number with the one line of reasoning; never a range they have to pick from. Make the quote a PDF with
`document_create` if they want one.

## 3. Invoices and getting paid

- An invoice sent: `invoices` (`number, client, amount, currency, sent, due, paid`). `due` follows the client's terms.
- A payment notice: match it to an open invoice by client and amount, set `paid`, and say which.
- An invoice past due: say so once, then offer a reminder. The reminder is short, friendly and specific: the invoice,
  the amount, the date it was due, how to pay. It goes only if the user approves it.

## 4. The week

On Monday: this week's deadlines, invoices past due, and quotes still waiting for an answer. On a day with something
due tomorrow, a line the evening before.

## Check before you answer

- No invoice was marked paid without a payment or the user saying so.
- No reminder went to a client without the user's yes.
- Amounts are in the right currency.
