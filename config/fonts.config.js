const StyleDictionary = require('style-dictionary');
const { PREFIX, OUTPUT_PATH, OUTPUT_BASE_FILENAME } = process.env;
const WHITELABEL = process.env.WHITELABEL !== 'false';
const fs = require('fs-extra');

// Register an "attribute" transform to codify the font's details
// as named attributes.

StyleDictionary.registerTransform({
  name: 'attribute/static-font',
  type: 'attribute',
  transformer: prop => ({
    category: prop.path[0],
    type: prop.path[1],
    family: prop.path[2],
    weight: prop.path[3],
    style: prop.path[4]
  })
});

StyleDictionary.registerTransform({
  name: 'attribute/variable-font',
  type: 'attribute',
  transformer: prop => ({
    category: prop.path[0],
    type: prop.path[1],
    family: prop.path[2],
    weight: prop.path[3],
    style: prop.path[4]
  })
});

// Register a custom format to generate @font-face rules.
StyleDictionary.registerFormat({
  name: 'static-font-face',
  formatter: ({ dictionary: { allTokens }, options }) => {
    const fontPathPrefix = options.fontPathPrefix || '../';
    console.log('in font transform', allTokens)
    // https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src
    const formatsMap = {
      'woff2': 'woff2',
      'woff2-variations': 'woff2-variations',
      'woff': 'woff',
      'ttf': 'truetype',
      'otf': 'opentype',
      'svg': 'svg',
      'eot': 'embedded-opentype'
    };
    console.log('IN FONTS CONFIG',PREFIX, OUTPUT_BASE_FILENAME, OUTPUT_PATH)

    return allTokens.reduce((fontList, prop) => {
      const {
        attributes: { family, weight, style },
        formats,
        value: path
      } = prop;

      const urls = formats
        .map(extension => `url("${fontPathPrefix}${path}.${extension}") format("${formatsMap[extension]}")`);

      const fontCss = [
        '@font-face {',
        `\n\tfont-family: "${family}";`,
        `\n\tfont-style: ${style};`,
        `\n\tfont-weight: ${weight};`,
        `\n\tsrc: ${urls.join(',\n\t\t\t ')};`,
        '\n\tfont-display: fallback;',
        '\n}\n'
      ].join('');

      fontList.push(fontCss);

      return fontList;
    }, []).join('\n');
  }
});

// Register a custom format to generate @font-face rules.
StyleDictionary.registerFormat({
  name: 'variable-font-face',
  formatter: ({ dictionary: { allTokens }, options }) => {
    const fontPathPrefix = options.fontPathPrefix || '../';
    console.log('in font transform', allTokens)
    // https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src
    const formatsMap = {
      'woff2-variations': 'woff2-variations',
    };

    return allTokens.reduce((fontList, prop) => {
      const {
        attributes: { family, style, weight },
        formats,
        value: path,
        weightRange,
        fontStretch
      } = prop;
      if (weight === "variable") {
        const urls = formats
        .map(extension => `url("${fontPathPrefix}${path}.woff2") format("${formatsMap[extension]}")`);

        const fontCss = [
          '@font-face {',
          `\n\tfont-family: "${family}";`,
          `\n\tfont-style: ${style};`,
          `\n\tfont-weight: ${weightRange};`,
          `\n\tfont-stretch: ${fontStretch};`,
          `\n\tsrc: ${urls.join(',\n\t\t\t ')};`,
          '\n\tfont-display: fallback;',
          '\n}\n'
        ].join('');

        fontList.push(fontCss);
      }
      return fontList;
    }, []).join('\n');
  }
});

StyleDictionary.registerAction({
  name: 'copyFonts',
  do: function(dictionary, config) {
    console.log('Copying assets directory', config.buildPath);
    fs.copySync('./src/telekom/fonts', OUTPUT_PATH + 'fonts');
  }
});

module.exports = {
//   source: ['tokens.json'],
source: [
    ...(WHITELABEL === false ? ['src/telekom/core/font.tokens.json5'] : []),
    'src/semantic/font.tokens.json5',
  ],
  platforms: {
    staticFonts: {
      transforms: ['attribute/static-font'],
      prefix: PREFIX,
      buildPath: OUTPUT_PATH + 'css/',
      files: [
        {
          destination: OUTPUT_BASE_FILENAME + '.static-fonts.css',
          format: 'static-font-face',
          filter: {
            attributes: {
              category: 'asset',
              type: 'font'
            }
          },
        }
      ],
      actions: ['copyFonts']      
    },
    variableFonts: {
      transforms: ['attribute/variable-font'],
      prefix: PREFIX,
      buildPath: OUTPUT_PATH + 'css/',
      files: [
        {
          destination: OUTPUT_BASE_FILENAME + '.variable-fonts.css',
          format: 'variable-font-face',
          filter: {
            attributes: {
              category: 'asset',
              type: 'font'
            }
          },
        }
      ],
      actions: ['copyFonts']      
    }    
  }
}