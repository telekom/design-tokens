const StyleDictionary = require('style-dictionary');
const { OUTPUT_PATH, figmaCase } = require('./shared');

const colorTransform = StyleDictionary.transform['color/sketch'].transformer;

/*
  TODO
  - [ ] font names: match real filenames (explore sd assets)
*/

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
    const colorTokens = dictionary.allTokens
      .filter((token) => token.path.includes('color'))
      .map(getColorShape);
    const textStyleTokens = dictionary.allTokens
      .filter((token) => token.path.includes('text-style'))
      .map(getTextStyleShape);
    const output = {
      colors: colorTokens,
      textStyles: textStyleTokens,
    };
    return JSON.stringify(output, null, 2);
  },
});

function getTokenName(token) {
  return token.path.slice(2).map(figmaCase).join('/');
}

function getColorShape(token) {
  return {
    _class: 'swatch',
    do_objectID: '',
    name: getTokenName(token),
    value: {
      _class: 'color',
      ...colorTransform(token),
    },
  };
}

function getTextStyleShape(token) {
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
    name: getTokenName(token),
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

module.exports = {
  source: ['src/**/*.json5'],
  platforms: {
    sketch: {
      transforms: ['mode-light'],
      buildPath: OUTPUT_PATH + 'sketch/',
      files: [
        {
          destination: 'tokens.json',
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
