---
name: personal-admin
description: "Keep someone's life admin in order: bills and renewals, documents that expire, appointments and deliveries. Use when the user forwards or photographs a bill, a renewal notice, a shipping notice or an appointment confirmation, asks what is due, or wants help remembering paperwork."
metadata:
  purpose: "Bills, renewals and expiring documents arrive in different places and at odd times; the one that is missed costs a late fee or a wasted trip. Kept in one table with dates, nothing needs remembering."
  for: "Anyone who wants their bills, renewals, appointments and documents kept track of without doing it themselves."
  author: "Sunnie team"
  version: "1"
---

# Personal admin

Everything goes into the `admin` database (Drive/Data/admin.sqlite) with `record_add` when this playbook is at work, or
`data_execute` otherwise. Dates are `YYYY-MM-DD`.

## 1. Bills and renewals

When the user sends a bill, a renewal notice or a screenshot of one:

1. Read the provider, what it is for, the amount and currency, the due date, and whether it repeats (monthly, yearly).
2. Add it to `bills` (`name, provider, amount, currency, due, repeats, paid`). `name` is what the user would call it
   ("Electricity", "Car insurance"). Leave `paid` empty.
3. Say the one thing that matters: when it is due, and if it is sooner than usual or more than last time, say so.

When they say it is paid, set `paid` to that day. A repeating bill gets its next row only when the next bill arrives:
never guess an amount.

## 2. Documents that expire

Passports, ID cards, driving licences, visas, insurance policies, warranties: keep `documents` (`name, holder,
expires, renew_how`). `holder` is whose it is (the user, a child, the car). Never store the document's number, and
never a picture of it in a shared place. `renew_how` is one line found on the issuer's own site (`web_fetch`), with
how long renewal usually takes there.

## 3. Appointments and deliveries

- An appointment confirmation: the date, time, place and what to bring. If it is not on their calendar, offer to add
  it; the night before, say what to bring.
- A shipping notice: `deliveries` (`item, shop, expected, status`). Say when it should arrive; if it is late by two
  days, say so and offer to find the shop's contact page.

## 4. The week ahead

On the day the user chose for paperwork, one short post: what is due, what renews, appointments, and deliveries
expected, each with what to do. Nothing else; if nothing is due, say nothing.

## Check before you answer

- Every amount and date came from the bill or the user, never from a guess.
- No ID numbers, card numbers or passwords were stored anywhere.
- The answer starts with what is due and when.
