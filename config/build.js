const fs = require('fs/promises');
const deep = require('deep-get-set');
const prettier = require('prettier');
const StyleDictionary = require('style-dictionary');

const PREFIX = 'scl';
const OUTPUT_PATH = 'build/';
const SOURCE_PATH = 'src/';

/**
 * This is WIP, we'll split it out in different files as we make progress.
 */

StyleDictionary.registerFormat({
  name: 'javascript/esm',
  formatter: function ({ dictionary, file }) {
    const tokens = Object.create(null);
    const header = StyleDictionary.formatHelpers.fileHeader({ file });
    deep.p = true;
    dictionary.allTokens.forEach((token) => {
      deep(tokens, token.path, token.value);
    });
    const output = Object.keys(tokens).reduce((acc, name) => {
      const category = tokens[name];
      return (
        acc + `\nexport const ${name} = ${JSON.stringify(category, null, 2)}\n`
      );
    }, header);
    return prettier.format(output, {
      parser: 'babel',
      semi: false,
      singleQuote: true,
    });
  },
});

const transformGroupFigma = [
  'attribute/cti',
  'name/cti/pascal', // TODO something custom
  'size/px',
  'color/hex',
];

StyleDictionary.registerFormat({
  name: 'json/figma',
  formatter: function ({ dictionary }) {
    const output = dictionary.tokens.semantic;
    return JSON.stringify(minifyDictionary2(output), null, 2);
  },
});

StyleDictionary.registerFormat({
  name: 'json/figma-color',
  formatter: function ({ dictionary }) {
    const output = {
      ...dictionary.tokens.semantic.color,
      ...dictionary.tokens.semantic.elevation,
    };
    return JSON.stringify(minifyDictionary2(output), null, 2);
  },
});

StyleDictionary.registerAction({
  name: 'bundle_css',
  do: async function (dictionary, config) {
    // TODO get these from `config`?
    const COMMON_PATH = OUTPUT_PATH + 'css/';
    try {
      const light = await fs.readFile(COMMON_PATH + 'tokens.css');
      const dark = await fs.readFile(COMMON_PATH + 'tokens.dark.css');
      await fs.writeFile(COMMON_PATH + 'tokens.all.css', light + '\n' + dark);
    } catch (err) {
      // ..
    }
  },
  undo: async function () {
    const COMMON_PATH = OUTPUT_PATH + 'css/';
    await fs.rm(COMMON_PATH + 'tokens.all.css');
  },
});

StyleDictionary.registerAction({
  name: 'bundle_json',
  do: async function (dictionary, config) {
    // TODO get these from `config`?
    const COMMON_PATH = OUTPUT_PATH + 'json/';
    const modeless = JSON.parse(
      await fs.readFile(COMMON_PATH + 'variables.modeless.json')
    );
    const light = JSON.parse(
      await fs.readFile(COMMON_PATH + 'variables.light.json')
    );
    const dark = JSON.parse(
      await fs.readFile(COMMON_PATH + 'variables.dark.json')
    );
    const output = {
      light: { ...light },
      dark: { ...dark },
      ...modeless,
    };
    await fs.writeFile(
      COMMON_PATH + 'variables.all.json',
      JSON.stringify(output, null, 2)
    );
  },
  undo: async function () {
    const COMMON_PATH = OUTPUT_PATH + 'json/';
    await fs.rm(COMMON_PATH + 'variables.all.json');
  },
});

StyleDictionary.registerTransform({
  type: 'value',
  name: 'mode-light',
  transitive: true,
  transformer: function (token) {
    if (token.original.value?.light != null) {
      return token.original.value.light;
    }
    return token.original.value;
  },
});

StyleDictionary.registerTransform({
  type: 'value',
  name: 'mode-dark',
  transitive: true,
  transformer: function (token) {
    if (token.original.value?.dark != null) {
      return token.original.value.dark;
    }
    return token.original.value;
  },
});

StyleDictionary.extend({
  source: [SOURCE_PATH + '**/*.json5'],
  platforms: {
    css: {
      transforms: ['mode-light', ...StyleDictionary.transformGroup.css],
      prefix: PREFIX,
      buildPath: OUTPUT_PATH + 'css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
            selector: ':root, [data-mode="light"]',
          },
        },
      ],
    },
    cssDark: {
      transforms: ['mode-dark', ...StyleDictionary.transformGroup.css],
      prefix: PREFIX,
      buildPath: OUTPUT_PATH + 'css/',
      files: [
        {
          destination: 'tokens.dark.css',
          format: 'css/variables',
          filter: (token) => token.original.value?.dark != null,
          options: {
            outputReferences: true,
            selector: '[data-mode="dark"]',
          },
        },
      ],
      actions: ['bundle_css'],
    },
    js: {
      transforms: ['mode-light', ...StyleDictionary.transformGroup.js],
      buildPath: OUTPUT_PATH + 'js/',
      files: [
        {
          destination: 'tokens.light.js',
          format: 'javascript/esm',
        },
      ],
    },
    jsDark: {
      transforms: ['mode-dark', ...StyleDictionary.transformGroup.js],
      buildPath: OUTPUT_PATH + 'js/',
      files: [
        {
          destination: 'tokens.dark.js',
          format: 'javascript/esm',
        },
      ],
    },
    jsonModeless: {
      transforms: [...transformGroupFigma],
      buildPath: OUTPUT_PATH + 'json/',
      files: [
        {
          destination: 'variables.modeless.json',
          format: 'json/figma',
          filter: (token) => {
            if (token.path[0] === 'core') return false;
            if (token.path[0] === 'semantic' && token.path[1] === 'color')
              return false;
            if (token.path[0] === 'semantic' && token.path[1] === 'elevation')
              return false;
            return true;
          },
        },
      ],
    },
    jsonLight: {
      transforms: ['mode-light', ...transformGroupFigma],
      buildPath: OUTPUT_PATH + 'json/',
      files: [
        {
          destination: 'variables.light.json',
          format: 'json/figma-color',
          filter: (token) => {
            return (
              token.path[0] === 'semantic' &&
              (token.path[1] === 'color' || token.path[1] === 'elevation')
            );
          },
          options: {
            outputReferences: true,
          },
        },
      ],
    },
    jsonDark: {
      transforms: ['mode-dark', ...transformGroupFigma],
      buildPath: OUTPUT_PATH + 'json/',
      files: [
        {
          destination: 'variables.dark.json',
          format: 'json/figma-color',
          filter: (token) => {
            return (
              token.path[0] === 'semantic' &&
              (token.path[1] === 'color' || token.path[1] === 'elevation')
            );
          },
          options: {
            outputReferences: true,
          },
        },
      ],
      actions: ['bundle_json'],
    },
  },
}).buildAllPlatforms();

/**
 * Modified version of `minifyDictionary` in formatHelpers module
 * that returns `{ value, type }` instead of just `value`
 * @param {Object} obj - The object to minify. You will most likely pass `dictionary.tokens` to it.
 * @returns {Object}
 */
function minifyDictionary2(obj) {
  if (typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  let output = {};

  if (obj.hasOwnProperty('value')) {
    return {
      value: obj.value,
      type: obj.type,
    };
  } else {
    for (const name in obj) {
      if (obj.hasOwnProperty(name)) {
        output[name] = minifyDictionary2(obj[name]);
      }
    }
  }
  return output;
}
