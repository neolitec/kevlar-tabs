# Changelog

## [1.6.0](https://github.com/neolitec/kevlar-tabs/compare/v1.5.2...v1.6.0) (2026-08-20)


### Features

* adopt ESLint 10 by replacing eslint-plugin-react ([#133](https://github.com/neolitec/kevlar-tabs/issues/133)) ([1e71df0](https://github.com/neolitec/kevlar-tabs/commit/1e71df0fc5ff414f462245ff47d84eb77a38213f)), closes [#119](https://github.com/neolitec/kevlar-tabs/issues/119)
* build and publish src/styles.scss as dist/styles.css ([#165](https://github.com/neolitec/kevlar-tabs/issues/165)) ([ded4929](https://github.com/neolitec/kevlar-tabs/commit/ded49295484c68e491f35d16346a7c430f7b8060)), closes [#149](https://github.com/neolitec/kevlar-tabs/issues/149)
* build on TypeScript 7 with the side-by-side TS 6 API ([#135](https://github.com/neolitec/kevlar-tabs/issues/135)) ([cd89d63](https://github.com/neolitec/kevlar-tabs/commit/cd89d63a128b0221a48073ec02264f7e530828f9))
* mirror the horizontal arrow keys in right-to-left writing modes ([#191](https://github.com/neolitec/kevlar-tabs/issues/191)) ([852909b](https://github.com/neolitec/kevlar-tabs/commit/852909ba69a638900509d5ec6a0f54ebd10076e5)), closes [#153](https://github.com/neolitec/kevlar-tabs/issues/153)
* support a vertical orientation for the tab list ([#185](https://github.com/neolitec/kevlar-tabs/issues/185)) ([2832355](https://github.com/neolitec/kevlar-tabs/commit/28323551ffec7292afa3e824b20c458e1305afc0))
* support React 19 ([#113](https://github.com/neolitec/kevlar-tabs/issues/113)) ([87110c5](https://github.com/neolitec/kevlar-tabs/commit/87110c53d27bc0be13f11ab9fa11bc952f9c9e8f))


### Bug Fixes

* activate tabs with Enter and Space in autoActivate mode ([#173](https://github.com/neolitec/kevlar-tabs/issues/173)) ([a65d7be](https://github.com/neolitec/kevlar-tabs/commit/a65d7be2add9922bed1eb1d954e7feca9ab6e2e0)), closes [#140](https://github.com/neolitec/kevlar-tabs/issues/140)
* add 'use client' directive for React Server Components ([#168](https://github.com/neolitec/kevlar-tabs/issues/168)) ([5dbfc94](https://github.com/neolitec/kevlar-tabs/commit/5dbfc94e3e48d971e6b55c194005f7d1b9df0d76)), closes [#146](https://github.com/neolitec/kevlar-tabs/issues/146)
* correct build:clean script and remove dead childrenDeepMap helper ([#163](https://github.com/neolitec/kevlar-tabs/issues/163)) ([3008c37](https://github.com/neolitec/kevlar-tabs/commit/3008c37911a10b568a6910a23dd8ca368243864d))
* declare sideEffects to enable tree-shaking, keeping CSS exempt ([#176](https://github.com/neolitec/kevlar-tabs/issues/176)) ([c833a70](https://github.com/neolitec/kevlar-tabs/commit/c833a70b16fba3ab4dea84aafbc09a2af639d0d7)), closes [#148](https://github.com/neolitec/kevlar-tabs/issues/148)
* **docs:** inline the Astro tsconfig preset to stop the root-level noise ([#132](https://github.com/neolitec/kevlar-tabs/issues/132)) ([53b2e33](https://github.com/neolitec/kevlar-tabs/commit/53b2e336f8ef19d0f27be674310b17f71792eda5)), closes [#126](https://github.com/neolitec/kevlar-tabs/issues/126)
* fall back to the first non-disabled tab when selected is invalid ([#169](https://github.com/neolitec/kevlar-tabs/issues/169)) ([c27c8d5](https://github.com/neolitec/kevlar-tabs/commit/c27c8d59fb9ab31d42def8f6dd5ea580b9bf7bc5)), closes [#145](https://github.com/neolitec/kevlar-tabs/issues/145)
* handle Home and End keys in the tab list ([#172](https://github.com/neolitec/kevlar-tabs/issues/172)) ([3fa1f3e](https://github.com/neolitec/kevlar-tabs/commit/3fa1f3ea0889de9da1c8e83f669532d0a6f44479))
* make TabPanel keyboard-focusable with a default tabIndex of 0 ([#171](https://github.com/neolitec/kevlar-tabs/issues/171)) ([7310979](https://github.com/neolitec/kevlar-tabs/commit/73109792d3194f64a31dc891a0e5c8e86b50e069)), closes [#141](https://github.com/neolitec/kevlar-tabs/issues/141)
* remove tabIndex from the tablist so it is not a tab stop ([#170](https://github.com/neolitec/kevlar-tabs/issues/170)) ([c1006e8](https://github.com/neolitec/kevlar-tabs/commit/c1006e8a932d59eae1fdb9865a3fea764918d7c9)), closes [#138](https://github.com/neolitec/kevlar-tabs/issues/138)
* repair the docs build and close the gap that let it break ([#103](https://github.com/neolitec/kevlar-tabs/issues/103)) ([83ff28a](https://github.com/neolitec/kevlar-tabs/commit/83ff28a0f889dddc102058d89849c50ab6cc2d0e))
* restrict the published tarball to dist via a files field ([#166](https://github.com/neolitec/kevlar-tabs/issues/166)) ([9db3191](https://github.com/neolitec/kevlar-tabs/commit/9db319116270282956eba2ddf515ca4c49f2cb79)), closes [#147](https://github.com/neolitec/kevlar-tabs/issues/147)
* rewrite dist declarations with explicit .js extensions for node16 resolution ([#175](https://github.com/neolitec/kevlar-tabs/issues/175)) ([79c7881](https://github.com/neolitec/kevlar-tabs/commit/79c788186eff75841acd09c0d4b0a5c7768e2c9d)), closes [#167](https://github.com/neolitec/kevlar-tabs/issues/167)
* stop reading refs during render and syncing props via an effect ([#122](https://github.com/neolitec/kevlar-tabs/issues/122)) ([adc724e](https://github.com/neolitec/kevlar-tabs/commit/adc724e6a45bd5c466ca70ecb69b8e4a04fa1287))
* unbreak the Ladle dev server by dropping the root react plugin ([#129](https://github.com/neolitec/kevlar-tabs/issues/129)) ([954bc66](https://github.com/neolitec/kevlar-tabs/commit/954bc66e8fb9882046ad7122d0ebcd356478a6fa))

## [1.5.2](https://github.com/neolitec/kevlar-tabs/compare/v1.5.1...v1.5.2) (2024-10-04)


### Bug Fixes

* fix release job ([2949356](https://github.com/neolitec/kevlar-tabs/commit/294935667f42cba95d770df198584ba9736d5c42))

## [1.5.1](https://github.com/neolitec/kevlar-tabs/compare/v1.5.0...v1.5.1) (2024-10-04)


### Bug Fixes

* tab deletion ([e65c12e](https://github.com/neolitec/kevlar-tabs/commit/e65c12e1187cc6f636eca0702a39f0d2eae86b95))

## [1.5.0](https://github.com/neolitec/kevlar-tabs/compare/v1.4.0...v1.5.0) (2023-03-07)


### Miscellaneous Chores

* trigger 1.5.0 ([1021e6b](https://github.com/neolitec/kevlar-tabs/commit/1021e6b7ac5f3f69cf8fc43317923db151770809))

## [1.4.0](https://github.com/neolitec/kevlar-tabs/compare/v1.3.0...v1.4.0) (2023-02-21)


### Features

* add focus on init ([1a3c68b](https://github.com/neolitec/kevlar-tabs/commit/1a3c68b684f44eaf9648c1fadde098e3d834ddcc))

## [1.3.0](https://github.com/neolitec/kevlar-tabs/compare/v1.2.0...v1.3.0) (2023-02-10)


### Features

* fix programmatically hidden tab ([4b3a019](https://github.com/neolitec/kevlar-tabs/commit/4b3a019ea7c2310beaf1bf001ed3bda369766f46))

## [1.2.0](https://github.com/neolitec/kevlar-tabs/compare/v1.1.0...v1.2.0) (2023-01-18)


### Miscellaneous Chores

* remove pnpm from engines ([89231d9](https://github.com/neolitec/kevlar-tabs/commit/89231d9f9f21b62dcb4e3167ecf334b4d99194be))

## [1.1.0](https://github.com/neolitec/kevlar-tabs/compare/v1.0.1...v1.1.0) (2022-12-08)


### Miscellaneous Chores

* trigger release ([#31](https://github.com/neolitec/kevlar-tabs/issues/31)) ([17f083b](https://github.com/neolitec/kevlar-tabs/commit/17f083be485efa3b1034453812510b704a041dcb))

## [1.0.1](https://github.com/neolitec/kevlar-tabs/compare/v1.0.0...v1.0.1) (2022-12-08)


### Bug Fixes

* avoid reset selected tab when children update ([#25](https://github.com/neolitec/kevlar-tabs/issues/25)) ([843ce81](https://github.com/neolitec/kevlar-tabs/commit/843ce81a49b1d605a09debe3b145696dd3d5c8f8))

## [1.0.0](https://github.com/neolitec/kevlar-tabs/compare/v0.0.6...v1.0.0) (2022-12-07)


### Bug Fixes

* allow tabs styling ([#23](https://github.com/neolitec/kevlar-tabs/issues/23)) ([a590c88](https://github.com/neolitec/kevlar-tabs/commit/a590c887c87e789adc7196d9fcae6981541f28ac))

## [0.0.6](https://github.com/neolitec/kevlar-tabs/compare/v0.0.5...v0.0.6) (2022-12-04)


### Features

* allow auto activation disabling ([#21](https://github.com/neolitec/kevlar-tabs/issues/21)) ([5070b0b](https://github.com/neolitec/kevlar-tabs/commit/5070b0b7593a60358426423f5f93c3606fb81965))

## [0.0.5](https://github.com/neolitec/kevlar-tabs/compare/v0.0.4...v0.0.5) (2022-12-04)


### Features

* improve lazy loading ([#19](https://github.com/neolitec/kevlar-tabs/issues/19)) ([2270034](https://github.com/neolitec/kevlar-tabs/commit/2270034780f1515ce7d29e116fa7010a42e5deb3))

## [0.0.4](https://github.com/neolitec/kevlar-tabs/compare/v0.0.3...v0.0.4) (2022-12-03)


### Features

* add styled-components compliance ([#17](https://github.com/neolitec/kevlar-tabs/issues/17)) ([543c0cf](https://github.com/neolitec/kevlar-tabs/commit/543c0cfe51bbb7a32c248d050d85800d7961c943))

## [0.0.3](https://github.com/neolitec/kevlar-tabs/compare/v0.0.2...v0.0.3) (2022-11-21)


### Features

* customizable class names ([3b495cf](https://github.com/neolitec/kevlar-tabs/commit/3b495cf0452a43f7cfb42b506786cb55fe880ee7))


### Bug Fixes

* exclude tests folder from build ([42ae4f7](https://github.com/neolitec/kevlar-tabs/commit/42ae4f721cf3594f2244e0d9f1d24555b5109184))

## [0.0.2](https://github.com/neolitec/kevlar-tabs/compare/v0.0.1...v0.0.2) (2022-11-20)


### Miscellaneous Chores

* force publish 0.0.2 ([dceba72](https://github.com/neolitec/kevlar-tabs/commit/dceba72395bfd2ea04b93f596f8ae93ccf137008))

## 0.0.1 (2022-11-20)


### Miscellaneous Chores

* initial commit ([9187b52](https://github.com/neolitec/kevlar-tabs/commit/9187b52ed6fd527969af60ad71e38432448dcec3))
