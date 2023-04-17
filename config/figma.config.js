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
const deep = require('deep-get-set');
const StyleDictionary = require('style-dictionary');
const { humanCase, fontWeightMap } = require('./shared');

const { OUTPUT_PATH, OUTPUT_BASE_FILENAME } = process.env;
const WHITELABEL = process.env.WHITELABEL !== 'false';

const TMP_NAME = 'tokens';
const FIGMA_KEY_LIGHT = 'Light';
const FIGMA_KEY_DARK = 'Dark';

/*
  TODO:
  - [ ] use font name from token in text-style transform
*/

const figmaTransformGroup = [
  'attribute/cti',
  'color/alpha-hex',
  'text-style/figma',
];

const categoryTypeMap = {
  'line-weight': 'borderWidth',
  opacity: 'opacity',
  radius: 'borderRadius',
  shadow: 'boxShadow',
  spacing: 'spacing',
  textStyle: 'typography',
  font: 'typography',
};

function formatJSON(allTokens, nameCaseFn = humanCase) {
  const output = {};
  deep.p = true;
  allTokens.forEach((token) => {
    const path = token.path.map(nameCaseFn);
    if (path.includes('Motion')) return;
    if (path[0] === 'Color' || path[0] === 'Shadow' || path[0] === 'Typography') path.shift();
    deep(output, path, getJSONValue(token));
  });
  return output;
}

/**
 * Handle some special cases
 */
function getJSONValue(token) {
  const re = /%([\s\S]+?)%/g
  const attributes = {
    type: token.type,
  };
  if (token.comment) {
    attributes.description = token.comment;
  }
  if (token.type === 'textStyle') {
    attributes.type = categoryTypeMap['textStyle'];
  }
  if (token.type === 'font') {
    attributes.type = categoryTypeMap['font'];
  }
  if (token.type === 'number' && token.path.includes('typography')) {
    attributes.type = categoryTypeMap['font'];
  }
  if (token.type === 'shadow') {
    attributes.type = categoryTypeMap['shadow'];
  }
  if (token.path.includes('line-weight')) {
    attributes.type = categoryTypeMap['line-weight'];
  }
  if (token.path.includes('opacity')) {
    attributes.type = categoryTypeMap['opacity'];
  }
  if (token.path.includes('radius')) {
    attributes.type = categoryTypeMap['radius'];
  }
  if (token.path.includes('spacing')) {
    attributes.type = categoryTypeMap['spacing'];
  }

  // Here we handle aliases using curly braces: %UI.Faint% -> "{UI.Faint}"
  // (%color.ui.faint% -> "%UI.Faint%" is handled in the keep-alias/figma transform below)
  return {
    value: typeof token.value === 'string' && token.value.charAt(0) === '%'
      ? token.value.replace(re, (_, p1) => `{${p1}}`)
      : token.value,
    ...attributes,
  };
}

StyleDictionary.registerTransform({
  type: 'value',
  name: 'text-style/figma',
  transitive: true,
  matcher: (token) => token.path[0] === 'text-style',
  transformer: function (token) {
    const { value } = token;
    return {
      fontFamily: 'TeleNeo', // FIXME value['font-family'],
      fontWeight: fontWeightMap[value['font-weight']],
      lineHeight: `${value['line-spacing'] * 100}%`,
      fontSize: value['font-size'].replace(/px$/, ''),
      letterSpacing: value['letter-spacing'] + '%',
      paragraphSpacing: '0',
      textDecoration: 'none',
      textCase: 'none',
    };
  },
});

/**
 * Make alias usable for Figma
 * e.g. %color.ui.faint% -> "%UI.Faint%"
 */
StyleDictionary.registerTransform({
  type: 'value',
  name: 'keep-alias/figma',
  transitive: true,
  transformer: function (token) {
    const re = /%([\s\S]+?)%/g
    if (re.test(token.value)) {
      return token.value.replace(re, (_, p1) => {
        const path = p1.split('.').map(humanCase);
        if (path[0] === 'Color' || path[0] === 'Shadow') path.shift();
        return `%${path.join('.')}%`;
      })
    }
    return token.value
  },
});

StyleDictionary.registerFormat({
  name: 'json/figma',
  formatter: function ({ dictionary }) {
    const output = formatJSON(dictionary.allTokens);
    return JSON.stringify(output, null, 2);
  },
});

