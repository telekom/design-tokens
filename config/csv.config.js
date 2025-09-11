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
const { humanCase } = require('./shared');

const { OUTPUT_PATH, OUTPUT_BASE_FILENAME } = process.env;
const WHITELABEL = process.env.WHITELABEL !== 'false';
const SEPARATOR = ';';

const cssTransformGroup = [
  'time/seconds',
  'content/icon',
  'size/px',
  // 'modular-scale/px',
  'color/alpha-hex',
  'color/css',
  'text-style/css',
  // 'cubic-bezier/css',
  'shadow/css',
];

function stringifyObjectValue(value, token) {
  if (typeof value === 'string') {
    return value;
  }
  if (token.type === 'shadow') {
    return value
      .map(
        (x) =>
          `${x.x}px ${x.y}px ${x.blur}px ${x.spread}px (${x.color.color} / ${x.color.alpha})`
      )
      .join(', ');
  }
  if (token.type === 'textStyle') {
    // TODO use proper CSS shorthand
    return `${value['font-family']} ${value['font-size']} ${value['font-weight']} ${value['line-spacing']} ${value['letter-spacing']}`;
  }
  if (token.type === 'color' && value.alpha !== undefined) {
    return `${value.color} / ${value.alpha}`;
  }
  if (token.type === 'modular-scale') {
    return JSON.stringify(value);
  }
  return value;
}

module.exports = {
  include: ['src/core/**/*.json5'],
  source: [
    ...(WHITELABEL === false ? ['src/telekom/core/**.json5'] : []),
    'src/semantic/**/*.json5',
  ],
  platforms: {
    cssLightData: {
      transforms: [...cssTransformGroup],
      buildPath: OUTPUT_PATH + 'csv/',
      files: [
        {
          destination: OUTPUT_BASE_FILENAME + '.core.csv',
          format: 'csv/notion',
          filter: (token) => token.path[0] === 'core',
        },
        {
          destination: OUTPUT_BASE_FILENAME + '.semantic.csv',
          format: 'csv/notion',
          filter: (token) => token.path[0] !== 'core',
        },
        {
          destination: OUTPUT_BASE_FILENAME + '.all.csv',
          format: 'csv/notion',
        },
      ],
    },
  },
};
