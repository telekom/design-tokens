const fs = require('fs/promises');
const StyleDictionary = require('style-dictionary');

const PREFIX = 'scl';
const CSS_OUTPUT_PATH = 'temp/tokens-mode-file/build/';
const SOURCE_PATH = 'temp/tokens-mode-file/';

/**
 * Testing handling light and dark modes with filenames (foo.light.json)
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

// CSS light mode (default)
StyleDictionary.extend({
  source: [
    SOURCE_PATH + 'core/**.json',
    SOURCE_PATH + 'system/system.common.json',
    SOURCE_PATH + `system/system.light.json`,
    SOURCE_PATH + 'components/**/*.common.json',
    SOURCE_PATH + 'components/**/*.light.json',
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: PREFIX,
      buildPath: CSS_OUTPUT_PATH + 'css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
        },
      ],
      options: {
        outputReferences: true,
        selector: ':root, [data-mode="light"]',
      },
    },
  },
}).buildAllPlatforms();

// CSS dark mode
StyleDictionary.extend({
  include: [SOURCE_PATH + 'system/system.light.json'],
  source: [
    SOURCE_PATH + 'core/**.json',
    SOURCE_PATH + 'system/system.common.json',
    SOURCE_PATH + `system/system.dark.json`,
    SOURCE_PATH + 'components/**/*.dark.json',
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: PREFIX,
      buildPath: CSS_OUTPUT_PATH + 'css/',
      files: [
        {
          destination: 'variables.dark.css',
          format: 'css/variables',
          // Filter out `core` and `light` from output
          filter: function (token) {
            return token.filePath.indexOf('dark.json') > -1;
          },
        },
      ],
      options: {
        outputReferences: true,
        selector: '[data-mode="dark"]',
      },
      actions: ['bundle_css'],
    },
  },
}).buildAllPlatforms();
