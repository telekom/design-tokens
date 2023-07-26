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
const pick = require('lodash/pick');

const { PREFIX, OUTPUT_PATH, OUTPUT_BASE_FILENAME } = process.env;
const WHITELABEL = process.env.WHITELABEL !== 'false';

// Use custom 'name/cti/kebab2' plus 'color/alpha'
const cssTransformGroup = [
  'attribute/cti',
  'name/cti/kebab2',
  'time/seconds',
  'content/icon',
  'size/rem',
  'modular-scale/rem',
  'color/alpha',
  'color/css',
  'text-style/css',
  'cubic-bezier/css',
  'fluid-dimension/css',
];

StyleDictionary.registerAction({
  name: 'bundle_css',
  do: async function (_, config) {
    const { buildPath } = config;
    const light = JSON.parse(
      fs.readFileSync(buildPath + OUTPUT_BASE_FILENAME + '.light.json')
    );
    const darkOnly = JSON.parse(
      fs.readFileSync(buildPath + OUTPUT_BASE_FILENAME + '.dark.json')
    );
    const lightOnly = pick(light, Object.keys(darkOnly));
    const typeMobile = Object.keys(light)
      .filter((key) => key.includes('-mobile'))
      .reduce((acc, key) => {
        acc[key.replace('-mobile', '')] = `var(--${key})`;
        return acc;
      }, {});

    const data = `:root {
${printVariables(light)}
}

[data-mode="dark"] {
${printVariables(darkOnly)}
}

[data-type-scale="mobile"] {
${printVariables(typeMobile)}
}

@media (prefers-color-scheme: dark) {
  :root {
${printVariables(darkOnly, '    ')}
  }

  [data-mode="light"] {
${printVariables(lightOnly, '    ')}
  }
}`;
    await fs.writeFile(buildPath + OUTPUT_BASE_FILENAME + '.all.css', data);
  },
  undo: async function () {
    //
  },
});

StyleDictionary.registerTransform({
  type: 'value',
  name: 'fluid-dimension/css',
  transitive: true,
  matcher: (token) => token.type === 'fluid-dimension',
  transformer: function (token) {
    const { value } = token;
    // TODO get these 2 from somewhere? (extension?)
    const from = 320;
    const to = 1680;
    const min = ensurePxNum(value.min);
    const max = ensurePxNum(value.max);
    // Formula: https://www.aleksandrhovhannisyan.com/blog/fluid-type-scale-with-css-clamp/
    const slope = (max - min) / (to - from);
    const vw = (slope * 100).toFixed(1);
    const intercept = min - slope * min;
    const val = `clamp(${toRem(min)}rem, calc(${toRem(
      intercept
    )}rem + ${vw}vw), ${toRem(max)}rem)`;
    return val;
  },
});

function ensurePxNum(value, base = 16) {
  const num = parseFloat(value.replace(/([pxrem])+/gi, ''), 10);
  if (value.indexOf('px') > 0) {
    return num;
  }
  return num * base;
}

function toRem(value, base = 16) {
  return (value / base).toFixed(3);
}

function printVariables(json, indentation = '  ') {
  return Object.keys(json)
    .map((key) => {
      const value = json[key];
      return `${indentation}--${key}: ${value};`;
    })
    .join('\n');
}

module.exports = {
  include: ['src/core/**/*.json5'],
  source: [
    ...(WHITELABEL === false ? ['src/telekom/core/**.json5'] : []),
    'src/semantic/**/*.json5',
  ],
  platforms: {
    cssLightData: {
      transforms: ['mode-light', ...cssTransformGroup, 'shadow/css'],
      prefix: PREFIX,
      buildPath: OUTPUT_PATH + 'css/',
      files: [
        {
          destination: OUTPUT_BASE_FILENAME + '.light.json',
          format: 'json/flat',
          filter: (token) =>
            token.path[0] !== 'core' && !token.path.includes('experimental'),
        },
      ],
    },
    cssDarkOnlyData: {
      transforms: ['mode-dark', ...cssTransformGroup, 'shadow/css'],
      prefix: PREFIX,
      buildPath: OUTPUT_PATH + 'css/',
      files: [
        {
          destination: OUTPUT_BASE_FILENAME + '.dark.json',
          format: 'json/flat',
          filter: (token) =>
            token.path[0] !== 'core' && token.original.value?.dark != null,
        },
      ],
      actions: ['bundle_css'],
    },
  },
};
