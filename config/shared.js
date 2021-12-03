const StyleDictionary = require('style-dictionary');
const upperFirst = require('lodash/upperFirst');
const camelCase = require('lodash/camelCase');

const PREFIX = process.env.PREFIX || 'scl';
const OUTPUT_PATH = process.env.OUTPUT_PATH || 'build/';
const OUTPUT_BASE_FILENAME =
  process.env.OUTPUT_BASE_FILENAME || 'telekom-design-tokens';

const FIGMA_KEY_LIGHT = 'Light';
const FIGMA_KEY_DARK = 'Dark';

// TODO font names: match real filenames (explore sd assets)
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

function figmaCase(str) {
  return str
    .toLowerCase()
    .replace('Ui', 'UI')
    .replace('&-', '& ') // weird edge case
    .replace('-', ' ')
    .split(/\s/)
    .map(upperFirst)
    .join(' ');
}

// Transforms

/**
 * Use only `light` values from composite light/dark tokens
 */
StyleDictionary.registerTransform({
  type: 'value',
  name: 'mode-light',
  transitive: true,
  transformer: function (token) {
    if (token.original.value?.light != null) {
      return token.original.value.light;
    }
    return token.original.value;
  },
});

/**
 * Use only `dark` values from composite light/dark tokens
 */
StyleDictionary.registerTransform({
  type: 'value',
  name: 'mode-dark',
  transitive: true,
  transformer: function (token) {
    if (token.original.value?.dark != null) {
      return token.original.value.dark;
    }
    return token.original.value;
  },
});

/**
 * Transform px to rem, replace built-in
 */
StyleDictionary.registerTransform({
  type: 'value',
  name: 'size/rem',
  matcher: (token) =>
    token.original.type === 'dimension' &&
    token.original.value.indexOf('px') > -1,
  transformer: function (token) {
    return `${parseFloat(token.original.value) / 16}rem`;
  },
});

/**
 * Built-in `color/css` transform with different matcher function
 */
StyleDictionary.registerTransform({
  type: 'value',
  name: 'color/css',
  matcher: (token) => token.original.type === 'color',
  transformer: StyleDictionary.transform['color/css'].transformer,
});

/**
 * Handle composite shadow tokens
 */
StyleDictionary.registerTransform({
  type: 'value',
  name: 'shadow/css',
  matcher: (token) => token.original.type === 'shadow',
  transformer: (token) => {
    const px = (x) => `${x}px`;
    const toCssValue = ({ x, y, blur, spread, color }) =>
      `${px(x)} ${px(y)} ${px(blur)} ${px(spread)} ${color}`;
    return Array.isArray(token.value)
      ? token.value.map(toCssValue).join(', ')
      : toCssValue(token.value);
  },
});

/**
 * Camel case keys for text styles
 */
StyleDictionary.registerTransform({
  type: 'value',
  name: 'text-style/camel',
  transitive: true,
  matcher: (token) => token.path[0] === 'text-style',
  transformer: function (token) {
    const output = {};
    for (const prop in token.value) {
      output[camelCase(prop)] = token.value[prop];
    }
    return output;
  },
});

module.exports = {
  PREFIX,
  OUTPUT_PATH,
  OUTPUT_BASE_FILENAME,
  FIGMA_KEY_LIGHT,
  FIGMA_KEY_DARK,
  figmaCase,
  fontFamilyMap,
  fontWeightMap,
};
