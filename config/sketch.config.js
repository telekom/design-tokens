const StyleDictionary = require('style-dictionary');
const { OUTPUT_PATH, figmaCase } = require('./shared');

const colorTransform = StyleDictionary.transform['color/sketch'].transformer;

// TODO should match font filenames
const fontFamilyMap = {
  TeleNeoWeb: 'TeleNeo',
};
const fontWeightMap = {
  200: 'Thin',
  400: 'Regular',
  500: 'Medium',
  700: 'Bold',
  800: 'ExtraBold',
};

StyleDictionary.registerFormat({
  name: 'json/sketch-gen',
  formatter: function ({ dictionary }) {
    const output = dictionary.allTokens.map((token) => {
      const name = token.path.slice(2).map(figmaCase).join('/');
      if (token.path.includes('color')) {
        return {
          _class: 'swatch',
          do_objectID: '',
          name,
          value: {
            _class: 'color',
            ...colorTransform(token),
          },
        };
      }
      if (token.path.includes('text-style')) {
        // FIXME this `name` is just a POC, this can be better handled (explore "assets")
        const fontFamily =
          fontFamilyMap['TeleNeoWeb'] +
          '-' +
          fontWeightMap[token.value['font-weight']];
        const fontSize = parseFloat(token.value['font-size']);
        const lineHeight = Math.round(
          fontSize * parseFloat(token.value['line-spacing'])
        );
        return {
          name,
          textStyle: {
            _class: 'textStyle',
            encodedAttributes: {
              MSAttributedStringColorAttribute: {
                _class: 'color',
                alpha: 1,
                blue: 0,
                green: 0,
                red: 0,
              },
              textStyleVerticalAlignmentKey: 0,
              MSAttributedStringFontAttribute: {
                _class: 'fontDescriptor',
                attributes: {
                  name: fontFamily,
                  size: fontSize,
                },
              },
              paragraphStyle: {
                _class: 'paragraphStyle',
                maximumLineHeight: lineHeight,
                minimumLineHeight: lineHeight,
              },
              kerning: token.value['letter-spacing'], // TODO check this works
            },
            verticalAlignment: 0,
          },
        };
      }
    });
    return JSON.stringify({ data: output }, null, 2);
  },
});

module.exports = {
  source: ['src/**/*.json5'],
  platforms: {
    sketch: {
      transforms: ['mode-light'],
      buildPath: OUTPUT_PATH + 'sketch/',
      files: [
        {
          destination: 'variables.json',
          format: 'json/sketch-gen',
          filter: (token) => {
            return (
              token.path[0] === 'semantic' &&
              (token.path[1] === 'color' || token.path[1] === 'text-style')
            );
          },
        },
      ],
    },
  },
};
