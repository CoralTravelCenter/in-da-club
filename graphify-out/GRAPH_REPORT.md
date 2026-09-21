# Graph Report - in-da-club  (2026-09-21)

## Corpus Check
- 54 files · ~173,267 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 308 nodes · 587 edges · 19 communities (15 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e9ec3542`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- card-activation.ts
- s-kartami/src/segments/segment.types.ts
- bez-kart/src/segments/segment.types.ts
- scripts
- bez-kart/tsconfig.json
- s-kartami/tsconfig.json
- typographed
- consents.ts
- devDependencies
- Анализ проекта `in-da-club`
- Design QA — inactive segment
- TestPopup
- typograf.mjs
- bez-kart
- vitest-config.ts
- shared/vite-env.d.ts
- s-kartami
- vite-config.ts
- compilerOptions

## God Nodes (most connected - your core abstractions)
1. `typographed()` - 33 edges
2. `scripts` - 24 edges
3. `compilerOptions` - 16 edges
4. `renderBlock()` - 11 edges
5. `renderRegistration()` - 11 edges
6. `renderVerification()` - 11 edges
7. `requestCardActivation()` - 11 edges
8. `getBonusProfile()` - 10 edges
9. `renderSuccess()` - 9 edges
10. `refreshUser()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `renderSegment()` --calls--> `typographed()`  [EXTRACTED]
  bez-kart/src/blocks/render-segment.ts → shared/typography.ts
- `validateRegistrationForm()` --calls--> `typographed()`  [EXTRACTED]
  bez-kart/src/card-activation/activation-view.ts → shared/typography.ts
- `validateVerificationForm()` --calls--> `typographed()`  [EXTRACTED]
  bez-kart/src/card-activation/activation-view.ts → shared/typography.ts
- `createDialog()` --calls--> `typographed()`  [EXTRACTED]
  bez-kart/src/card-activation/activation-view.ts → shared/typography.ts
- `createRegistrationForm()` --calls--> `typographed()`  [EXTRACTED]
  bez-kart/src/card-activation/activation-view.ts → shared/typography.ts

## Import Cycles
- None detected.

## Communities (19 total, 4 thin omitted)

### Community 0 - "card-activation.ts"
Cohesion: 0.08
Nodes (56): appendCard(), assetUrl(), clearFieldError(), clearValidationErrors(), CoralPopupElement, createDialog(), createRegistrationForm(), createVerificationForm() (+48 more)

### Community 1 - "s-kartami/src/segments/segment.types.ts"
Cohesion: 0.11
Nodes (27): API_DEPENDENT_BLOCKS, bootstrap(), BootstrapOptions, withLoadingBlocks(), appendTextWithBreaks(), appendVideo(), createTooltip(), renderBlock() (+19 more)

### Community 2 - "bez-kart/src/segments/segment.types.ts"
Cohesion: 0.11
Nodes (24): bootstrap(), BootstrapOptions, appendAction(), appendBadge(), appendDescription(), appendHeadingOrValue(), appendTextWithLineBreaks(), appendVideo() (+16 more)

### Community 3 - "scripts"
Cohesion: 0.06
Nodes (33): dependencies, petite-vue, scroll-lock, name, private, scripts, build, build:bez-kart (+25 more)

### Community 4 - "bez-kart/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, paths, extends, include, src, ../tsconfig.base.json

### Community 5 - "s-kartami/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, paths, extends, include, src, ../tsconfig.base.json

### Community 6 - "typographed"
Cohesion: 0.29
Nodes (14): activeBlocks(), BIRTHDAY_TOOLTIP, birthdayBlock(), CARD_IMAGE, cardBlock(), CASHBACK, cashbackBlock(), getSegmentConfig() (+6 more)

### Community 7 - "consents.ts"
Cohesion: 0.22
Nodes (11): applyConsents(), ConsentDocument, getConsentDocuments(), isConsentDocument(), LOAD_ERROR, SAVE_ERROR, documents, registration (+3 more)

### Community 8 - "devDependencies"
Cohesion: 0.13
Nodes (15): jsdom, devDependencies, jsdom, sass, typescript, typograf, vite, vite-plugin-monkey (+7 more)

### Community 9 - "Анализ проекта `in-da-club`"
Cohesion: 0.15
Nodes (12): `bez-kart`, `s-kartami`, Анализ проекта `in-da-club`, Артефакты анализа, Архитектура и потоки данных, Карта основных зависимостей, Назначение проекта, Общая оболочка (+4 more)

### Community 10 - "Design QA — inactive segment"
Cohesion: 0.25
Nodes (7): Comparison history, Design QA — inactive segment, Findings, Focused comparison evidence, Follow-up polish, Full-view comparison evidence, Verification

### Community 13 - "bez-kart"
Cohesion: 0.33
Nodes (5): bez-kart, Scroll snap, Контракт с Mindbox, Локальные изображения, Типографика

### Community 16 - "s-kartami"
Cohesion: 0.50
Nodes (3): s-kartami, Контракт с Mindbox, Медиа

### Community 17 - "vite-config.ts"
Cohesion: 0.48
Nodes (3): htmlBuildOutput(), createViteConfig(), ViteConfigOptions

### Community 18 - "compilerOptions"
Cohesion: 0.11
Nodes (18): DOM, ESNext, compilerOptions, esModuleInterop, isolatedModules, lib, module, moduleResolution (+10 more)

## Knowledge Gaps
- **109 isolated node(s):** `knownCities`, `profile`, `registration`, `documents`, `ConsentDocument` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `typographed()` connect `typographed` to `card-activation.ts`, `bez-kart/src/segments/segment.types.ts`, `consents.ts`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `knownCities`, `profile`, `registration` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `card-activation.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08438228438228439 - nodes in this community are weakly interconnected._
- **Should `s-kartami/src/segments/segment.types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10609756097560975 - nodes in this community are weakly interconnected._
- **Should `bez-kart/src/segments/segment.types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._