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
