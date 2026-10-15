# Graph Report - in-da-club  (2026-10-15)

## Corpus Check
- 72 files · ~131,207 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 392 nodes · 885 edges · 24 communities (15 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fd0ffde5`
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
1. `content` - 18 edges
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
- `renderProspectBenefits()` --indirect_call--> `requestCardActivation()`  [INFERRED]
  unified/src/benefits/prospect.ts → unified/src/card-activation/card-activation.ts
- `ClientRouterOptions` --references--> `SegmentId`  [EXTRACTED]
  unified/src/app/client-router.ts → unified/src/segmentation/prospect.types.ts
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
Cohesion: 0.17
Nodes (26): activateBonusAccount(), loadActivatedAccount(), loadIssuedBonusProfile(), registerBonusAccount(), showExistingCard(), renderRegistration(), appendCard(), assetUrl() (+18 more)

### Community 3 - "prospect.types.ts"
Cohesion: 0.06
Nodes (41): DevPreview, getDevPreview(), MEMBER_SEGMENTS, PROSPECT_SEGMENTS, createSkeleton(), renderBlock(), BootstrapOptions, appendAction() (+33 more)

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (18): DOM, ESNext, compilerOptions, esModuleInterop, isolatedModules, lib, module, moduleResolution (+10 more)

### Community 6 - "customer-api.ts"
Cohesion: 0.09
Nodes (36): IssuedBonusProfile, activateCard(), ApiResult, decodeJwtPayload(), getErrorMessage(), getResult(), isRecord(), isSuccess() (+28 more)

### Community 8 - "registration-view.ts"
Cohesion: 0.22
Nodes (17): cities, displayBirthdate(), displayPhone(), formatBirthdate(), isKnownCity(), isValidPhone(), knownCities, parseBirthdate() (+9 more)

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
Cohesion: 0.32
Nodes (12): activeBlocks(), birthdayBlock(), cardBlock(), CASHBACK, cashbackBlock(), clubLaunchBlock(), getSegmentConfig(), inactiveBlocks() (+4 more)

### Community 21 - "display-state.ts"
Cohesion: 0.07
Nodes (39): ClientRouterOptions, createClientRouter(), ReactiveStorage, StorageChangeListener, cachedCustomer, ChangeListener, StorageStub, CardholderDisplayState (+31 more)

### Community 22 - "member.ts"
Cohesion: 0.10
Nodes (29): renderErrorState(), renderLoadingState(), renderUnifiedShell(), API_DEPENDENT_BLOCKS, renderSegment(), RIDE_COUNT, renderMemberBenefits(), withAccumulatedBalance() (+21 more)

### Community 24 - "consents.ts"
Cohesion: 0.27
Nodes (9): request(), requestJson(), withTimeout(), applyConsents(), ConsentDocument, getConsentDocuments(), isConsentDocument(), documents (+1 more)

## Knowledge Gaps
- **95 isolated node(s):** `name`, `private`, `version`, `type`, `node` (+90 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `content` connect `verification-flow.ts` to `prospect.types.ts`, `customer-api.ts`, `registration-view.ts`, `member-config.ts`, `member.ts`, `consents.ts`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `BonusProfile` connect `display-state.ts` to `verification-flow.ts`, `customer-api.ts`, `member.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _95 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `prospect.types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06440677966101695 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `customer-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09061224489795919 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._