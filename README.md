# Telekom Design Tokens

Telekom Design Tokens is the source of truth for designing Telekom-branded digital products. By default, it's built to align with our corporate brand and design but allows for customization to fit your particular product.

![Design Tokens badge](https://img.shields.io/badge/telekom-design--tokens-e20074.svg) [![License: MPL-2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](./LICENSE) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/telekom/design-tokens.svg?style=flat-square) ![GitHub repo size](https://img.shields.io/github/repo-size/telekom/design-tokens.svg?style=flat-square) ![GitHub package.json version
](https://img.shields.io/github/package-json/v/telekom/design-tokens)

# Customizing Telekom Design Tokens for open source software

Although the source code for Telekom Design Tokens is free and available under the MPL 2.0 License, Deutsche Telekom fully reserves all rights to the Telekom brand. To prevent users from getting confused about the source of a digital product or experience, there are strict restrictions on using the Telekom brand and design, even when built into code that we provide. For any customization other than explicitly for the Telekom, you must replace the Deutsche Telekom default theme.

To use Telekom Design Tokens as open source software and customize it with a neutral theme, please follow the instructions for our [open source version](#open-source-version).

## Open source version

By following the instructions for the open source version, you obtain source code/packages that use a neutral theme and are fully covered by the MPL-2.0 License.

### Using the source code directly

If you want to use the source code, remove the following folders. These folders contain all the protected brand and design assets of the Telekom and are not available under the MPL-2.0 License:

| Folder                                     | Content                    |
| ------------------------------------------ | -------------------------- |
| src/telekom                                | Telekom tokens             |

### Setup with NPM

```
npm install @telekom/design-tokens
```

**Do not** use or import any files inside the `dist/telekom` folder.

## Telekom version

Please note that the use of the Telekom brand and design assets – including but not limited to the logos, the color magenta, the typeface and icons, as well as the footer and header components – are not available for free use and require Deutsche Telekom's express permission for use in commerce.

### Using the source code directly

Simply clone/download this repository and use the source code as is.

### Setup with NPM

```
npm install @telekom/design-tokens
```

Import or use files inside the `dist/telekom` folder, e.g.:

```css
@import url('@telekom/design-tokens/dist/telekom/css/telekom-design-tokens.all.css');
```

# Contributing

## Code of conduct

This project has adopted the [Contributor Covenant](https://www.contributor-covenant.org/) in version 2.0 as our code of conduct. Please see the details in our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). All contributors must abide by the code of conduct.

## How to contribute

We always welcome and encourage contributions and feedback. For more information on how to contribute, the project structure, as well as additional information, see our [Contribution Guidelines](./CONTRIBUTING.md). By participating in this project, you agree to abide by its [Code of Conduct](./CODE_OF_CONDUCT.md) at all times.

## Contributors

Our commitment to open source means that we are enabling - even encouraging - all interested parties to contribute and become part of its developer community.

# Licensing

Copyright (c) 2021 Lukas Oppermann and contributors, Deutsche Telekom AG

Licensed under the **Mozilla Public License 2.0 (MPL-2.0)** (the "License"); you may not use this file except in compliance with the License.

You may obtain a copy of the License by reviewing the file [LICENSE](./LICENSE) in the repository.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the [LICENSE](./LICENSE) for the specific language governing permissions and limitations under the License.
