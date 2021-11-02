const fs = require('fs/promises')
const StyleDictionary = require('style-dictionary')

const PREFIX = 'scl'
const CSS_OUTPUT_PATH = 'temp/tokens-mode-composite/build/'
const SOURCE_PATH = 'temp/tokens-mode-composite/'

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
  do: async function(dictionary, config) {
    // TODO get these from `config`?
    const COMMON_PATH = CSS_OUTPUT_PATH + 'css/'
    const light = await fs.readFile(COMMON_PATH + 'variables.css')
    const dark = await fs.readFile(COMMON_PATH + 'variables.dark.css')
    await fs.writeFile(COMMON_PATH + 'variables.all.css', light + '\n' + dark)
  },
  undo: async function() {
    const COMMON_PATH = CSS_OUTPUT_PATH + 'css/'
    await fs.rm(COMMON_PATH + 'variables.all.css')
  }
})

StyleDictionary.registerTransform({
  type: 'value',
  name: 'value/mode-light',
  transitive: true,
  transformer: function(token) {
    if (token.original.value && token.original.value.light != null) {
      return token.original.value.light
    }
    return token.original.value
  }
})

StyleDictionary.registerTransform({
  type: 'value',
  name: 'value/mode-dark',
  transitive: true,
  transformer: function(token) {
    if (token.original.value && token.original.value.dark != null) {
      return token.original.value.dark
    }
    return token.original.value
  }
})

StyleDictionary.registerTransformGroup({
  name: 'css-mode-light',
  transforms: ['value/mode-light', ...StyleDictionary.transformGroup.css]
})

StyleDictionary.registerTransformGroup({
  name: 'css-mode-dark',
  transforms: ['value/mode-dark', ...StyleDictionary.transformGroup.css]
})

StyleDictionary.extend({
  source: [
    SOURCE_PATH + '/core/**/*.json',
    SOURCE_PATH + '/system/**/*.json',
    SOURCE_PATH + '/components/**/*.json'
  ],
  platforms: {
    css: {
      transformGroup: 'css-mode-light',
      prefix: PREFIX,
      buildPath: CSS_OUTPUT_PATH + 'css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables',
        options: {
          outputReferences: true,
          selector: ':root, [data-mode="light"]'
        }
      }]
    }
  }
}).buildAllPlatforms()

StyleDictionary.extend({
  source: [
    SOURCE_PATH + '/core/**/*.json',
    SOURCE_PATH + '/system/**/*.json',
    SOURCE_PATH + '/components/**/*.json'
  ],
  platforms: {
    css: {
      transformGroup: 'css-mode-dark',
      prefix: PREFIX,
      buildPath: CSS_OUTPUT_PATH + 'css/',
      files: [{
        destination: 'variables.dark.css',
        format: 'css/variables',
        filter: (token) => token.original.value && token.original.value.dark != null,
        options: {
          outputReferences: true,
          selector: '[data-mode="dark"]'
        }
      }],
      actions: ['bundle_css']
    }
  }
}).buildAllPlatforms()
