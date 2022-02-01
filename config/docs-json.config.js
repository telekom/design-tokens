/**
 * Telekom Design Tokens https://github.com/telekom/design-tokens
 *
 * Copyright (c) 2021 Lukas Oppermann and contributors, Deutsche Telekom AG
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
const StyleDictionary = require('style-dictionary');
const pick = require('lodash/pick');
const camelCase = require('lodash/camelCase');
const { humanCase } = require('./shared');

const { PREFIX, OUTPUT_PATH, OUTPUT_BASE_FILENAME } = process.env;
const WHITELABEL = process.env.WHITELABEL !== 'false';

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

StyleDictionary.registerFormat({
  name: 'json/docs',
  formatter: function ({ dictionary }) {
    const output = {
      tokens: dictionary.allTokens.map(getDocsShape()),
    };
    return JSON.stringify(output, null, 2);
  },
});

/**
 * {
 *   name: 'Link / Hovered',
 *   section: 'Text & Icon',
 *   cssVariableName: '--telekom-color-text-and-icon-standard',
 *   javascriptVariableName: 'color.foo.bar',
 *   value: '#000000',
 *   comment: '...'
 * },
 */
function getDocsShape() {
  return (token) => {
    return {
      ...pick(token, ['path', 'value', 'comment']),
      category: humanCase(token.path[0]),
      section: humanCase(token.path[1]),
      name: humanCase(token.path.slice(1).map(humanCase).join(' / ')),
      cssVariableName: `--${token.name}`,
      jsPathName: token.path.map(camelCase).join('.'),
    };
  };
}

module.exports = {
  include: ['src/core/**/*.json5'],
  source: [
    ...(WHITELABEL === false ? ['src/telekom/core/**.json5'] : []),
    'src/semantic/**/*.json5',
  ],
  platforms: {
    docsJsonLight: {
      transforms: ['mode-light', ...cssTransformGroup, 'shadow/css'],
      prefix: PREFIX,
      buildPath: OUTPUT_PATH + 'docs-json/',
      files: [
        {
          destination: OUTPUT_BASE_FILENAME + '.light.json',
          format: 'json/docs',
          filter: (token) =>
            token.path[0] !== 'core' && token.type !== 'textStyle',
        },
      ],
    },
    docsJsonDark: {
      transforms: ['mode-dark', ...cssTransformGroup, 'shadow/css'],
      prefix: PREFIX,
      buildPath: OUTPUT_PATH + 'docs-json/',
      files: [
        {
          destination: OUTPUT_BASE_FILENAME + '.dark.json',
          format: 'json/docs',
          filter: (token) =>
            token.path[0] !== 'core' &&
            token.original.value?.dark != null &&
            token.type !== 'textStyle',
        },
      ],
    },
  },
};
