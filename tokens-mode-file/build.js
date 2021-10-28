const StyleDictionary = require('style-dictionary')

const PREFIX = 'scl'
const CSS_OUTPUT_PATH = 'tokens-mode-file/build/'

/**
 * Testing handling light and dark modes with file names (foo.light.json)
 * 
 * for CSS
 * -------
 * This builds a variables.css in light mode, including core tokens
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

// CSS light mode (default)
StyleDictionary.extend({
  source: [
    'tokens-mode-file/core/**.json',
    'tokens-mode-file/system/system.common.json',
    `tokens-mode-file/system/system.light.json`,
    'tokens-mode-file/components/**/*.common.json',
    'tokens-mode-file/components/**/*.light.json'
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: PREFIX,
      buildPath: CSS_OUTPUT_PATH + 'css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables'
      }],
      options: {
        outputReferences: true,
        selector: ':root'
      }
    }
  }
}).buildAllPlatforms()

// CSS dark mode
StyleDictionary.extend({
  include: [
    'tokens-mode-file/system/system.light.json',
  ],
  source: [
    'tokens-mode-file/core/**.json',
    'tokens-mode-file/system/system.common.json',
    `tokens-mode-file/system/system.dark.json`,
    'tokens-mode-file/components/**/*.dark.json'
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: PREFIX,
      buildPath: CSS_OUTPUT_PATH + 'css/',
      files: [{
        destination: 'variables.dark.css',
        format: 'css/variables',
        // Filter out `core` and `light` from output
        filter: function (token) {
          return token.filePath.indexOf('dark.json') > -1
        }
      }],
      options: {
        outputReferences: true,
        selector: '[data-mode="dark"]'
      }
    }
  }
}).buildAllPlatforms()
