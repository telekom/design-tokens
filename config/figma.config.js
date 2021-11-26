const fs = require('fs/promises');
const deep = require('deep-get-set');
const StyleDictionary = require('style-dictionary');
const {
  OUTPUT_PATH,
  FIGMA_KEY_LIGHT,
  FIGMA_KEY_DARK,
  figmaCase,
} = require('./shared');

const figmaTransformGroup = ['attribute/cti', 'shadow/figma'];

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

/**
 * This does nothing for now
 */
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

module.exports = {
  source: ['src/**/*.json5'],
  platforms: {
    figmaModeless: {
      transforms: [...figmaTransformGroup],
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
      transforms: ['mode-light', ...figmaTransformGroup],
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
      transforms: ['mode-dark', ...figmaTransformGroup],
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
  },
};
