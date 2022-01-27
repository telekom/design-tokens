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
const padStart = require('lodash/padStart');
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

/**
 * We use this to prepend a sorting prefix to names based on the order in the source.
 * e.g. "Primary/Hovered" -> "03 Primary/02 Hovered"
 *
 * WARNING: logic here could almost certainly be improved/simplified
 *
 * Output should looks like this:
 *
 * const nameSortPrefixMap = {
 *   color: { // category
 *     '0': { // index position in token.path array
 *       'text-&-icon': 1, // key in path -> sort position
 *       background: 2,
 *       primary: 3,
 *       ui: 4,
 *       functional: 5,
 *       additional: 6
 *     },
 *     '1': {
 *       'text-&-icon~standard': 1, // compound key
 *       'text-&-icon~additional': 2,
 *       'text-&-icon~disabled': 3,
 *       'text-&-icon~link': 4,
 *       'text-&-icon~primary': 5,
 *       'text-&-icon~inverted': 6,
 *       'text-&-icon~functional': 7,
 *       'background~canvas': 1,
 *       'background~canvas-subtle': 2,
 *       ...
 *     }
 *   },
 *   'text-style': {},
 *   shadow: {},
 * }
 *
 * @param {object} tokens
 * @returns object
 */
function defineNameSortPrefixMap(tokens) {
  const nameSortPrefixMap = {};
  Object.keys(tokens).forEach((category) => {
    nameSortPrefixMap[category] = walk({}, tokens[category]);
  });
  return nameSortPrefixMap;

  function walk(target, source, level = -1, accumulatedPath = []) {
    if (source.hasOwnProperty('value')) {
      return;
    }
    const position = level + 1;
    Object.keys(source).forEach((key, index) => {
      const k = [...accumulatedPath, key].join('~');
      target[position] = target[position] || {};
      target[position][k] = index + 1;
      walk(target, source[key], position, [...accumulatedPath, key]);
    });
    return target;
  }
}

StyleDictionary.registerFormat({
  name: 'json/sketch-gen',
  formatter: function ({ dictionary, options }) {
    options.nameSortPrefixMap = defineNameSortPrefixMap({
      color: dictionary.tokens.color,
      'text-style': dictionary.tokens['text-style'],
      shadow: dictionary.tokens.shadow,
    });
    const colorTokens = dictionary.allTokens
      .filter((token) => token.path.includes('color'))
      .map(getColorShape(options));
    const textStyleTokens = dictionary.allTokens
      .filter((token) => token.path.includes('text-style'))
      .map(getTextStyleShape(options));
    const shadowTokens = dictionary.allTokens
      .filter((token) => token.path.includes('shadow'))
      .map(getShadowShape(options))
      // Add "Shadow" top-level in name
      .map((item) => {
        item.name = `Shadow/${item.name}`;
        return item;
      });
    const layerStyleTokens = [...shadowTokens];
    const output = {
      colors: colorTokens,
      textStyles: textStyleTokens,
      layerStyles: layerStyleTokens,
    };
    return JSON.stringify(output, null, 2);
  },
});

function getTokenName(token, nameSortPrefixMap) {
  const categoryKey = token.path[0];
  const prependSortPrefix = (key, i, arr) => {
    if (nameSortPrefixMap[categoryKey][i] == null) {
      return key;
    }
    const compoundKey = arr.slice(0, i + 1).join('~');
    const num = nameSortPrefixMap[categoryKey][i][compoundKey];
    return `${padStart(num, 2, '0')} ${key}`;
  };
  return token.path.slice(1).map(prependSortPrefix).map(humanCase).join('/');
}

function getColorShape({ nameSortPrefixMap }) {
  return (token) => {
    return {
      __uuid: token.extensions?.telekom?.sketch?.uuid,
      _class: 'swatch',
      do_objectID: '',
      name: getTokenName(token, nameSortPrefixMap),
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
      __uuid: token.extensions?.telekom?.sketch?.uuid,
      name: getTokenName(token, options.nameSortPrefixMap),
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

function getShadowShape({ nameSortPrefixMap }) {
  return (token) => {
    const shadows = token.value.map((shadow) => {
      return {
        _class: 'shadow',
        isEnabled: true,
        blurRadius: shadow.blur,
        offsetX: shadow.x,
        offsetY: shadow.y,
        spread: shadow.spread,
        color: {
          _class: 'color',
          alpha: shadow.color.alpha,
          blue: (shadow.color.color.b / 255).toFixed(5),
          green: (shadow.color.color.g / 255).toFixed(5),
          red: (shadow.color.color.r / 255).toFixed(5),
        },
        contextSettings: {
          _class: 'graphicsContextSettings',
          blendMode: 0,
          opacity: 1,
        },
      };
    });
    return {
      __uuid: token.extensions?.telekom?.sketch?.uuid,
      name: getTokenName(token, nameSortPrefixMap),
      shadows: [...shadows],
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
            token.path[0] === 'shadow',
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
            token.path[0] === 'shadow',
          options: {
            mode: 'dark',
          },
        },
      ],
      actions: ['bundle_sketch_library'],
    },
  },
};
