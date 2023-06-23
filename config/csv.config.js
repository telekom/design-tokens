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
  'color/alpha-hex',
  'color/css',
  'text-style/css',
  // 'cubic-bezier/css',
  'shadow/css',
];

StyleDictionary.registerFormat({
  name: `csv/notion`,
  formatter: function ({ dictionary }) {
    const isRef = dictionary.usesReference.bind(dictionary);
    const hasMode = (token) =>
      typeof token.original.value === 'object' &&
      'light' in token.original.value;
    const heading = [
      'Name',
      'Tier',
      'Category',
      'Type',
      'Value',
      'Value (dark)',
      'Description',
      'Is Alias?',
    ].join(SEPARATOR);

    const rows = dictionary.allTokens.map((token) => {
      const namePath =
        token.path[0] === 'core' ? token.path.slice(2) : token.path.slice(1);
      const category = token.path[0] === 'core' ? token.path[1] : token.path[0];
      let value = [token.value, ''];
      if (hasMode(token)) {
        value = isRef(token.original.value)
          ? [token.original.value.light, token.original.value.dark]
          : [token.value.light, token.value.dark];
      } else if (isRef(token.original.value)) {
        value[0] = token.original.value;
      }

      return [
        namePath.map(humanCase).join(' / '), // Name
        token.path[0] === 'core' ? 'Core' : 'Semantic', // Tier
        humanCase(category), // Category
        token.type, // Type
        stringifyObjectValue(value[0], token), // Value
        stringifyObjectValue(value[1], token), // Value (dark)
        token.original.comment || '', // Description
        isRef(token.original.value) ? 'Yes' : 'No', // Is Alias?
      ].join(SEPARATOR);
    });

    return [heading, ...rows].join('\n');
  },
});

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
