const fs = require('fs/promises');
const deep = require('deep-get-set');
const prettier = require('prettier');
const StyleDictionary = require('style-dictionary');

const PREFIX = 'scl';
const CSS_OUTPUT_PATH = 'build/';
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

StyleDictionary.registerAction({
  name: 'bundle_css',
  do: async function (dictionary, config) {
    // TODO get these from `config`?
    const COMMON_PATH = CSS_OUTPUT_PATH + 'css/';
    try {
      const light = await fs.readFile(COMMON_PATH + 'tokens.css');
      const dark = await fs.readFile(COMMON_PATH + 'tokens.dark.css');
      await fs.writeFile(COMMON_PATH + 'tokens.all.css', light + '\n' + dark);
    } catch (err) {
      // ..
    }
  },
  undo: async function () {
    const COMMON_PATH = CSS_OUTPUT_PATH + 'css/';
    await fs.rm(COMMON_PATH + 'tokens.all.css');
  },
});

StyleDictionary.registerTransform({
  type: 'value',
  name: 'value/mode-light',
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
  name: 'value/mode-dark',
  transitive: true,
  transformer: function (token) {
    if (token.original.value?.dark != null) {
      return token.original.value.dark;
    }
    return token.original.value;
  },
});

StyleDictionary.extend({
  source: [
    SOURCE_PATH + '**/*.json5',
  ],
  platforms: {
    css: {
      transforms: ['value/mode-light', ...StyleDictionary.transformGroup.css],
      prefix: PREFIX,
      buildPath: CSS_OUTPUT_PATH + 'css/',
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
      transforms: ['value/mode-dark', ...StyleDictionary.transformGroup.css],
      prefix: PREFIX,
      buildPath: CSS_OUTPUT_PATH + 'css/',
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
      transforms: ['value/mode-light', ...StyleDictionary.transformGroup.js],
      buildPath: CSS_OUTPUT_PATH + 'js/',
      files: [
        {
          destination: 'tokens.light.js',
          format: 'javascript/esm',
        },
      ],
    },
    jsDark: {
      transforms: ['value/mode-dark', ...StyleDictionary.transformGroup.js],
      buildPath: CSS_OUTPUT_PATH + 'js/',
      files: [
        {
          destination: 'tokens.dark.js',
          format: 'javascript/esm',
        },
      ],
    },
  },
}).buildAllPlatforms();