StyleDictionary.registerFormat({
  name: 'json/figma-mode',
  formatter: function ({ dictionary }) {
    const output = formatJSON(
      dictionary.allTokens.filter(
        (token) => token.path.includes('color') || token.path.includes('shadow')
      )
    );
    return JSON.stringify(output, null, 2);
  },
});

StyleDictionary.registerAction({
  name: 'bundle_figma',
  do: async function (_, config) {
    const { buildPath } = config;
    const modeless = JSON.parse(
      await fs.readFile(buildPath + TMP_NAME + '.modeless.json')
    );
    const component = JSON.parse(
      await fs.readFile(buildPath + TMP_NAME + '.component.json')
    );
    const light = JSON.parse(
      await fs.readFile(buildPath + TMP_NAME + '.light.json')
    );
    const dark = JSON.parse(
      await fs.readFile(buildPath + TMP_NAME + '.dark.json')
    );
    // Everything
    await fs.writeFile(
      buildPath + OUTPUT_BASE_FILENAME + '.all.json',
      JSON.stringify(
        {
          Universal: {
            ...modeless,
          },
          [FIGMA_KEY_LIGHT]: { ...light },
          [FIGMA_KEY_DARK]: { ...dark },
          ...component,
          '$themes': [],
          '$metadata': {
            tokenSetOrder: [
              'Universal',
              FIGMA_KEY_LIGHT,
              FIGMA_KEY_DARK,
              'Component',
            ]
          }
        },
        null,
        2
      )
    );
    // Light
    await fs.writeFile(
      buildPath + OUTPUT_BASE_FILENAME + '.light.json',
      JSON.stringify(
        {
          [FIGMA_KEY_LIGHT]: { ...light },
        },
        null,
        2
      )
    );
    // Dark
    await fs.writeFile(
      buildPath + OUTPUT_BASE_FILENAME + '.dark.json',
      JSON.stringify(
        {
          [FIGMA_KEY_DARK]: { ...dark },
        },
        null,
        2
      )
    );

    await fs.remove(buildPath + TMP_NAME + '.modeless.json');
    await fs.remove(buildPath + TMP_NAME + '.component.json');
    await fs.remove(buildPath + TMP_NAME + '.light.json');
    await fs.remove(buildPath + TMP_NAME + '.dark.json');
  },
  undo: async function (_, config) {
    //
  },
});

const hasMode = (token) =>
  token.path[0] === 'color' || token.path[0] === 'shadow';

module.exports = {
  include: ['src/core/**/*.json5'],
  source: [
    ...(WHITELABEL === false ? ['src/telekom/core/**.json5'] : []),
    'src/semantic/**/*.json5',
    'src/component/**/*.json5',
  ],
  platforms: {
    figmaModeless: {
      transforms: [...figmaTransformGroup],
      buildPath: OUTPUT_PATH + 'figma/',
      files: [
        {
          destination: TMP_NAME + '.modeless.json',
          format: 'json/figma',
          filter: (token) =>
            token.path[0] !== 'core' &&
            token.path[0] !== 'motion' &&
            token.path[0] !== 'component' &&
            !hasMode(token),
        },
      ],
    },
    figmaComponents: {
      transforms: ['keep-alias/figma', ...figmaTransformGroup],
      buildPath: OUTPUT_PATH + 'figma/',
      files: [
        {
          destination: TMP_NAME + '.component.json',
          format: 'json/figma',
          filter: (token) => token.path[0] === 'component',
        },
      ],
    },
    figmaLight: {
      transforms: ['mode-light', ...figmaTransformGroup],
      buildPath: OUTPUT_PATH + 'figma/',
      files: [
        {
          destination: TMP_NAME + '.light.json',
          format: 'json/figma-mode',
          filter: hasMode,
        },
      ],
    },
    figmaDark: {
      transforms: ['mode-dark', ...figmaTransformGroup],
      buildPath: OUTPUT_PATH + 'figma/',
      files: [
        {
          destination: TMP_NAME + '.dark.json',
          format: 'json/figma-mode',
          filter: hasMode,
        },
      ],
      actions: ['bundle_figma'],
    },
  },
};
