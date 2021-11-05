const fs = require('fs/promises');
const deep = require('deep-get-set');
const prettier = require('prettier');
const StyleDictionary = require('style-dictionary');

const PREFIX = 'scl';
const CSS_OUTPUT_PATH = 'temp/tokens-mode-composite/build/';
const SOURCE_PATH = 'temp/tokens-mode-composite/';

deep.p = true;

/**
 * Testing handling light and dark modes with composite tokens
 *
 * for CSS
 * -------
 * Builds a variables.css in light mode, including core tokens,
 * and a variables.dark.css with only the dark mode overwrites.
 *
 * for Sketch
 * ----------
 * TODO
 *
 * for Figma
 * ---------
 * TODO
 */

StyleDictionary.registerFormat({
  name: 'javascript/esm',
  formatter: function ({ dictionary, file }) {
    const tokens = Object.create(null);
    const header = StyleDictionary.formatHelpers.fileHeader({ file });
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
    const light = await fs.readFile(COMMON_PATH + 'variables.css');
    const dark = await fs.readFile(COMMON_PATH + 'variables.dark.css');
    await fs.writeFile(COMMON_PATH + 'variables.all.css', light + '\n' + dark);
  },
  undo: async function () {
    const COMMON_PATH = CSS_OUTPUT_PATH + 'css/';
    await fs.rm(COMMON_PATH + 'variables.all.css');
  },
});

StyleDictionary.registerTransform({
  type: 'value',
  name: 'value/mode-light',
  transitive: true,
  transformer: function (token) {
    if (token.original.value && token.original.value.light != null) {
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
    if (token.original.value && token.original.value.dark != null) {
      return token.original.value.dark;
    }
    return token.original.value;
  },
});

StyleDictionary.extend({
  source: [
    SOURCE_PATH + '/core/**/*.json',
    SOURCE_PATH + '/system/**/*.json',
    SOURCE_PATH + '/components/**/*.json',
  ],
  platforms: {
    css: {
      transforms: ['value/mode-light', ...StyleDictionary.transformGroup.css],
      prefix: PREFIX,
      buildPath: CSS_OUTPUT_PATH + 'css/',
      files: [
        {
          destination: 'variables.css',
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
          destination: 'variables.dark.css',
          format: 'css/variables',
          filter: (token) =>
            token.original.value && token.original.value.dark != null,
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
          destination: 'variables.light.js',
          format: 'javascript/esm',
        },
      ],
    },
    jsDark: {
      transforms: ['value/mode-dark', ...StyleDictionary.transformGroup.js],
      buildPath: CSS_OUTPUT_PATH + 'js/',
      files: [
        {
          destination: 'variables.dark.js',
          format: 'javascript/esm',
        },
      ],
    },
  },
}).buildAllPlatforms();
