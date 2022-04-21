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
const deep = require('deep-get-set');
const prettier = require('prettier');
const camelCase = require('lodash/camelCase');
const { map } = require('lodash');

const { PREFIX, OUTPUT_PATH, OUTPUT_BASE_FILENAME } = process.env;
const WHITELABEL = process.env.WHITELABEL !== 'false';

const tailwindcssPresetTransformGroup = [
  ...StyleDictionary.transformGroup.js,
  'attribute/cti',
  'name/cti/kebab2',
];

/**
 * Custom formatter for Tailwindcss config preset
 */
StyleDictionary.registerFormat({
  name: 'tailwindcss/preset',
  formatter: function ({ dictionary, file }) {
    const tokens = {};
    const header = StyleDictionary.formatHelpers.fileHeader({ file });
    deep.p = true;
    dictionary.allTokens
      .filter((token) => token.path[0] !== 'core')
      // Filter out text-style as there is no clear mapping to tailwindcss config key
      // that would be supported by core plugins
      .filter((token) => token.path[0] !== 'text-style')
      .map(remapConfigKeys)
      .forEach((token) => {
        deep(tokens, token.configKeys, `var(--${token.name})`);
      });
    const rawSource = `${header} 
      module.exports = ${JSON.stringify({ theme: tokens }, null, 2)}`;
    return prettier.format(rawSource, {
      parser: 'babel',
      singleQuote: true,
    });
  },
});

/**
 * Configuration of mappings of the start of the original paths
 * to the generated Tailwindcss config key names
 */
const mappings = [
  { original: ['color'], tailwindcss: ['colors'] },
  { original: ['lineWeight'], tailwindcss: ['borderWidth'] },
  { original: ['motion', 'duration'], tailwindcss: ['transitionDuration'] },
  { original: ['motion', 'easing'], tailwindcss: ['transitionTimingFunction'] },
  { original: ['radius'], tailwindcss: ['borderRadius'] },
  { original: ['shadow'], tailwindcss: ['boxShadow'] },
  { original: ['spacing', 'unit'], tailwindcss: ['spacing'] },
  { original: ['typography', 'fontSize'], tailwindcss: ['fontSize'] },
  { original: ['typography', 'fontFamily'], tailwindcss: ['fontFamily'] },
  { original: ['typography', 'fontWeight'], tailwindcss: ['fontWeight'] },
  { original: ['typography', 'lineSpacing'], tailwindcss: ['lineHeight'] },
  { original: ['typography', 'letterSpacing'], tailwindcss: ['letterSpacing'] },
];

/**
 * Helper function to remap token path from original names
 * to config key names that are used by core Tailwindcss plugins
 */
function remapConfigKeys(token) {
  token.configKeys = token.path.map(camelCase);
  for (const { original, tailwindcss } of mappings) {
    if (token.configKeys.join().startsWith(original.join())) {
      token.configKeys.splice(0, original.length, ...tailwindcss);
    }
  }
  return token;
}

/**
 * Custom file header for Tailwindcss which adds some useful info
 */
StyleDictionary.registerFileHeader({
  name: 'tailwindcss/preset-header',
  fileHeader: (defaultMessage) => {
    return [
      ...defaultMessage,
      ``,
      `You can find info about usage here:`,
      `  - https://github.com/mato-a/design-tokens#how-to-use-the-tailwindcss-preset`,
      `  - https://tailwindcss.com/docs/presets`,
    ];
  },
});

module.exports = {
  include: ['src/core/**/*.json5'],
  source: [
    ...(WHITELABEL === false ? ['src/telekom/core/**.json5'] : []),
    'src/semantic/**/*.json5',
  ],
  platforms: {
    tailwindcssPreset: {
      transforms: [...tailwindcssPresetTransformGroup],
      prefix: PREFIX,
      buildPath: OUTPUT_PATH + 'tailwindcss-preset/',
      files: [
        {
          destination: OUTPUT_BASE_FILENAME + '.config.js',
          format: 'tailwindcss/preset',
          options: {
            fileHeader: 'tailwindcss/preset-header',
          },
        },
      ],
    },
  },
};
