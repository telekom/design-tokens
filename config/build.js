const fs = require('fs/promises');
const deep = require('deep-get-set');
const prettier = require('prettier');
const StyleDictionary = require('style-dictionary');
const upperFirst = require('lodash/upperFirst');
const camelCase = require('lodash/camelCase');

const PREFIX = 'scl';
const OUTPUT_PATH = 'build/';
const SOURCE_PATH = 'src/';

const FIGMA_KEY_LIGHT = 'Light';
const FIGMA_KEY_DARK = 'Dark';

/**
 * This is WIP, we'll split it out in different files as we make progress.
 */

StyleDictionary.registerFormat({
  name: 'javascript/esm',
  formatter: function ({ dictionary, file }) {
    const tokens = Object.create(null);
    const header = StyleDictionary.formatHelpers.fileHeader({ file });
    deep.p = true;
    dictionary.allTokens
      .filter((token) => token.path[0] !== 'core')
      .map((token) => ({
        ...token,
        path: token.path.slice(1),
      }))
      .forEach((token) => {
        deep(tokens, token.path.map(camelCase), token.value);
      });
    const output = Object.keys(tokens).reduce((acc, name) => {
      const category = tokens[name];
      return (
        acc + `\nexport const ${name} = ${JSON.stringify(category, null, 2)}\n`
      );
    }, header);
    return prettier.format(output, {
      parser: 'babel',
      semi: false,
      singleQuote: true,
    });
  },
});

const transformsFigma = ['attribute/cti', 'shadow/figma'];

StyleDictionary.registerFormat({
  name: 'json/figma',
  formatter: function ({ dictionary }) {
    const output = formatJSON(dictionary.allTokens);
    return JSON.stringify(output, null, 2);
  },
});

StyleDictionary.registerFormat({
  name: 'json/figma-mode',
  formatter: function ({ dictionary }) {
    const output = formatJSON(
      dictionary.allTokens.filter(
        (token) =>
          token.path.includes('color') || token.path.includes('elevation')
      )
    );
    return JSON.stringify(output, null, 2);
  },
});

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
    const colorTransform =
      StyleDictionary.transform['color/sketch'].transformer;
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

StyleDictionary.registerAction({
  name: 'bundle_css',
  do: async function (dictionary, config) {
    // TODO get these from `config`?
    const COMMON_PATH = OUTPUT_PATH + 'css/';
    try {
      const light = await fs.readFile(COMMON_PATH + 'tokens.css');
      const dark = await fs.readFile(COMMON_PATH + 'tokens.dark.css');
      await fs.writeFile(COMMON_PATH + 'tokens.all.css', light + '\n' + dark);
    } catch (err) {
      // ..
    }
  },
  undo: async function () {
    const COMMON_PATH = OUTPUT_PATH + 'css/';
    await fs.rm(COMMON_PATH + 'tokens.all.css');
  },
});

StyleDictionary.registerAction({
  name: 'bundle_figma',
  do: async function (dictionary, config) {
    // TODO get these from `config`?
    const COMMON_PATH = OUTPUT_PATH + 'figma/';
    const modeless = JSON.parse(
      await fs.readFile(COMMON_PATH + 'variables.modeless.json')
    );
    const light = JSON.parse(
      await fs.readFile(COMMON_PATH + 'variables.light.json')
    );
    const dark = JSON.parse(
      await fs.readFile(COMMON_PATH + 'variables.dark.json')
    );
    const output = {
      [FIGMA_KEY_LIGHT]: { ...light },
      [FIGMA_KEY_DARK]: { ...dark },
      ...modeless,
    };
    await fs.writeFile(
      COMMON_PATH + 'variables.all.json',
      JSON.stringify(output, null, 2)
    );
  },
  undo: async function () {
    const COMMON_PATH = OUTPUT_PATH + 'json/';
    await fs.rm(COMMON_PATH + 'variables.all.json');
  },
});

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

// This does nothing for now
StyleDictionary.registerTransform({
  type: 'value',
  name: 'shadow/figma',
  // TODO remove `elevation` in path check?
  matcher: (token) =>
    token.original.type === 'shadow' || token.path.includes('elevation'),
  transformer: function (token) {
    const { value } = token.original;
    const transform = (x) => ({
      ...x,
    });
    return Array.isArray(value) ? value.map(transform) : transform(value);
  },
});

