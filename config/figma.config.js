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

  types expected by Tokens Studio:
  Typography / Font Size -> fontSizes
  Typography / Font Family -> fontFamilies
  Typography / Font Weight -> fontWeights
  Typography / Line Spacing -> lineHeights
  Typography / Letter Spacing -> letterSpacing
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
  font: 'fontFamilies',
};

function formatJSON(allTokens, { dictionary, mode }) {
  const output = {};
  deep.p = true;
  allTokens.forEach((token) => {
    const path = token.path.map(humanCase);
    if (path.includes('Motion')) return;
    if (
      path[0] === 'Color' ||
      path[0] === 'Shadow' ||
      path[0] === 'Typography' ||
      path[0] === 'Core'
    ) {
      path.shift();
    }
    deep(output, path, getJSONValue(token, { dictionary, mode }));
  });
  return output;
}

/**
 * Handle some special cases
 */
function getJSONValue(token, { dictionary, mode }) {
  let value = token.value; // cloning would be nice (structuredClone is not supported in Node 16?)
  const attributes = {
    type: token.type,
  };
  // Set description
  if (token.comment) {
    attributes.description = token.comment;
  }
  // Set type
  if (token.path.includes('typography')) {
    if (token.path.includes('font-size')) {
      attributes.type = 'fontSizes';
    }
    if (token.path.includes('font-family')) {
      attributes.type = 'fontFamilies';
    }
    if (token.path.includes('font-weight')) {
      attributes.type = 'fontWeights';
    }
    if (token.path.includes('line-spacing')) {
      attributes.type = 'lineHeights';
    }
    if (token.path.includes('letter-spacing')) {
      attributes.type = 'letterSpacing';
    }
  } else if (token.path.includes('textStyle')) {
    attributes.type = categoryTypeMap['textStyle'];
  } else if (token.path.includes('shadow')) {
    attributes.type = categoryTypeMap['shadow'];
  } else if (token.path.includes('line-weight')) {
    attributes.type = categoryTypeMap['line-weight'];
  } else if (token.path.includes('opacity')) {
    attributes.type = categoryTypeMap['opacity'];
  } else if (token.path.includes('radius')) {
    attributes.type = categoryTypeMap['radius'];
  } else if (token.path.includes('spacing')) {
    attributes.type = categoryTypeMap['spacing'];
  }

  // Set value to reference when used e.g. `{Core.Color.Black}`
  // (mode is important!)
  if (dictionary.usesReference(token.original.value)) {
    const refs = dictionary.getReferences(token.original.value);
    if (refs.length > 0) {
      let ref = refs[0];
      if (typeof mode !== 'undefined' && refs.length === 2) {
        ref = mode === 'light' ? refs[0] : refs[1];
      }
      const path = ref.path.map(humanCase);
      value = `{${path.join('.')}}`;
    }
  }

  return {
    value,
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

StyleDictionary.registerFormat({
  name: 'json/figma',
  formatter: function ({ dictionary }) {
    const output = formatJSON(dictionary.allTokens, { dictionary });
    return JSON.stringify(output, null, 2);
  },
});

StyleDictionary.registerFormat({
  name: 'json/figma-mode',
  formatter: function ({ dictionary, options }) {
    const output = formatJSON(
      dictionary.allTokens.filter(
        (token) => token.path.includes('color') || token.path.includes('shadow')
      ),
      { dictionary, mode: options.mode }
    );
    return JSON.stringify(output, null, 2);
  },
});

StyleDictionary.registerAction({
  name: 'bundle_figma',
  do: async function (_, config) {
    const { buildPath } = config;
    const core = JSON.parse(
      await fs.readFile(buildPath + TMP_NAME + '.core.json')
    );
    const modeless = JSON.parse(
      await fs.readFile(buildPath + TMP_NAME + '.modeless.json')
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
          Core: {
            ...core,
          },
          Global: {
            ...modeless,
          },
          [FIGMA_KEY_LIGHT]: { ...light },
          [FIGMA_KEY_DARK]: { ...dark },
          $themes: [],
          $metadata: {
            tokenSetOrder: ['Global', FIGMA_KEY_LIGHT, FIGMA_KEY_DARK],
          },
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
          ...light,
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
          ...dark,
        },
        null,
        2
      )
    );

    await fs.remove(buildPath + TMP_NAME + '.core.json');
    await fs.remove(buildPath + TMP_NAME + '.modeless.json');
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
  ],
  platforms: {
    figmaCore: {
      transforms: [...figmaTransformGroup],
      buildPath: OUTPUT_PATH + 'figma/',
      files: [
        {
          destination: TMP_NAME + '.core.json',
          format: 'json/figma',
          filter: (token) => token.path[0] === 'core',
        },
      ],
    },
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
            !hasMode(token),
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
          options: {
            mode: 'light',
          },
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
          options: {
            mode: 'dark',
          },
        },
      ],
      actions: ['bundle_figma'],
    },
  },
};
