# Graph Report - in-da-club  (2026-11-10)

## Corpus Check
- 77 files · ~95,464 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 405 nodes · 927 edges · 24 communities (15 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `83f06586`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- verification-flow.ts
- promotion_terms
- bez_kart_src_styles_main
- prospect.types.ts
- unified_src_segments
- compilerOptions
- customer-api.ts
- registration-view.ts
- package.json
- vite.config.base.ts
- unified_src_styles_main
- typograf.mjs
- vite-env.d.ts
- activation-sequence.test.ts
- ref_node_fs
- in-da-club
- tsconfig.json
- member-config.ts
- s_kartami_src_styles_main
- display-state.ts
- member.ts
- unified_src_segmentation_promotion_terms
- consents.ts

## God Nodes (most connected - your core abstractions)
1. `content` - 19 edges
2. `compilerOptions` - 16 edges
3. `textToSafeHtml()` - 16 edges
4. `getStoredProfile()` - 14 edges
5. `createClientRouter()` - 12 edges
6. `requestCardActivation()` - 12 edges
7. `renderVerification()` - 12 edges
8. `renderMemberBenefits()` - 11 edges
9. `renderBlock()` - 10 edges
10. `refreshUser()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `BootstrapOptions` --references--> `SegmentId`  [EXTRACTED]
  unified/src/benefits/prospect.ts → unified/src/segmentation/prospect.types.ts
- `renderProspectBenefits()` --indirect_call--> `requestCardActivation()`  [INFERRED]
  unified/src/benefits/prospect.ts → unified/src/card-activation/card-activation.ts
- `renderLoadingState()` --calls--> `getSegmentConfig()`  [EXTRACTED]
  unified/src/app/render-state.ts → unified/src/segmentation/member-config.ts
- `renderErrorState()` --calls--> `appendTextWithBreaks()`  [EXTRACTED]
  unified/src/app/render-state.ts → unified/src/shared/runtime/text.ts
- `renderMemberBenefits()` --calls--> `getSegmentConfig()`  [EXTRACTED]
  unified/src/benefits/member.ts → unified/src/segmentation/member-config.ts

## Import Cycles
- None detected.

## Communities (24 total, 9 thin omitted)

### Community 0 - "verification-flow.ts"
Cohesion: 0.15
Nodes (34): activateBonusAccount(), IssuedBonusProfile, loadActivatedAccount(), loadIssuedBonusProfile(), registerBonusAccount(), openPopup(), rememberFirstStepHeight(), requestCardActivation() (+26 more)

### Community 3 - "prospect.types.ts"
Cohesion: 0.07
Nodes (38): createSkeleton(), renderBlock(), BootstrapOptions, appendAction(), appendBadge(), appendDescription(), appendHeadingOrValue(), renderBlock() (+30 more)

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (18): DOM, ESNext, compilerOptions, esModuleInterop, isolatedModules, lib, module, moduleResolution (+10 more)

### Community 6 - "customer-api.ts"
Cohesion: 0.09
Nodes (27): activateCard(), ApiResult, decodeJwtPayload(), getErrorMessage(), getResult(), isRecord(), isSuccess(), postJson() (+19 more)

### Community 8 - "registration-view.ts"
Cohesion: 0.21
Nodes (18): cities, displayBirthdate(), displayPhone(), formatBirthdate(), isKnownCity(), isValidPhone(), knownCities, normalizePhone() (+10 more)

### Community 9 - "package.json"
Cohesion: 0.06
Nodes (32): jsdom, dependencies, reactive-localstorage, scroll-lock, devDependencies, jsdom, sass, typescript (+24 more)

### Community 10 - "vite.config.base.ts"
Cohesion: 0.27
Nodes (6): ref_node_url, BUILD_MODES, createViteConfig(), htmlBuildOutput(), ViteConfigOptions, createVitestConfig()

### Community 12 - "typograf.mjs"
Cohesion: 0.33
Nodes (3): ref_node_path, sourceRoot, typograf

### Community 16 - "in-da-club"
Cohesion: 0.22
Nodes (8): Dev-preview, in-da-club, Production, Архитектура, Команды, Проверка изменений, Стили, Требования и установка

### Community 17 - "tsconfig.json"
Cohesion: 0.29
Nodes (6): src, ../tsconfig.base.json, compilerOptions, paths, extends, include

### Community 18 - "member-config.ts"
Cohesion: 0.18
Nodes (15): activeBlocks(), birthdayBlock(), cardBlock(), CASHBACK, cashbackBlock(), clubLaunchBlock(), getSegmentConfig(), inactiveBlocks() (+7 more)

### Community 21 - "display-state.ts"
Cohesion: 0.08
Nodes (41): createMainBlockShowTracker(), getMainBlockShowGoal(), Goal, IntersectionObserverStub, YandexMetrika, ClientRouterOptions, createClientRouter(), ReactiveStorage (+33 more)

### Community 22 - "member.ts"
Cohesion: 0.09
Nodes (31): DevPreview, getDevPreview(), MEMBER_SEGMENTS, PROSPECT_SEGMENTS, renderErrorState(), renderLoadingState(), renderUnifiedShell(), API_DEPENDENT_BLOCKS (+23 more)

### Community 24 - "consents.ts"
Cohesion: 0.27
Nodes (9): request(), requestJson(), withTimeout(), applyConsents(), ConsentDocument, getConsentDocuments(), isConsentDocument(), documents (+1 more)

## Knowledge Gaps
- **97 isolated node(s):** `name`, `private`, `version`, `type`, `node` (+92 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `content` connect `verification-flow.ts` to `prospect.types.ts`, `customer-api.ts`, `registration-view.ts`, `member-config.ts`, `member.ts`, `consents.ts`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `BonusProfile` connect `display-state.ts` to `verification-flow.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _97 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `verification-flow.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1461609620721554 - nodes in this community are weakly interconnected._
- **Should `prospect.types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07077922077922078 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `customer-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0945945945945946 - nodes in this community are weakly interconnected._