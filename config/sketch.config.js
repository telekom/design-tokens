/**
 * Telekom Design Tokens https://github.com/telekom/design-tokens
 *
 * Copyright (c) 2021 Lukas Oppermann and contributors, Deutsche Telekom AG
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const StyleDictionary = require('style-dictionary');
const Color = require('tinycolor2');
const libraryAction = require('./sketch-library-action');
const {
  humanCase,
  isColorAlphaComposite,
  fontFamilyMap,
  fontWeightMap,
} = require('./shared');

const { OUTPUT_PATH, OUTPUT_BASE_FILENAME } = process.env;
const WHITELABEL = process.env.WHITELABEL !== 'false';

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
  transitive: true,
  transformer: function (token) {
    let color = Color(token.value);
    if (isColorAlphaComposite(token.value)) {
      const value = Color(token.value.color);
      if (value.isValid()) {
        value.setAlpha(token.value.alpha);
        color = value;
      }
    }
    return color.toRgb();
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
    const layerStyleTokens = dictionary.allTokens
      .filter((token) => token.path.includes('elevation'))
      .map(getLayerStyleShape(options));
    const output = {
      colors: colorTokens,
      textStyles: textStyleTokens,
      layerStyles: layerStyleTokens,
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
        red: (token.value.r / 255).toFixed(5),
        green: (token.value.g / 255).toFixed(5),
        blue: (token.value.b / 255).toFixed(5),
        alpha: String(token.value.a),
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

function getLayerStyleShape() {
  return (token) => {
    const elevations = token.value.map((elevation) => {
      let elevationShape = {
        _class: 'shadow',
        isEnabled: true,
        blurRadius: elevation.blur,
        offsetX: elevation.x,
        offsetY: elevation.y,
        spread: elevation.spread,
        color: {
          _class: 'color',
          alpha: elevation.color.alpha,
          blue: (elevation.color.color.b / 255).toFixed(5),
          green: (elevation.color.color.g / 255).toFixed(5),
          red: (elevation.color.color.r / 255).toFixed(5),
        },
        contextSettings: {
          _class: 'graphicsContextSettings',
          blendMode: 0,
          opacity: 1,
        },
      };
      return elevationShape;
    });
    return {
      name: getTokenName(token),
      elevations: [...elevations],
    };
  };
}

module.exports = {
  include: ['src/core/**/*.json5'],
  source: [
    ...(WHITELABEL === false ? ['src/telekom/core/**.json5'] : []),
    'src/semantic/**/*.json5',
  ],
  platforms: {
    sketchLight: {
      transforms: ['mode-light', 'sketch/color2'],
      buildPath: OUTPUT_PATH + 'sketch/',
      files: [
        {
          destination: OUTPUT_BASE_FILENAME + '.light.json',
          format: 'json/sketch-gen',
          filter: (token) =>
            token.path[0] === 'color' ||
            token.path[0] === 'text-style' ||
            token.path[0] === 'elevation',
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
            token.path[0] === 'color' ||
            token.path[0] === 'text-style' ||
            token.path[0] === 'elevation',
          options: {
            mode: 'dark',
          },
        },
      ],
      actions: ['bundle_sketch_library'],
    },
  },
};
