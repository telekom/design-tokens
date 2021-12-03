const uuid = require('uuid-by-string');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const { OUTPUT_BASE_FILENAME, OUTPUT_PATH } = require('./shared');

const SKETCH_FIXTURE_FILENAME = 'library.sketch'
// const FIXTURE_PAGE_ID = '351F5B97-9A3C-4842-B95E-065998538D97';

module.exports = {
  do: async function (_, config) {
    init();
    decompress();
    // await updateLibrary(config, 'light');
    // await updateLibrary(config, 'dark');
    compress();
    cleanup();
  },
  undo: function () {
    fs.rmdirSync('build/sketch/light/');
    fs.rmdirSync('build/sketch/dark/');
  },
};

function init() {
  fs.mkdirpSync('config/tmp/sketch-library-light/');
  fs.mkdirpSync('config/tmp/sketch-library-dark/');
  fs.mkdirpSync('build/sketch/light/');
  fs.mkdirpSync('build/sketch/dark/');
}

function cleanup() {
  fs.rmSync('config/tmp/', { recursive: true, force: true });
}

function decompress() {
  execSync(
    `unzip -o -d config/tmp/sketch-library-light/ config/fixtures/${SKETCH_FIXTURE_FILENAME}`
  );
  execSync(
    `unzip -o -d config/tmp/sketch-library-dark/ config/fixtures/${SKETCH_FIXTURE_FILENAME}`
  );
}

function compress() {
  execSync(
    `zip -r ${OUTPUT_PATH}sketch/light/${OUTPUT_BASE_FILENAME}.sketch config/tmp/sketch-library-light/`
  );
  execSync(
    `zip -r ${OUTPUT_PATH}sketch/dark/${OUTPUT_BASE_FILENAME}.sketch config/tmp/sketch-library-dark/`
  );
}

async function updateLibrary({ buildPath }, mode) {
  const documentFilepath = `config/tmp/sketch-library-${mode}/document.json`;
  // const mainPageFilepath = `config/tmp/sketch-library-${mode}/pages/${FIXTURE_PAGE_ID}.json`;
  const tokens = JSON.parse(
    await fs.readFile(buildPath + OUTPUT_BASE_FILENAME + `.${mode}.json`)
  );
  const document = JSON.parse(await fs.readFile(documentFilepath));
  // const mainPage = JSON.parse(await fs.readFile(mainPageFilepath));
  document.sharedSwatches.objects = [...tokens.textStyles.map(colorSwatch)];
  document.layerTextStyles.objects = [...tokens.colors.map(textStyle)];
  // mainPage.layers[0].layers[0].overrideValues[0].value = `Design Tokens (${mode})`;
  // mainPage.layers[0].layers[0].overrideValues[1].value =
  //   new Date().toUTCString();
  await fs.writeFile(documentFilepath, JSON.stringify(document));
  // await fs.writeFile(mainPageFilepath, JSON.stringify(mainPage));
}

function colorSwatch(token) {
  return {
    ...token,
    do_objectID: uuid(token.name, 5).toUpperCase(),
  };
}

function textStyle(token) {
  return {
    _class: 'sharedStyle',
    do_objectID: uuid(token.name, 5).toUpperCase(),
    name: token.name,
    value: {
      _class: 'style',
      do_objectID: uuid(token.name + ' style', 5).toUpperCase(),
      endMarkerType: 0,
      miterLimit: 10,
      startMarkerType: 0,
      windingRule: 1,
      blur: {
        _class: 'blur',
        isEnabled: false,
        center: '{0.5, 0.5}',
        motionAngle: 0,
        radius: 10,
        saturation: 1,
        type: 0,
      },
      borderOptions: {
        _class: 'borderOptions',
        isEnabled: true,
        dashPattern: [],
        lineCapStyle: 0,
        lineJoinStyle: 0,
      },
      borders: [],
      colorControls: {
        _class: 'colorControls',
        isEnabled: false,
        brightness: 0,
        contrast: 1,
        hue: 0,
        saturation: 1,
      },
      contextSettings: {
        _class: 'graphicsContextSettings',
        blendMode: 0,
        opacity: 1,
      },
      fills: [],
      innerShadows: [],
      shadows: [],
      textStyle: { ...token.textStyle },
    },
  };
}
