const fs = require('fs-extra');
const StyleDictionary = require('style-dictionary');
const { PREFIX, OUTPUT_PATH, OUTPUT_BASE_FILENAME } = require('./shared');

/*
  TODO
  - [ ] text styles: split into separate variables, plus maybe add css classes?
*/

const cssTransformGroup = StyleDictionary.transformGroup.css;

StyleDictionary.registerAction({
  name: 'bundle_css',
  do: async function (_, config) {
    const { buildPath } = config;
    try {
      const light = await fs.readFile(
        buildPath + OUTPUT_BASE_FILENAME + '.css'
      );
      const dark = await fs.readFile(
        buildPath + OUTPUT_BASE_FILENAME + '.dark.css'
      );
      await fs.writeFile(
        buildPath + OUTPUT_BASE_FILENAME + '.all.css',
        light + '\n' + dark
      );
    } catch (err) {
      // ..
    }
  },
  undo: async function () {
    //
  },
});

module.exports = {
  source: ['src/**/*.json5'],
  platforms: {
    css: {
      transforms: ['mode-light', ...cssTransformGroup, 'shadow/css'],
      prefix: PREFIX,
      buildPath: OUTPUT_PATH + 'css/',
      files: [
        {
          destination: OUTPUT_BASE_FILENAME + '.css',
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
          destination: OUTPUT_BASE_FILENAME + '.dark.css',
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
