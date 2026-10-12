# Graph Report - in-da-club  (2026-10-07)

## Corpus Check
- 65 files · ~89,521 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .scss 21, (none) 2)

## Summary
- 370 nodes · 811 edges · 23 communities (16 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f271a651`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- typographed
- promotion_terms
- bez_kart_src_styles_main
- package.json
- unified_src_segments
- compilerOptions
- customer-api.ts
- prospect-config.ts
- scripts
- devDependencies
- vite.config.base.ts
- vitest
- typograf.mjs
- vite-env.d.ts
- dependencies
- vitest.config.base.ts
- in-da-club
- tsconfig.json
- member-config.ts
- s_kartami_src_styles_main
- client-router.ts
- mindbox.ts

## God Nodes (most connected - your core abstractions)
1. `typographed()` - 42 edges
2. `vitest` - 22 edges
3. `compilerOptions` - 16 edges
4. `renderRegistration()` - 13 edges
5. `renderVerification()` - 13 edges
6. `requestCardActivation()` - 12 edges
7. `renderBlock()` - 11 edges
8. `getBonusProfile()` - 11 edges
9. `getProfile()` - 11 edges
10. `createClientRouter()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `renderProspectBenefits()` --indirect_call--> `requestCardActivation()`  [INFERRED]
  unified/src/benefits/prospect.ts → unified/src/card-activation/card-activation.ts
- `ClientRouterOptions` --references--> `CustomerContext`  [EXTRACTED]
  unified/src/app/client-router.ts → unified/src/segmentation/member.types.ts
- `ClientRouterOptions` --references--> `SegmentId`  [EXTRACTED]
  unified/src/app/client-router.ts → unified/src/segmentation/prospect.types.ts
- `renderUnifiedShell()` --calls--> `typographed()`  [EXTRACTED]
  unified/src/app/render-state.ts → unified/src/shared/runtime/typography.ts
- `renderLoadingState()` --calls--> `renderSegment()`  [EXTRACTED]
  unified/src/app/render-state.ts → unified/src/benefits/member/render-segment.ts

## Import Cycles
- None detected.

## Communities (23 total, 7 thin omitted)

### Community 0 - "typographed"
Cohesion: 0.12
Nodes (42): openPopup(), rememberFirstStepHeight(), requestCardActivation(), showExistingCard(), cities, formatBirthdate(), getProfile(), UserProfile (+34 more)

### Community 3 - "package.json"
Cohesion: 0.18
Nodes (10): engines, node, name, private, type, version, jsdom, petite-vue (+2 more)

### Community 5 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, esModuleInterop, isolatedModules, lib, module, moduleResolution, noEmit, noImplicitReturns (+8 more)

### Community 6 - "customer-api.ts"
Cohesion: 0.07
Nodes (35): initialProfile, TestPopup, activateCard(), ApiResult, BonusProfile, decodeJwtPayload(), DEFAULT_REQUEST_ERROR, getBonusProfile() (+27 more)

### Community 7 - "prospect-config.ts"
Cohesion: 0.08
Nodes (33): DevPreview, getDevPreview(), MEMBER_SEGMENTS, PROSPECT_SEGMENTS, BootstrapOptions, appendAction(), appendBadge(), appendDescription() (+25 more)

### Community 8 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, test, typecheck, typograf

### Community 9 - "devDependencies"
Cohesion: 0.25
Nodes (8): devDependencies, jsdom, sass, typescript, typograf, vite, vite-plugin-monkey, vitest

### Community 10 - "vite.config.base.ts"
Cohesion: 0.28
Nodes (7): vite, vite-plugin-monkey, BUILD_MODES, createViteConfig(), htmlBuildOutput(), PRODUCTION_ASSETS_BASE, ViteConfigOptions

### Community 11 - "vitest"
Cohesion: 0.09
Nodes (32): reactive-localstorage, vitest, EXPECTED_SCRIPT_NAMES, appendTextWithBreaks(), renderErrorState(), renderLoadingState(), renderUnifiedShell(), API_DEPENDENT_BLOCKS (+24 more)

### Community 12 - "typograf.mjs"
Cohesion: 0.25
Nodes (6): ref_node_fs, ref_node_path, typograf, collectTypeScriptFiles(), sourceRoot, typograf

### Community 14 - "dependencies"
Cohesion: 0.50
Nodes (4): dependencies, petite-vue, reactive-localstorage, scroll-lock

### Community 16 - "in-da-club"
Cohesion: 0.25
Nodes (7): in-da-club, Артефакт, Основные команды, Правила безопасного изменения, Проверка сегментов в dev-режиме, Структура, Требования и установка

### Community 17 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): ../tsconfig.base.json, compilerOptions, paths, extends, include

### Community 18 - "member-config.ts"
Cohesion: 0.10
Nodes (29): scroll-lock, appendTextWithBreaks(), appendVideo(), createSkeleton(), createTooltip(), renderBlock(), presentation, renderSegment() (+21 more)

### Community 21 - "client-router.ts"
Cohesion: 0.11
Nodes (20): ClientRouterOptions, createClientRouter(), DisplayContext, ErrorDetails, FailedRequest, getErrorDetails(), isLoggedIn(), ReactiveStorage (+12 more)

### Community 22 - "mindbox.ts"
Cohesion: 0.21
Nodes (11): BonusAccountDateField, BonusAccountStatus, Mindbox, MINDBOX_RETRY_DELAYS_MS, MindboxMode, MindboxOperation, MindboxPayload, pendingRegistrations (+3 more)

## Knowledge Gaps
- **102 isolated node(s):** `name`, `private`, `version`, `type`, `node` (+97 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 139 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `package.json`, `customer-api.ts`, `prospect-config.ts`, `vitest.config.base.ts`, `member-config.ts`, `client-router.ts`, `mindbox.ts`?**
  _High betweenness centrality (0.296) - this node is a cross-community bridge._
- **Why does `typographed()` connect `typographed` to `member-config.ts`, `vitest`, `customer-api.ts`, `prospect-config.ts`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _102 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `typographed` be split into smaller, more focused modules?**
  _Cohesion score 0.1229260935143288 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `customer-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06988120195667366 - nodes in this community are weakly interconnected._