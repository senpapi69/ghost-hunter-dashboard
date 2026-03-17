# Ghost Hunter Dashboard

A CRM/operations dashboard for a local business web design agency. Built with React + TypeScript + Vite + Tailwind CSS + shadcn/ui.

## Design Context

### Users
A small sales team running a local business web design agency. Multiple people share the dashboard to manage the full lead-to-deploy pipeline: finding leads, making calls, sending invoices, building sites, and tracking revenue. The tool needs to support fast individual workflows while giving the team shared visibility into pipeline status.

### Brand Personality
**Efficient, sharp, confident.** Ghost Hunter is a precision instrument — it should feel like a command center, not a toy. Every element earns its place. The interface communicates competence and speed, helping operators feel in control of a fast-moving sales pipeline.

**Emotional goals:** Control and speed. Users should feel they have full visibility into their pipeline while moving through workflows quickly. Nothing should feel sluggish, cluttered, or decorative without purpose.

### Aesthetic Direction
**Visual tone:** Dark, minimal, developer-aesthetic — inspired by Linear and Vercel. Clean typography, subtle depth through layered surfaces, restrained use of color. Data-dense but never overwhelming.

**Theme:** Dark-mode-first. Rich dark backgrounds (not pure black), blue-indigo primary accent, layered card surfaces with subtle border distinctions. Backdrop blur for floating elements.

**Typography:** Three-font system — Outfit for display headings (personality), Inter for body text (clarity), JetBrains Mono for data/timestamps/codes (precision).

**Anti-references:** Must NOT look like generic SaaS or Bootstrap templates. No rounded pastel buttons on white cards, no cookie-cutter layouts, no unnecessary illustrations or decorative elements.

### Design Principles

1. **Density over decoration** — Maximize information density. Every pixel should serve a purpose. Prefer compact, scannable layouts over spacious, magazine-style ones.

2. **Speed is a feature** — Interactions should feel instant. Use keyboard shortcuts, minimal click-paths, and responsive transitions. The UI should keep up with a fast operator.

3. **Layered clarity** — Use surface elevation (background → card → popover) and subtle borders to create visual hierarchy without heavy styling. Let spatial relationships do the work.

4. **Restrained color** — Color is reserved for meaning: status indicators, actionable elements, and data visualization. The default palette is neutral; color appears with intent.

5. **Professional confidence** — The interface should feel like a tool built by and for professionals. No whimsy, no unnecessary animations, no hand-holding. Trust the user to be competent.
