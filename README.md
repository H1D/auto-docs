# auto-docs

Agent skill that auto-generates structured project documentation optimized for LLM consumption.

Uses [TOON](https://toonformat.dev/) for compact structured data (40-60% fewer tokens than JSON) and Markdown for narrative. Documentation is organized in three tiers with progressive disclosure — a tiny index is always loaded, feature details and architecture docs load on demand.

## Install

```bash
npx skills add H1D/auto-docs
```

## Usage

```
/auto-docs           # generate docs from scratch
/auto-docs update    # sync docs with code changes
```

## What it generates

```
.claude/docs/
├── index.toon           # always loaded — feature catalog (~100 tokens)
├── overview.md          # project summary + stack
├── architecture.md      # component map + data flow
├── decisions.md         # architectural decision records
├── dependencies.md      # runtime, dev, internal dep maps
└── features/
    ├── auth.md          # per-feature detail with embedded TOON
    └── payments.md
```

Includes a TOON validation script that checks both `.toon` files and ` ```toon ` blocks embedded in Markdown.

## License

MIT
