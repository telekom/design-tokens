const StyleDictionary = require('style-dictionary');
const upperFirst = require('lodash/upperFirst');

exports.PREFIX = 'scl';
exports.OUTPUT_PATH = 'build/';

exports.FIGMA_KEY_LIGHT = 'Light';
exports.FIGMA_KEY_DARK = 'Dark';

exports.figmaCase = figmaCase;

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
 * Built-in `size/rem` transform with different matcher function
 */
StyleDictionary.registerTransform({
  type: 'value',
  name: 'size/rem',
  matcher: (token) => token.original.type === 'dimension',
  transformer: StyleDictionary.transform['size/rem'].transformer,
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
