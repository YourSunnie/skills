# Sunnie skills

Skills made and curated by the Sunnie team, for [Sunnie](https://yoursunnie.com) to install and follow. Every Sunnie
trusts this repository by default and looks here first.

Sunnie reads them at **https://skills.yoursunnie.com**: an index of every skill (what it does, why it exists, whom it
is for) and one page per skill (`/widget-design`) saying how to install it. The same address is the Git repository
Sunnie installs from.

## Adding a skill

1. A directory named after the skill, holding `SKILL.md` and anything it needs beside it. The frontmatter:

   ```yaml
   ---
   name: widget-design          # the directory's name: lowercase letters, digits, single hyphens
   description: "What it does and when to use it, for the agent deciding (at most 1,024 characters)."
   metadata:
     purpose: "Why it exists: what goes wrong without it."
     for: "Whom it is for."
     author: "Sunnie team"
     version: "1"
   ---
   ```

2. Write it for Sunnie: its own tools by name, plain steps, how to check the result. Do not repeat what a tool's
   description already says. No scripts that need anything the agent's computer does not have.
3. Try it: install it into a scratch Sunnie from your branch and give it a real task.
4. Commit, push, then build and deploy the site (it names the commit, so it must be pushed first):

   ```bash
   node site/build.mjs && npx wrangler deploy
   ```

`node --test 'site/*.test.mjs'` checks the build. `node site/build.mjs --dev` builds from a dirty tree for a local look.

## Playbooks

A playbook is a skill that also says what to keep, what to watch for and what to do unasked. It is one more file
beside `SKILL.md`, `PLAYBOOK.json`, checked against [`playbook.schema.json`](playbook.schema.json) when the site is
built (`site/playbook.mjs`); the build stops on any problem. A Sunnie with playbooks on finds one through the index
(`index.json` lists each with its title, whom it is for and how many senses and rhythms it has), sets it up when the
person asks for help with that work, and shows them what it will do in words built from the file itself.

| Field | What it is |
| --- | --- |
| `title`, `for`, `summary` | What it is called, whom it fits (plain words, used for matching) and one line shown before it is used |
| `asks` | At most five questions asked once, only when Sunnie cannot find the answer itself |
| `homework` | What to look up in public before saying anything |
| `records` | Tables kept in `Drive/Data` (`database`, `table`, typed `columns`, `key`); Sunnie adds `_event` and `_at` |
| `senses` | Things worth connecting (`address`, `mail`, `site`, `hook`, `calendar`), how to ask, what an event looks like (`match`: `from`, `subject` or the reader's `kind`), and which table its rows go into |
| `rhythms` | Work done unasked: on a clock (`every` day, week or month, `at`) or when a sense brings something (`on: "sense:<id>"`), with `needs` (skip, at no cost, when a table has nothing fresh) and `say` (`always`, `if-notable`, `never`) |
| `signals` | Conditions worth a message, checked with one read-only `SELECT` |
| `prepare` | Messages or calendar changes left as a card the person taps (`mail_send`, `calendar_change`, …) |

Rules for writing one:

- Ask for the fewest connections that make it useful. Every sense is something the person has to do; a playbook that
  needs four before it says anything will never say anything.
- Everything in it is an instruction to later runs, so write it as the Sunnie team would say it to Sunnie, generic
  for the trade: no real people, places or businesses.
- A rhythm with `needs` costs nothing while it has no data; one without runs every time, so give it a reason to.
- Keep the schema and Sunnie's `src/playbooks/format.ts` in step: a field added to one is added to the other.
