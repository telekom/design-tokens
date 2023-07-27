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
const { ensurePxNumFromDimension, pxToRem } = require('./shared');

const {
  PREFIX,
  OUTPUT_PATH,
  OUTPUT_BASE_FILENAME,
  FLUID_WIDTH_MIN,
  FLUID_WIDTH_MAX,
} = process.env;
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
    const typeFluid = Object.keys(light)
      .filter((key) => key.includes('-fluid'))
      .reduce((acc, key) => {
        acc[key.replace('-fluid', '')] = `var(--${key})`;
        return acc;
      }, {});

    const data = `:root {
${printVariables(light)}
}

[data-mode="dark"] {
${printVariables(darkOnly)}
}

/* Overwrite font size tokens with mobile counterpart */
[data-type-scale="mobile"] {
${printVariables(typeMobile)}
}

/* Overwrite font size tokens with fluid counterpart */
[data-type-scale="fluid"] {
${printVariables(typeFluid)}
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
    const minWidth = parseInt(FLUID_WIDTH_MIN || 320, 10);
    const maxWidth = parseInt(FLUID_WIDTH_MAX || 1500, 10);
    const min = ensurePxNumFromDimension(token.value.min);
    const max = ensurePxNumFromDimension(token.value.max);
    /*
      https://utopia.fyi/blog/clamp
      Slope = (MaxSize - MinSize) / (MaxWidth - MinWidth)
      yIntersection = (-1 * MinWidth) * Slope + MinSize
      font-size: clamp(MinSize[rem], yIntersection[rem] + Slope * 100vw, MaxSize[rem])
    */
    const slope = (max - min) / (maxWidth - minWidth);
    const interception = -1 * from * slope + min;
    const vw = (slope * 100).toFixed(1);
    const _min = `${pxToRem(min)}rem`;
    const _prefered = `calc(${pxToRem(interception)}rem + ${vw}vw)`;
    const _max = `${pxToRem(max)}rem`;
    return `clamp(${_min}, ${_prefered}, ${_max})`;
  },
});

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
