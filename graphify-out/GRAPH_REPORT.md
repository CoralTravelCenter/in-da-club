# Graph Report - in-da-club  (2026-09-23)

## Corpus Check
- 58 files · ~149,199 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: .scss 20, (none) 2)

## Summary
- 324 nodes · 690 edges · 15 communities (14 shown, 1 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0af36160`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- customer-api.ts
- typographed
- bez-kart/src/segments/segment.config.ts
- package.json
- registration-view.ts
- compilerOptions
- consents.ts
- bez-kart
- scripts
- bez-kart/tsconfig.json
- vite.config.base.ts
- s-kartami/src/segments/segment.types.ts
- s-kartami/tsconfig.json
- vite-env.d.ts
- in-da-club

## God Nodes (most connected - your core abstractions)
1. `typographed()` - 41 edges
2. `scripts` - 17 edges
3. `compilerOptions` - 16 edges
4. `vitest` - 15 edges
5. `renderVerification()` - 13 edges
6. `renderRegistration()` - 12 edges
7. `renderBlock()` - 11 edges
8. `requestCardActivation()` - 11 edges
9. `getBonusProfile()` - 11 edges
10. `refreshUser()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Типографика` --references--> `typographed()`  [INFERRED]
  bez-kart/README.md → shared/runtime/typography.ts
- `in-da-club` --references--> `shared()`  [INFERRED]
  README.md → s-kartami/src/segments/segment.config.ts
- `renderSegment()` --calls--> `typographed()`  [EXTRACTED]
  bez-kart/src/blocks/render-segment.ts → shared/runtime/typography.ts
- `showSuccessResult()` --calls--> `typographed()`  [EXTRACTED]
  bez-kart/src/card-activation/activation-result-view.ts → shared/runtime/typography.ts
- `showRefreshRequiredResult()` --calls--> `typographed()`  [EXTRACTED]
  bez-kart/src/card-activation/activation-result-view.ts → shared/runtime/typography.ts

## Import Cycles
- None detected.

## Communities (15 total, 1 thin omitted)

### Community 0 - "customer-api.ts"
Cohesion: 0.10
Nodes (46): appendCard(), assetUrl(), showExistingCardResult(), showRefreshRequiredResult(), showSuccessResult(), ACTIVATION_DIALOG_ID, CoralPopupElement, createDialog() (+38 more)

### Community 1 - "typographed"
Cohesion: 0.15
Nodes (22): s-kartami, Контракт с Mindbox, Медиа, activeBlocks(), BIRTHDAY_TOOLTIP, birthdayBlock(), CARD_IMAGE, cardBlock() (+14 more)

### Community 2 - "bez-kart/src/segments/segment.config.ts"
Cohesion: 0.08
Nodes (31): bootstrap(), BootstrapOptions, appendAction(), appendBadge(), appendDescription(), appendHeadingOrValue(), appendTextWithLineBreaks(), appendVideo() (+23 more)

### Community 3 - "package.json"
Cohesion: 0.06
Nodes (28): dependencies, petite-vue, scroll-lock, devDependencies, jsdom, sass, typescript, typograf (+20 more)

### Community 4 - "registration-view.ts"
Cohesion: 0.22
Nodes (15): cities, formatBirthdate(), renderRegistration(), clearFieldError(), clearValidationErrors(), createRegistrationForm(), displayBirthdate(), isValidPhone() (+7 more)

### Community 5 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, esModuleInterop, isolatedModules, lib, module, moduleResolution, noEmit, noImplicitReturns (+8 more)

### Community 6 - "consents.ts"
Cohesion: 0.22
Nodes (11): applyConsents(), ConsentDocument, getConsentDocuments(), isConsentDocument(), LOAD_ERROR, SAVE_ERROR, documents, registration (+3 more)

### Community 7 - "bez-kart"
Cohesion: 0.33
Nodes (5): bez-kart, Scroll snap, Контракт с Mindbox, Локальные изображения, Типографика

### Community 8 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, build:bez-kart, build:bez-kart:new-client, build:bez-kart:regular-1, build:bez-kart:regular-2, build:bez-kart:regular-3, build:s-kartami (+9 more)

### Community 9 - "bez-kart/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, paths, extends, include, ../tsconfig.base.json

### Community 10 - "vite.config.base.ts"
Cohesion: 0.21
Nodes (8): ref_node_url, vite, vite-plugin-monkey, SEGMENT_IDS, createViteConfig(), htmlBuildOutput(), ViteConfigOptions, createVitestConfig()

### Community 11 - "s-kartami/src/segments/segment.types.ts"
Cohesion: 0.08
Nodes (36): vitest, API_DEPENDENT_BLOCKS, bootstrap(), BootstrapOptions, withCardLevelOverride(), withLoadingBlocks(), appendTextWithBreaks(), appendVideo() (+28 more)

### Community 12 - "s-kartami/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, paths, extends, include, ../tsconfig.base.json

### Community 16 - "in-da-club"
Cohesion: 0.25
Nodes (7): in-da-club, Основные команды, Правила безопасного изменения, Проверка сегментов в dev-режиме, Сегменты и артефакты, Структура, Требования и установка

## Knowledge Gaps
- **101 isolated node(s):** `presentation`, `profile`, `registration`, `documents`, `ConsentDocument` (+96 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 125 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `s-kartami/src/segments/segment.types.ts` to `customer-api.ts`, `bez-kart/src/segments/segment.config.ts`, `package.json`, `consents.ts`, `vite.config.base.ts`?**
  _High betweenness centrality (0.242) - this node is a cross-community bridge._
- **Why does `typographed()` connect `typographed` to `customer-api.ts`, `bez-kart/src/segments/segment.config.ts`, `registration-view.ts`, `consents.ts`, `bez-kart`?**
  _High betweenness centrality (0.205) - this node is a cross-community bridge._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **What connects `presentation`, `profile`, `registration` to the rest of the system?**
  _101 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `customer-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09571655208884189 - nodes in this community are weakly interconnected._
- **Should `bez-kart/src/segments/segment.config.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08282828282828283 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._