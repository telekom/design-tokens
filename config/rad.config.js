/**
 * Telekom Design Tokens https://github.com/telekom/design-tokens
 *
 * Copyright (c) 2021 Lukas Oppermann and contributors, Deutsche Telekom AG
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const PREFIX = 'ODS';
const fs = require('fs-extra');
const StyleDictionary = require('style-dictionary');
const pick = require('lodash/pick');
const kebabCase = require('lodash/kebabCase');

const { OUTPUT_PATH, OUTPUT_BASE_FILENAME } = process.env;
const WHITELABEL = process.env.WHITELABEL !== 'false';

// Use custom 'name/cti/kebab2' plus 'color/alpha'
const cssTransformGroup = [
  'attribute/cti',
  'name/cti/kebab3',
  'time/seconds',
  'content/icon',
  'size/rem',
  'modular-scale/rem',
  'color/alpha',
  'color/css',
  'text-style/css',
  'cubic-bezier/css',
  'shadow/css',
];

StyleDictionary.registerAction({
  name: 'bundle_css_rad',
  do: async function (_, config) {
    const { buildPath } = config;
    const light = JSON.parse(
      fs.readFileSync(buildPath + OUTPUT_BASE_FILENAME + '.light.json')
    );
    const darkOnly = JSON.parse(
      fs.readFileSync(buildPath + OUTPUT_BASE_FILENAME + '.dark.json')
    );
    const lightOnly = pick(light, Object.keys(darkOnly));
    let data = `:root {
${printVariables(light)}
}

[data-mode="dark"] {
${printVariables(darkOnly)}
}

@media (prefers-color-scheme: dark) {
  :root {
${printVariables(darkOnly, '    ')}
  }

  [data-mode="light"] {
${printVariables(lightOnly, '    ')}
  }
}`;
    const typographyClasses = fs.readFileSync(
      buildPath + OUTPUT_BASE_FILENAME + '.typography.css'
    );
    const colorClasses = fs.readFileSync(
      buildPath + OUTPUT_BASE_FILENAME + '.colors.css'
    );
    data += '\n\n' + typographyClasses + '\n\n' + colorClasses;
    await fs.writeFile(buildPath + OUTPUT_BASE_FILENAME + '.all.css', data);
  },
  undo: async function () {
    //
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
      transforms: ['mode-light', ...cssTransformGroup],
      prefix: '',
      buildPath: OUTPUT_PATH + 'rad/',
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
      transforms: ['mode-dark', ...cssTransformGroup],
      prefix: '',
      buildPath: OUTPUT_PATH + 'rad/',
      files: [
        {
          destination: OUTPUT_BASE_FILENAME + '.dark.json',
          format: 'json/flat',
          filter: (token) =>
            token.path[0] !== 'core' && token.original.value?.dark != null,
        },
      ],
    },
    extraClasses: {
      transforms: [...cssTransformGroup],
      prefix: '',
      buildPath: OUTPUT_PATH + 'rad/',
      files: [
        {
          destination: OUTPUT_BASE_FILENAME + '.typography.css',
          format: 'css/typography-classes',
          filter: (token) => {
            return token.path[0] === 'text-style';
          },
        },
        {
          destination: OUTPUT_BASE_FILENAME + '.colors.css',
          format: 'css/colors-classes',
          filter: (token) => {
            return token.path[0] === 'color' && token.path[1] === 'text-&-icon';
          },
        },
      ],
      actions: ['bundle_css_rad'],
    },
  },
};

StyleDictionary.registerTransform({
  name: 'name/cti/kebab3',
  type: 'name',
  transformer: function (token, options) {
    const name = [options.prefix]
      .concat(token.path)
      .map((x) => x.replace('&', ''))
      .join(' ');
    const result = kebabCase(name);
    if (token.path[0] === 'color') {
      return result.replace('color-', '');
    }
    return result.replace('-x-', '-x');
  },
});

StyleDictionary.registerFormat({
  name: 'css/typography-classes',
  formatter: function ({ dictionary }) {
    const obj = {};
    dictionary.allTokens.forEach((token) => {
      const style = token.path[1];
      obj[style] = {
        font: token.value,
      };
    });
    return Object.keys(obj)
      .map((typoStyle) => {
        return `.${PREFIX + 'Typography-' + typoStyle} {\n${Object.keys(
          obj[typoStyle]
        )
          .map((key) => {
            return `  ${key}: ${obj[typoStyle][key]};`;
          })
          .join(`\n`)}\n}`;
      })
      .join(`\n\n`);
  },
});

StyleDictionary.registerFormat({
  name: 'css/colors-classes',
  formatter: function ({ dictionary }) {
    return dictionary.allTokens
      .map((token) => {
        return (
          '.' +
          PREFIX +
          `Colors-` +
          token.name +
          ' {\n  color: ' +
          'var(--' +
          token.name +
          ')' +
          ';\n}'
        );
      })
      .join('\n\n');
  },
});
