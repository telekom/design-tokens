const StyleDictionary = require('style-dictionary');
const upperFirst = require('lodash/upperFirst');
const camelCase = require('lodash/camelCase');
const kebabCase = require('lodash/kebabCase');
const color = require('tinycolor2');

const PREFIX = process.env.PREFIX || 'telekom';
const OUTPUT_PATH = process.env.OUTPUT_PATH || 'build/';
const OUTPUT_BASE_FILENAME =
  process.env.OUTPUT_BASE_FILENAME || 'telekom-design-tokens';

const FIGMA_KEY_LIGHT = 'Light';
const FIGMA_KEY_DARK = 'Dark';

const ALWAYS_LOWERCASE = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

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

function humanCase(str) {
  if (ALWAYS_LOWERCASE.includes(str)) {
    return str;
  }
  return str
    .toLowerCase()
    .replace('-', ' ')
    .replace('-icon', ' icon') // weird edge case
    .split(/\s/)
    .map(upperFirst)
    .join(' ')
    .replace('Ui', 'UI');
}

// Transforms

StyleDictionary.registerTransform({
  name: 'name/cti/kebab2',
  type: 'name',
  transformer: function (token, options) {
    const name = [options.prefix]
      .concat(token.path)
      .map((x) => x.replace('&', 'and'))
      .join(' ');
    return kebabCase(name);
  },
});

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
 * Built-in `color/css` transform with different matcher function
 */
StyleDictionary.registerTransform({
  type: 'value',
  name: 'color/alpha',
  transitive: true,
  matcher: (token) => token.original.type === 'color',
  transformer: function (token) {
    if (
      token.value.hasOwnProperty('color') &&
      typeof token.value.alpha === 'number'
    ) {
      // FIXME the value here is the reference :(
      // and there's no access here to dictionary.getReference() to resolve?
      const value = color(token.value.color);
      console.log('color/alpha', token.value); // { color: '{core.color.grey.0.value}', alpha: 0.3 }
      if (!value.isValid()) return token.value;
      value.setAlpha(token.value.alpha);
      return value.toHexString();
    }
    return token.value;
  },
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
  humanCase,
  fontFamilyMap,
  fontWeightMap,
};
