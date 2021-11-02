const StyleDictionary = require('style-dictionary')

const PREFIX = 'scl'
const CSS_OUTPUT_PATH = 'temp/tokens-mode-attr/build/'
const SOURCE_PATH = 'temp/tokens-mode-attr/'

function modeFormatWrapper(mode, format) {
  return function (args) {
    const dictionary = Object.assign({}, args.dictionary)
    // FIXME using `allProperties` here renders the references, 
    // but the values are incorrect :(
    dictionary.allTokens = dictionary.allTokens.map(token => {
      if (token.mode && token.mode[mode]) {
        return Object.assign({}, token, { value: token.mode[mode ]})
      } else {
        return token
      }
    })
    return StyleDictionary.format[format]({ ...args, dictionary })
  }
}

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

StyleDictionary.extend({
  format: {
    'dark:css/variables': modeFormatWrapper('dark', 'css/variables')
  },
  source: [
    SOURCE_PATH + '/core/**/*.json',
    SOURCE_PATH + '/system/**/*.json',
    SOURCE_PATH + '/components/**/*.json'
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: PREFIX,
      buildPath: CSS_OUTPUT_PATH + 'css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables',
        options: {
          outputReferences: true,
          selector: ':root, [data-mode="light"]'
        }
      },
      {
        destination: 'variables.dark.css',
        format: 'dark:css/variables',
        filter: (token) => token.mode != null && token.mode.dark != null,
        options: {
          outputReferences: true, // FIXME this is not being respected
          selector: '[data-mode="dark"]'
        }
      }]
    }
  }
}).buildAllPlatforms()
