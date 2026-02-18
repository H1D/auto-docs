---
name: auto-docs
description: >
  Auto-generate and maintain structured project documentation optimized for
  LLM agents. Uses progressive disclosure with a compact index always loaded
  and detailed feature/architecture docs loaded on demand.
  Triggers: /auto-docs, "generate project docs", "document this project",
  "update docs", "refresh documentation"
license: MIT
metadata:
  author: temasus
  version: "1.0"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task
---

# Auto-Docs — Project Documentation for Agents

Generate and maintain structured project documentation optimized for LLM consumption. Uses TOON (Token-Oriented Object Notation) for compact structured data and Markdown for narrative. Documentation lives in `.claude/docs/` with a compact `index.toon` always loaded via CLAUDE.md.

## Three-Tier Progressive Disclosure

| Tier | What | When Loaded | Token Budget |
|------|------|-------------|--------------|
| **L1: Index** | `index.toon` — compact feature catalog | Always (via `@` import in CLAUDE.md) | ~100-200 tokens |
| **L2: Feature Detail** | Per-feature `.md` files with embedded TOON blocks | On demand (when working on that feature) | ~300-600 per file |
| **L3: Cross-cutting** | `architecture.md`, `decisions.md`, `dependencies.md` | On demand (refactoring, design, dep changes) | ~400-800 per file |

## Modes

### Generate Mode (default)

Creates documentation from scratch for a project. Use when:
- Running `/auto-docs` in a project with no `.claude/docs/`
- User says "generate project docs" or "document this project"

### Update Mode

Updates existing documentation to match current code. Use when:
- Running `/auto-docs update`
- User says "update docs" or "refresh documentation"
- `.claude/docs/` already exists

---

## Generate Workflow

### Phase 1: Discover

1. **Read project manifest** — look for `package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `build.gradle`, `Makefile`, `docker-compose.yml`, or similar
2. **Map directory structure** — use Glob to understand `src/`, `lib/`, `app/`, `cmd/`, etc.
3. **Read existing docs** — check README, CLAUDE.md, any existing documentation
4. **Identify stack** — language, framework, runtime, database, key libraries
5. **Identify features** — look for bounded domains: route groups, service directories, module folders. A "feature" = a user-facing capability or domain boundary (auth, payments, search), NOT a technical layer

### Phase 2: Generate

Read the reference files before generating:
- `references/toon-syntax.md` — TOON format rules
- `references/generation-templates.md` — templates for each file type

Generate files in this order:
1. `index.toon` — feature catalog and doc links
2. `overview.md` — project summary and structure
3. Feature files (`features/<name>.md`) — one per identified feature
4. `architecture.md` — component map and data flow
5. `decisions.md` — key architectural decisions found in code/comments
6. `dependencies.md` — runtime, dev, and internal dependency maps

**Rules:**
- All file paths referenced in docs MUST exist in the project (verify with Glob)
- TOON `[N]` counts MUST match actual row counts
- Omit sections that don't apply (e.g., no routes table for a CLI tool)
- Be terse — abbreviate where meaning is clear
- Only document what you can verify from the codebase

### Phase 3: Integrate

Add the `@` import to CLAUDE.md (create the file if needed):

```markdown
## Project Documentation
@.claude/docs/index.toon
```

If CLAUDE.md already has content, add the import under a `## Project Documentation` heading. Don't modify existing content.

### Phase 4: Report

Summarize what was generated:
- Number of features documented
- List of files created
- Any areas where documentation is incomplete (couldn't determine values)
- Suggestion to review and refine

---

## Update Workflow

### Phase 1: Diff Detection

1. Read current `.claude/docs/index.toon` to know what's documented
2. Scan the project for changes:
   - New directories/modules not in any feature file
   - New routes not documented
   - Deleted files still referenced in docs
   - New dependencies not in `dependencies.md`
   - Changed entry points or structure

### Phase 2: Report Changes

Present a summary of detected changes:
```
Documentation drift detected:
- NEW: src/services/notifications/ (not documented)
- MOVED: src/auth/ → src/services/auth/ (path outdated in auth.md)
- REMOVED: src/legacy/ (still referenced in architecture.md)
- NEW DEP: @redis/client (not in dependencies.md)
```

### Phase 3: Apply Updates

After user confirms (or if running non-interactively):
1. Update affected files
2. Update `index.toon` if features added/removed
3. Update `[N]` counts in all modified TOON blocks
4. Update the `updated` date in `index.toon`

---

## Context Loading Guide

When working on a project with `.claude/docs/`, load files based on task:

| Task Type | Load These Files |
|-----------|-----------------|
| Working on a specific feature | `features/<name>.md` for that feature |
| Adding a new feature | `architecture.md` + `index.toon` |
| Debugging | Relevant `features/<name>.md` + `dependencies.md` |
| Refactoring | `architecture.md` + affected `features/*.md` |
| Dependency changes | `dependencies.md` |
| Design decisions | `decisions.md` |
| Onboarding / overview | `overview.md` |

---

## TOON Quick Reference

```
key: value                              # simple key-value
parent:                                 # nested object
  child: value                          #   (indent 2 spaces)
parent.child: value                     # key folding (same as above)
items[3]{col1,col2}: ...               # tabular array header
  val1,val2                             #   row (indent 2 spaces)
tags[2]: a,b                            # primitive array
description: "has, commas"             # quote only if delimiters present
```

Full reference: `references/toon-syntax.md`
Templates: `references/generation-templates.md`
