/**
 * Telekom Design Tokens https://github.com/telekom/design-tokens
 *
 * Copyright (c) 2021 Lukas Oppermann and contributors, Deutsche Telekom AG
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const fs = require('fs-extra');
const StyleDictionary = require('style-dictionary');

const { PREFIX, OUTPUT_PATH, OUTPUT_BASE_FILENAME } = process.env;
const WHITELABEL = process.env.WHITELABEL !== 'false';

/*
  TODO
  - [ ] text styles: split into separate variables, plus maybe add css classes?
*/

// Use custom 'name/cti/kebab2' plus 'color/alpha'
const cssTransformGroup = [
  'attribute/cti',
  'name/cti/kebab2',
  'time/seconds',
  'content/icon',
  'size/rem',
  'color/alpha',
  'color/css',
];

StyleDictionary.registerAction({
  name: 'bundle_css',
  do: async function (_, config) {
    const { buildPath } = config;
    try {
      const light = await fs.readFile(
        buildPath + OUTPUT_BASE_FILENAME + '.css'
      );
      const dark = await fs.readFile(
        buildPath + OUTPUT_BASE_FILENAME + '.dark.css'
      );
      await fs.writeFile(
        buildPath + OUTPUT_BASE_FILENAME + '.all.css',
        light + '\n' + dark
      );
    } catch (err) {
      // ..
    }
  },
  undo: async function () {
    //
  },
});

module.exports = {
  include: ['src/core/**/*.json5'],
  source: [
    ...(WHITELABEL === false ? ['src/telekom/core/**.json5'] : []),
    'src/semantic/**/*.json5',
  ],
  platforms: {
    css: {
      transforms: ['mode-light', ...cssTransformGroup, 'shadow/css'],
      prefix: PREFIX,
      buildPath: OUTPUT_PATH + 'css/',
      files: [
        {
          destination: OUTPUT_BASE_FILENAME + '.css',
          format: 'css/variables',
          filter: (token) =>
            token.path[0] !== 'core' && token.type !== 'textStyle',
          options: {
            selector: ':root, [data-mode="light"]',
          },
        },
      ],
    },
    cssDark: {
      transforms: ['mode-dark', ...cssTransformGroup, 'shadow/css'],
      prefix: PREFIX,
      buildPath: OUTPUT_PATH + 'css/',
      files: [
        {
          destination: OUTPUT_BASE_FILENAME + '.dark.css',
          format: 'css/variables',
          filter: (token) =>
            token.path[0] !== 'core' &&
            token.original.value?.dark != null &&
            token.type !== 'textStyle',
          options: {
            selector: '[data-mode="dark"]',
          },
        },
      ],
      actions: ['bundle_css'],
    },
  },
};
