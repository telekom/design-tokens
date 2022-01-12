const StyleDictionary = require('style-dictionary');
const upperFirst = require('lodash/upperFirst');
const camelCase = require('lodash/camelCase');
const kebabCase = require('lodash/kebabCase');
const cloneDeep = require('lodash/cloneDeep');
const Color = require('tinycolor2');

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

function isColorAlphaComposite(value) {
  return value.hasOwnProperty('color') && typeof value.alpha === 'number';
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
    if (token.value?.light != null) {
      return token.value.light;
    }
    return token.value;
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
    if (token.value?.dark != null) {
      return token.value.dark;
    }
    return token.value;
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
 * Handle composite colors with `alpha`, also for "shadow" type
 * e.g. { value: { color: "{core.color.black}", alpha: 0.5 }
 */
StyleDictionary.registerTransform({
  type: 'value',
  name: 'color/alpha',
  transitive: true,
  matcher: (token) =>
    token.original.type === 'color' || token.original.type === 'shadow',
  transformer: getColorAlphaTransform(),
});

/**
 * Handle composite colors with `alpha`, return hex8
 */
StyleDictionary.registerTransform({
  type: 'value',
  name: 'color/alpha-hex',
  transitive: true,
  matcher: (token) =>
    token.original.type === 'color' || token.original.type === 'shadow',
  transformer: getColorAlphaTransform('toHex8String'),
});

function getColorAlphaTransform(outputMethod = 'toHslString') {
  return function (token) {
    // Handle `shadow` type
    if (token.original.type === 'shadow' && typeof token.value === 'object') {
      const output = cloneDeep(token.value); // don't want mutation accidents
      const hasCompositeValues = output.some((x) =>
        isColorAlphaComposite(x.color)
      );
      if (hasCompositeValues) {
        try {
          return output.map((value) =>
            isColorAlphaComposite(value.color)
              ? {
                  ...value,
                  color: transformColorComposite(value.color)[outputMethod](),
                }
              : value
          );
        } catch (err) {
          return token.value;
        }
      }
      return token.value;
    }
    // Handle `color` type
    if (isColorAlphaComposite(token.value)) {
      try {
        return transformColorComposite(token.value)[outputMethod]();
      } catch (err) {
        return token.value;
      }
    }
    // Do nothing
    return token.value;
  };
}

/**
 * @param {{ color: string, alpha: number }} value
 * @returns tinycolor2 instance
 */
function transformColorComposite(value) {
  const output = Color(value.color);
  if (!output.isValid()) throw new TypeError('Color value is not valid');
  output.setAlpha(value.alpha);
  return output;
}

/**
 * Handle composite shadow tokens
 */
StyleDictionary.registerTransform({
  type: 'value',
  name: 'shadow/css',
  transitive: true,
  matcher: (token) => token.original.type === 'shadow',
  transformer: (token) => {
    if (typeof token.value === 'string') return token.value;
    const px = (x) => `${x}px`;
    const toCssValue = ({ x, y, blur, spread, color }) => {
      const colorValue = (
        isColorAlphaComposite(color)
          ? transformColorComposite(color)
          : Color(color)
      ).toHslString();
      return `${px(x)} ${px(y)} ${px(blur)} ${px(spread)} ${colorValue}`;
    };
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
  isColorAlphaComposite,
  fontFamilyMap,
  fontWeightMap,
};
