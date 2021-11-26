const fs = require('fs/promises');
const StyleDictionary = require('style-dictionary');
const { PREFIX, OUTPUT_PATH } = require('./shared');

/*
  TODO
  - [ ] text styles: split into separate variables, plus maybe add css classes?
*/

const cssTransformGroup = StyleDictionary.transformGroup.css;

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

module.exports = {
  source: ['src/**/*.json5'],
  platforms: {
    css: {
      transforms: [...cssTransformGroup, 'shadow/css'],
      prefix: PREFIX,
      buildPath: OUTPUT_PATH + 'css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          filter: (token) =>
            token.path[0] !== 'core' && token.type !== 'textStyle',
          options: {
            selector: ':root, [data-mode="light"]',
          },
        },
      ],
    },
    cssDark: {
      transforms: ['mode-dark', ...cssTransformGroup, 'shadow/css'],
      prefix: PREFIX,
      buildPath: OUTPUT_PATH + 'css/',
      files: [
        {
          destination: 'tokens.dark.css',
          format: 'css/variables',
          filter: (token) =>
            token.path[0] !== 'core' &&
            token.original.value?.dark != null &&
            token.type !== 'textStyle',
          options: {
            selector: '[data-mode="dark"]',
          },
        },
      ],
      actions: ['bundle_css'],
    },
  },
};
