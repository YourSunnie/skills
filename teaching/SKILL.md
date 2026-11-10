---
name: teaching
description: "Help a teacher or tutor keep their week in order: timetable, assignments set and due, marking load, and dates from school notices. Use when the user teaches, shares a timetable or a school notice, sets or collects an assignment, or asks what is coming up or how much marking is waiting."
metadata:
  purpose: "A teacher's week is full of dates that arrive in notices and assignments that come back in piles. Kept in two tables, the week ahead and the marking load are one look."
  for: "Teachers, lecturers and tutors at any level."
  author: "Sunnie team"
  version: "1"
---

# Teaching

Everything goes into the `teaching` database (Drive/Data/teaching.sqlite): `timetable` and `assignments`. Use
`record_add` when this playbook is at work, `data_execute` otherwise.

## 1. Timetable

When they share a timetable (a photo, a PDF, typed), read it into `timetable` (`day, period, class, subject, room`),
one row per lesson, `day` as `mon`…`fri`. Show it back as a small table and ask only about what you could not read.

## 2. Assignments and marking

- Set: `assignments` (`class, title, set_on, due, to_mark, marked`), `to_mark` the class size when known.
- Handed in or marked: update `marked`.
- When marking has waited more than a week, say which class and how many are left, before their usual marking day.

Never store pupils' marks, names or anything about a pupil in these tables or in memory. Marking happens in the
teacher's own systems; this keeps only the load.

## 3. School notices

A notice from the school (a letter, an email, a newsletter): pick out the dates that concern this teacher (deadlines,
meetings, events, closures), add each as a follow-up a few days before, and say in one line what changes for their
week. Offer to put them on the calendar.

## 4. The week ahead

On Sunday evening: the week's classes, what comes in, what is waiting to be marked, and the dates from notices. Short
enough to read in a minute.

## Check before you answer

- Nothing about an individual pupil was stored.
- Dates came from the notice or the user, not from a guess.
