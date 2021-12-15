const StyleDictionary = require('style-dictionary');
const Color = require('tinycolor2');
const libraryAction = require('./sketch-library-action');
const {
  OUTPUT_PATH,
  OUTPUT_BASE_FILENAME,
  humanCase,
  fontFamilyMap,
  fontWeightMap,
} = require('./shared');

const BLACK = {
  _class: 'color',
  alpha: 1,
  blue: 0,
  green: 0,
  red: 0,
};
const WHITE = {
  _class: 'color',
  alpha: 1,
  blue: 1,
  green: 1,
  red: 1,
};

StyleDictionary.registerTransform({
  type: 'value',
  name: 'sketch/color2',
  matcher: (token) => token.path.includes('color'),
  transformer: function (token) {
    const color = Color(token.value).toRgb();
    return {
      red: (color.r / 255).toFixed(5),
      green: (color.g / 255).toFixed(5),
      blue: (color.b / 255).toFixed(5),
      alpha: color.a,
    };
  },
});

StyleDictionary.registerAction({
  name: 'bundle_sketch_library',
  ...libraryAction,
});

StyleDictionary.registerFormat({
  name: 'json/sketch-gen',
  formatter: function ({ dictionary, options }) {
    const colorTokens = dictionary.allTokens
      .filter((token) => token.path.includes('color'))
      .map(getColorShape(options));
    const textStyleTokens = dictionary.allTokens
      .filter((token) => token.path.includes('text-style'))
      .map(getTextStyleShape(options));
    const output = {
      colors: colorTokens,
      textStyles: textStyleTokens,
    };
    return JSON.stringify(output, null, 2);
  },
});

function getTokenName(token) {
  return token.path.slice(1).map(humanCase).join('/');
}

function getColorShape() {
  return (token) => {
    return {
      _class: 'swatch',
      do_objectID: '',
      name: getTokenName(token),
      value: {
        _class: 'color',
        ...token.value,
      },
    };
  };
}

function getTextStyleShape(options) {
  return (token) => {
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
          MSAttributedStringColorAttribute:
            options.mode === 'dark' ? WHITE : BLACK,
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
  };
}

module.exports = {
  source: ['src/**/*.json5'],
  platforms: {
    sketchLight: {
      transforms: ['mode-light', 'sketch/color2'],
      buildPath: OUTPUT_PATH + 'sketch/',
      files: [
        {
          destination: OUTPUT_BASE_FILENAME + '.light.json',
          format: 'json/sketch-gen',
          filter: (token) =>
            token.path[0] === 'color' || token.path[0] === 'text-style',
          options: {
            mode: 'light',
          },
        },
      ],
    },
    sketchDark: {
      transforms: ['mode-dark', 'sketch/color2'],
      buildPath: OUTPUT_PATH + 'sketch/',
      files: [
        {
          destination: OUTPUT_BASE_FILENAME + '.dark.json',
          format: 'json/sketch-gen',
          filter: (token) =>
            token.path[0] === 'color' || token.path[0] === 'text-style',
          options: {
            mode: 'dark',
          },
        },
      ],
      actions: ['bundle_sketch_library'],
    },
  },
};
