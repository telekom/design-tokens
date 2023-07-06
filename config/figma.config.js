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
const { humanCase, fontWeightMap, isColorAlphaComposite } = require('./shared');

const { OUTPUT_PATH, OUTPUT_BASE_FILENAME } = process.env;
const WHITELABEL = process.env.WHITELABEL !== 'false';

const TMP_NAME = 'tokens';
const FIGMA_KEY_LIGHT = 'Light';
const FIGMA_KEY_DARK = 'Dark';

const shouldHaveMode = (token) =>
  token.path[0] === 'color' || token.path[0] === 'shadow';

const hasMode = (token) => token.original.value?.light != null;

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

const THEMES = [
  {
    id: '0efe74c81045c31912f3f25ceccbb79a4021d482',
    name: 'Telekom',
    $figmaStyleReferences: {},
    selectedTokenSets: {
      Core: 'enabled',
    },
    group: 'Core',
  },
  {
    id: '7a9907de042ac3a05850bed823405e364006587c',
    name: 'Values',
    $figmaStyleReferences: {},
    selectedTokenSets: {
      Core: 'source',
      Global: 'enabled',
    },
    group: 'Global',
  },
  {
    id: 'e84d59b7aab9a411698c3781401bf695dc2d2952',
    name: 'Light',
    $figmaStyleReferences: {},
    selectedTokenSets: {
      Core: 'source',
      Light: 'enabled',
    },
    group: 'Color',
  },
  {
    id: 'e3dd70729694cefd558242ba5e81517f4bc0d626',
    name: 'Dark',
    $figmaStyleReferences: {},
    selectedTokenSets: {
      Core: 'source',
      Dark: 'enabled',
    },
    group: 'Color',
  },
];

function formatJSON(allTokens, { dictionary, mode }) {
  const output = {};
  deep.p = true;
  allTokens.forEach((token) => {
    const path = token.path.map(humanCase);
    if (path.includes('Motion')) return;
    // Keep `Core` in path to avoid collisions with same name tokens
    const keepCoreInPathToAvoidCollisionsWithSameNameTokens =
      path[0] === 'Core' && path[1] !== 'Spacing' && path[1] !== 'Radius';
    if (
      path[0] === 'Color' ||
      path[0] === 'Shadow' ||
      path[0] === 'Typography' ||
      keepCoreInPathToAvoidCollisionsWithSameNameTokens
    ) {
      path.shift();
    }
    deep(output, path, getJSONValue(token, { dictionary, mode }));
  });
  return output;
}

/**
 * Get the proper value for each token, including:
 * - renaming the `comment` key to `description`
 * - renaming types to meet Tokens Studio requirements
 * - keep references as values, when appropriate
 * - handle references using `alpha` (leveraging Tokens Studio color modifier)
 */
function getJSONValue(token, { dictionary, mode }) {
  let value = token.value; // cloning would be nice (`structuredClone` is not supported in Node 16?)
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

  // Keep reference when appropriate e.g. `{Core.Color.Black}`
  // (mode is important!)
  if (dictionary.usesReference(token.original.value)) {
    let refs = hasMode(token)
      ? [
          ...dictionary.getReferences(token.original.value.light),
          ...dictionary.getReferences(token.original.value.dark),
        ]
      : dictionary.getReferences(token.original.value);
    // ! "shadow" type core tokens result in refs.length === 0
    // (color modifiers are not supported within shadow tokens)
    if (refs.length > 0) {
      let ref = refs[0];
      if (typeof mode !== 'undefined' && refs.length === 2) {
        ref = mode === 'light' ? refs[0] : refs[1];
      }
      // Handle `alpha` colors -> Tokens Studio color modifier Pro feature
      if (hasMode(token) && isColorAlphaComposite(token.original.value[mode])) {
        deep(attributes, ['$extensions', 'studio.tokens', 'modify'], {
          type: 'alpha',
          value: token.original.value[mode].alpha?.toString(),
          space: 'hsl',
        });
      }
      const path = ref.path.map(humanCase);
      // Keep `Core` in path to avoid collisions with same name tokens
      if (path[1] !== 'Spacing' && path[1] !== 'Radius') {
        path.shift();
      }
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
          $themes: THEMES,
          $metadata: {
            tokenSetOrder: ['Core', 'Global', FIGMA_KEY_LIGHT, FIGMA_KEY_DARK],
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
            !shouldHaveMode(token),
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
          filter: shouldHaveMode,
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
          filter: shouldHaveMode,
          options: {
            mode: 'dark',
          },
        },
      ],
      actions: ['bundle_figma'],
    },
  },
};
