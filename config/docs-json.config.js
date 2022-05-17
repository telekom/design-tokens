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
const hex = require('wcag-contrast').hex;
const tinycolor = require('tinycolor2');
const pick = require('lodash/pick');
const isEqual = require('lodash/isEqual');
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
      tokens: dictionary.allTokens.map(getDocsShape(dictionary.allTokens)),
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

var levels = {
  FAIL: {
    range: [0, 3],
  },
  AA_LARGE: {
    range: [3, 4.5],
  },
  AA: {
    range: [4.5, 7],
  },
  AAA: {
    range: [7, 22],
  },
};

function getLevel(ratio) {
  for (const [key, value] of Object.entries(levels)) {
    if (ratio > value.range[0] && ratio < value.range[1]) {
      return key;
    }
  }
}

function getContrastCheck(value, path, allTokens) {
  const currentToken = allTokens.find((token) =>
    isEqual(token.path, path.split('.'))
  );
  let contrastRatio;
  if (!currentToken) {
    throw new Error(`Couldn't find token in contrast check for ${path}`);
  }
  const baseValue = tinycolor(value).toHexString();
  const currentTokenValue = tinycolor(currentToken.value).toHexString();
  contrastRatio = hex(baseValue, currentTokenValue);
  const formattedName = humanCase(currentToken.path.slice(1).join(' / '));
  return {
    path: path,
    name: formattedName,
    ratio: contrastRatio,
    level: getLevel(contrastRatio),
  };
}

function getDocsShape(allTokens) {
  return (token) => {
    if (token.type === 'textStyle') {
      // TODO this could be a custom transform
      return {
        pathString: token.path.join('.'),
        ...pick(token, ['path', 'comment']),
        value: {
          fontFamily: token.value['font-family'],
          fontSize: token.value['font-size'],
          fontWeight: token.value['font-weight'],
          lineSpacing: token.value['line-spacing'],
          letterSpacing: token.value['letter-spacing'],
        },
        category: humanCase(token.path[0]),
        section: humanCase(token.path[1]),
        name: humanCase(token.path.slice(1).map(humanCase).join(' / ')),
      };
    }
    return {
      pathString: token.path.join('.'),
      ...pick(token, ['path', 'value', 'comment']),
      category: humanCase(token.path[0]),
      section: humanCase(token.path[1]),
      name: humanCase(token.path.slice(1).map(humanCase).join(' / ')),
      cssVariableName: `--${token.name}`,
      jsPathName: token.path.map(camelCase).join('.'),
      contrastChecks: token.extensions?.telekom?.docs?.contrast.map((path) =>
        getContrastCheck(token.value, path, allTokens)
      ),
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
          filter: (token) => token.path[0] !== 'core',
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
          filter: (token) => token.path[0] !== 'core',
        },
      ],
    },
  },
};
