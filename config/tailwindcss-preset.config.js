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
const kebabCase = require('lodash/kebabCase');
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

      .map(remapConfigKeys)
      .map(patchSpacingKeys)
      .forEach((token) => {
        deep(tokens, token.configKeys, `var(--${token.name})`);
      });

    const rawSource = `
      ${header}
      
      const plugin = require('tailwindcss/plugin');

      module.exports = 
        {
          theme: ${JSON.stringify(tokens)},
          plugins: [
            /**
             * Custom plugin to convert \`shadow\` design token to the \`boxShadow\` css shorthand property
             * and to avoid functionality of core tailwindcss plugins (\`boxShadow\` and \`boxShadowColor\`).
             */
             plugin(function ({ matchUtilities, theme }) {
              matchUtilities(
                {
                  shadow: (value) => ({
                    boxShadow: value,
                  }),
                },
                { values: theme('shadow') }
              );
            }),
            /**
             * Custom plugin to convert \`text-style\` design token to the \`font\` css shorthand property
             * as there is no mapping provided by the core plugins.
             */
            plugin(function ({ matchUtilities, theme }) {
              matchUtilities(
                {
                  'text-style': (value) => ({
                    font: value,
                  }),
                },
                { values: theme('textStyle') }
              );
            }),
          ],
          corePlugins: {
            boxShadow: false,
            boxShadowColor: false,
          },
        };
    `;

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
  { original: ['color', 'text-icon'], tailwindcss: ['colors', 'icon'] },
  { original: ['color'], tailwindcss: ['colors'] },
  { original: ['line-weight'], tailwindcss: ['borderWidth'] },
  { original: ['motion', 'duration'], tailwindcss: ['transitionDuration'] },
  { original: ['motion', 'easing'], tailwindcss: ['transitionTimingFunction'] },
  { original: ['radius'], tailwindcss: ['borderRadius'] },
  { original: ['spacing', 'unit'], tailwindcss: ['spacing'] },
  { original: ['typography', 'font-size'], tailwindcss: ['fontSize'] },
  { original: ['typography', 'font-family'], tailwindcss: ['fontFamily'] },
  { original: ['typography', 'font-weight'], tailwindcss: ['fontWeight'] },
  { original: ['typography', 'line-spacing'], tailwindcss: ['lineHeight'] },
  { original: ['typography', 'letter-spacing'], tailwindcss: ['letterSpacing'] },
  { original: ['text-style'], tailwindcss: ['textStyle'] },

  // flatten and kebab-case shadows
  {
    original: ['shadow', 'flat', 'standard'],
    tailwindcss: ['shadow', 'flat-standard'],
  },
  {
    original: ['shadow', 'flat', 'hover'],
    tailwindcss: ['shadow', 'flat-hover'],
  },
  {
    original: ['shadow', 'flat', 'pressed'],
    tailwindcss: ['shadow', 'flat-pressed'],
  },
  {
    original: ['shadow', 'resting', 'standard'],
    tailwindcss: ['shadow', 'resting-standard'],
  },
  {
    original: ['shadow', 'resting', 'hover'],
    tailwindcss: ['shadow', 'resting-hover'],
  },
  {
    original: ['shadow', 'resting', 'pressed'],
    tailwindcss: ['shadow', 'resting-pressed'],
  },
  {
    original: ['shadow', 'raised', 'standard'],
    tailwindcss: ['shadow', 'raised-standard'],
  },
  {
    original: ['shadow', 'raised', 'hover'],
    tailwindcss: ['shadow', 'raised-hover'],
  },
  {
    original: ['shadow', 'raised', 'pressed'],
    tailwindcss: ['shadow', 'raised-pressed'],
  },
  {
    original: ['shadow', 'floating', 'standard'],
    tailwindcss: ['shadow', 'floating-standard'],
  },
  {
    original: ['shadow', 'floating', 'hover'],
    tailwindcss: ['shadow', 'floating-hover'],
  },
  {
    original: ['shadow', 'floating', 'pressed'],
    tailwindcss: ['shadow', 'floating-pressed'],
  },
  {
    original: ['shadow', 'top'],
    tailwindcss: ['shadow', 'top'],
  },
  {
    original: ['shadow', 'overlay'],
    tailwindcss: ['shadow', 'overlay'],
  },
  {
    original: ['shadow', 'app-bar', 'top', 'raised'],
    tailwindcss: ['shadow', 'app-bar-top-raised'],
  },
  {
    original: ['shadow', 'app-bar', 'top', 'flat'],
    tailwindcss: ['shadow', 'app-bar-top-flat'],
  },
  {
    original: ['shadow', 'app-bar', 'bottom', 'raised'],
    tailwindcss: ['shadow', 'app-bar-bottom-raised'],
  },
  {
    original: ['shadow', 'app-bar', 'bottom', 'flat'],
    tailwindcss: ['shadow', 'app-bar-bottom-flat'],
  },
];

/**
 * Helper function to remap token path from original names
 * to config key names that are used by core Tailwindcss plugins
 */
function remapConfigKeys(token) {
  token.configKeys = token.path.map(kebabCase);
  for (const { original, tailwindcss } of mappings) {
    if (token.configKeys.join().startsWith(original.join())) {
      token.configKeys.splice(0, original.length, ...tailwindcss);
    }
  }

  return token;
}

/**
 * Helper function to patch spacing keys (remove `x-` prefix)
 * Example: `x-1` -> `1`
 */
function patchSpacingKeys(token) {
  if (token.path[0] === 'spacing') {
    token.configKeys[1] = token.configKeys[1].substring(2);
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
      `  - https://github.com/telekom/design-tokens#how-to-use-the-tailwindcss-preset`,
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
