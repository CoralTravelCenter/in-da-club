# Graph Report - in-da-club  (2026-09-22)

## Corpus Check
- 60 files · ~174,937 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: .scss 18, (none) 3)

## Summary
- 339 nodes · 696 edges · 15 communities (14 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cc96644c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- typographed
- customer-context.ts
- bez-kart/src/segments/segment.config.ts
- package.json
- compilerOptions
- customer-api.ts
- bez-kart
- Анализ проекта `in-da-club`
- bez-kart/tsconfig.json
- Design QA — inactive segment
- s-kartami/src/segments/segment.config.ts
- s-kartami/tsconfig.json
- shared/vite-env.d.ts
- vite-config.ts
- in-da-club

## God Nodes (most connected - your core abstractions)
1. `typographed()` - 42 edges
2. `scripts` - 17 edges
3. `compilerOptions` - 16 edges
4. `vitest` - 14 edges
5. `renderVerification()` - 13 edges
6. `requestCardActivation()` - 12 edges
7. `renderRegistration()` - 12 edges
8. `renderBlock()` - 11 edges
9. `getBonusProfile()` - 11 edges
10. `refreshUser()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Типографика` --references--> `typographed()`  [INFERRED]
  bez-kart/README.md → shared/typography.ts
- `Сильные стороны` --references--> `typographed()`  [INFERRED]
  PROJECT_ANALYSIS.md → shared/typography.ts
- ``bez-kart`` --references--> `requestCardActivation()`  [INFERRED]
  PROJECT_ANALYSIS.md → bez-kart/src/card-activation/card-activation.ts
- ``bez-kart`` --references--> `typographed()`  [INFERRED]
  PROJECT_ANALYSIS.md → shared/typography.ts
- ``s-kartami`` --references--> `requestBonusProfile()`  [INFERRED]
  PROJECT_ANALYSIS.md → s-kartami/src/segments/bonus-profile.ts

## Import Cycles
- None detected.

## Communities (15 total, 1 thin omitted)

### Community 0 - "typographed"
Cohesion: 0.13
Nodes (41): appendCard(), assetUrl(), showExistingCardResult(), showRefreshRequiredResult(), showSuccessResult(), ACTIVATION_DIALOG_ID, CoralPopupElement, createDialog() (+33 more)

### Community 1 - "customer-context.ts"
Cohesion: 0.23
Nodes (14): `s-kartami`, asNumber(), asString(), BonusProfile, normalizeBonusProfile(), normalizeCardLevel(), requestBonusProfile(), getCachedCustomerContext() (+6 more)

### Community 2 - "bez-kart/src/segments/segment.config.ts"
Cohesion: 0.07
Nodes (36): bootstrap(), BootstrapOptions, appendAction(), appendBadge(), appendDescription(), appendHeadingOrValue(), appendTextWithLineBreaks(), appendVideo() (+28 more)

### Community 3 - "package.json"
Cohesion: 0.05
Nodes (39): dependencies, petite-vue, scroll-lock, devDependencies, jsdom, sass, typescript, typograf (+31 more)

### Community 5 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, esModuleInterop, isolatedModules, lib, module, moduleResolution, noEmit, noImplicitReturns (+8 more)

### Community 6 - "customer-api.ts"
Cohesion: 0.09
Nodes (31): profile, TestPopup, ConsentDocument, getConsentDocuments(), isConsentDocument(), LOAD_ERROR, SAVE_ERROR, documents (+23 more)

### Community 7 - "bez-kart"
Cohesion: 0.33
Nodes (5): bez-kart, Scroll snap, Контракт с Mindbox, Локальные изображения, Типографика

### Community 8 - "Анализ проекта `in-da-club`"
Cohesion: 0.10
Nodes (17): `bez-kart`, Анализ проекта `in-da-club`, Артефакты анализа, Архитектура и потоки данных, Карта основных зависимостей, Назначение проекта, Общая оболочка, Основа и границы анализа (+9 more)

### Community 9 - "bez-kart/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, paths, extends, include, ../tsconfig.base.json

### Community 10 - "Design QA — inactive segment"
Cohesion: 0.25
Nodes (7): Comparison history, Design QA — inactive segment, Findings, Focused comparison evidence, Follow-up polish, Full-view comparison evidence, Verification

### Community 11 - "s-kartami/src/segments/segment.config.ts"
Cohesion: 0.09
Nodes (32): scroll-lock, API_DEPENDENT_BLOCKS, bootstrap(), BootstrapOptions, withLoadingBlocks(), appendTextWithBreaks(), appendVideo(), createTooltip() (+24 more)

### Community 12 - "s-kartami/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, paths, extends, include, ../tsconfig.base.json

### Community 14 - "vite-config.ts"
Cohesion: 0.24
Nodes (6): ref_node_url, vite, htmlBuildOutput(), createViteConfig(), ViteConfigOptions, createVitestConfig()

### Community 16 - "in-da-club"
Cohesion: 0.15
Nodes (11): in-da-club, Основные команды, Правила безопасного изменения, Сегменты и артефакты, Структура, Требования и установка, s-kartami, Контракт с Mindbox (+3 more)

## Knowledge Gaps
- **111 isolated node(s):** `presentation`, `profile`, `registration`, `documents`, `ConsentDocument` (+106 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 137 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `typographed()` connect `typographed` to `bez-kart/src/segments/segment.config.ts`, `customer-api.ts`, `bez-kart`, `Анализ проекта `in-da-club``, `s-kartami/src/segments/segment.config.ts`?**
  _High betweenness centrality (0.223) - this node is a cross-community bridge._
- **Why does `vitest` connect `bez-kart/src/segments/segment.config.ts` to `customer-context.ts`, `package.json`, `customer-api.ts`, `s-kartami/src/segments/segment.config.ts`, `vite-config.ts`?**
  _High betweenness centrality (0.212) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `typographed()` (e.g. with `Типографика` and ``bez-kart``) actually correct?**
  _`typographed()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `presentation`, `profile`, `registration` to the rest of the system?**
  _111 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `typographed` be split into smaller, more focused modules?**
  _Cohesion score 0.12627450980392158 - nodes in this community are weakly interconnected._
- **Should `bez-kart/src/segments/segment.config.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06966618287373004 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._