// Overwrite to change matcher
StyleDictionary.registerTransform({
  type: 'value',
  name: 'size/rem',
  matcher: (token) => token.original.type === 'dimension',
  transformer: StyleDictionary.transform['size/rem'].transformer,
});

// Overwrite to change matcher
StyleDictionary.registerTransform({
  type: 'value',
  name: 'color/css',
  matcher: (token) => token.original.type === 'color',
  transformer: StyleDictionary.transform['color/css'].transformer,
});

StyleDictionary.registerTransform({
  type: 'value',
  name: 'shadow/composite',
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

StyleDictionary.extend({
  source: [SOURCE_PATH + '**/*.json5'],
  platforms: {
    // TODO text styles: split into separate variables, plus maybe add css classes?
    css: {
      transforms: [...StyleDictionary.transformGroup.css, 'shadow/composite'],
      prefix: PREFIX,
      buildPath: OUTPUT_PATH + 'css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          filter: (token) =>
            token.path[0] !== 'core' && token.type !== 'textStyle',
          options: {
            selector: ':root, [data-mode="light"]',
          },
        },
      ],
    },
    cssDark: {
      transforms: [
        'mode-dark',
        ...StyleDictionary.transformGroup.css,
        'shadow/composite',
      ],
      prefix: PREFIX,
      buildPath: OUTPUT_PATH + 'css/',
      files: [
        {
          destination: 'tokens.dark.css',
          format: 'css/variables',
          filter: (token) =>
            token.path[0] !== 'core' &&
            token.original.value?.dark != null &&
            token.type !== 'textStyle',
          options: {
            selector: '[data-mode="dark"]',
          },
        },
      ],
      actions: ['bundle_css'],
    },
    js: {
      transforms: [
        'mode-light',
        ...StyleDictionary.transformGroup.js,
        'shadow/composite',
      ],
      buildPath: OUTPUT_PATH + 'js/',
      files: [
        {
          destination: 'tokens.light.js',
          format: 'javascript/esm',
        },
      ],
    },
    jsDark: {
      transforms: [
        'mode-dark',
        ...StyleDictionary.transformGroup.js,
        'shadow/composite',
      ],
      buildPath: OUTPUT_PATH + 'js/',
      files: [
        {
          destination: 'tokens.dark.js',
          format: 'javascript/esm',
        },
      ],
    },
    figmaModeless: {
      transforms: [...transformsFigma],
      buildPath: OUTPUT_PATH + 'figma/',
      files: [
        {
          destination: 'variables.modeless.json',
          format: 'json/figma',
          filter: (token) => {
            if (token.path[0] === 'core') return false;
            if (token.path[0] === 'semantic' && token.path[1] === 'color')
              return false;
            if (token.path[0] === 'semantic' && token.path[1] === 'elevation')
              return false;
            return true;
          },
        },
      ],
    },
    figmaLight: {
      transforms: ['mode-light', ...transformsFigma],
      buildPath: OUTPUT_PATH + 'figma/',
      files: [
        {
          destination: 'variables.light.json',
          format: 'json/figma-mode',
          filter: (token) => {
            return (
              token.path[0] === 'semantic' &&
              (token.path[1] === 'color' || token.path[1] === 'elevation')
            );
          },
          options: {
            outputReferences: true,
          },
        },
      ],
    },
    figmaDark: {
      transforms: ['mode-dark', ...transformsFigma],
      buildPath: OUTPUT_PATH + 'figma/',
      files: [
        {
          destination: 'variables.dark.json',
          format: 'json/figma-mode',
          filter: (token) => {
            return (
              token.path[0] === 'semantic' &&
              (token.path[1] === 'color' || token.path[1] === 'elevation')
            );
          },
          options: {
            outputReferences: true,
          },
        },
      ],
      actions: ['bundle_figma'],
    },
    sketch: {
      transforms: ['mode-light', ...transformsFigma],
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
}).buildAllPlatforms();

function formatJSON(allTokens, nameCaseFn = figmaCase) {
  const output = {};
  deep.p = true;
  allTokens.forEach((token) => {
    let path = token.path.map(nameCaseFn);
    if (path[0] === 'Semantic') path.shift(); // TODO remove after removing `semantic` key in source
    deep(output, path, { value: token.value, type: token.type });
  });
  return output;
}

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
