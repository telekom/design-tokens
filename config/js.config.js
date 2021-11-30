const StyleDictionary = require('style-dictionary');
const deep = require('deep-get-set');
const prettier = require('prettier');
const camelCase = require('lodash/camelCase');
const { OUTPUT_PATH } = require('./shared');

/*
  TODO
  - [ ] text styles: camel case key
*/

const jsTransformGroup = StyleDictionary.transformGroup.js;

StyleDictionary.registerFormat({
  name: 'javascript/esm',
  formatter: function ({ dictionary, file }) {
    const tokens = Object.create(null);
    const header = StyleDictionary.formatHelpers.fileHeader({ file });
    deep.p = true;
    dictionary.allTokens
      .filter((token) => token.path[0] !== 'core')
      .map((token) => ({
        ...token,
        path: token.path.slice(1),
      }))
      .forEach((token) => {
        deep(tokens, token.path.map(camelCase), token.value);
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

module.exports = {
  source: ['src/**/*.json5'],
  platforms: {
    js: {
      transforms: ['mode-light', ...jsTransformGroup, 'shadow/css'],
      buildPath: OUTPUT_PATH + 'js/',
      files: [
        {
          destination: 'tokens.light.js',
          format: 'javascript/esm',
        },
      ],
    },
    jsDark: {
      transforms: ['mode-dark', ...jsTransformGroup, 'shadow/css'],
      buildPath: OUTPUT_PATH + 'js/',
      files: [
        {
          destination: 'tokens.dark.js',
          format: 'javascript/esm',
        },
      ],
    },
  },
};
