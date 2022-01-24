/**
 * Telekom Design Tokens https://github.com/telekom/design-tokens
 *
 * Copyright (c) 2021 Lukas Oppermann and contributors, Deutsche Telekom AG
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const uuid = require('uuid-by-string');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const { version } = require('../package.json');

const { OUTPUT_PATH, OUTPUT_BASE_FILENAME } = process.env;

const SKETCH_FIXTURE_FILENAME = 'design-tokens.sketch';
const FIXTURE_PAGE_ID = '351F5B97-9A3C-4842-B95E-065998538D97';

/*
  TODO
  - [ ] evaluate using https://www.npmjs.com/package/yazl instead of bash' zip
        for cross-platform support
*/

module.exports = {
  do: function (_, config) {
    init('light');
    init('dark');
    decompress('light');
    decompress('dark');
    updateLibrary(config, 'light');
    updateLibrary(config, 'dark');
    compress('light');
    compress('dark');
    cleanup();
  },
  undo: function () {
    fs.rmSync(OUTPUT_PATH + 'sketch/light/', { recursive: true, force: true });
    fs.rmSync(OUTPUT_PATH + 'sketch/dark/', { recursive: true, force: true });
  },
};

function init(mode) {
  fs.mkdirpSync(`config/tmp/sketch-library-${mode}/`);
  fs.mkdirpSync(`${OUTPUT_PATH}sketch/${mode}/`);
}

function cleanup() {
  fs.rmSync('config/tmp/', { recursive: true, force: true });
}

function decompress(mode) {
  execSync(
    `unzip -o -d config/tmp/sketch-library-${mode}/ config/fixtures/${SKETCH_FIXTURE_FILENAME}`
  );
}

function compress(mode) {
  const root = process.cwd();
  process.chdir(`config/tmp/sketch-library-${mode}`);
  execSync(`zip -r -X ${OUTPUT_BASE_FILENAME}.sketch *`);
  process.chdir(root);
  fs.copyFileSync(
    `config/tmp/sketch-library-${mode}/${OUTPUT_BASE_FILENAME}.sketch`,
    `${OUTPUT_PATH}sketch/${mode}/${OUTPUT_BASE_FILENAME}.sketch`
  );
}

function updateLibrary({ buildPath }, mode) {
  const documentFilepath = `config/tmp/sketch-library-${mode}/document.json`;
  const mainPageFilepath = `config/tmp/sketch-library-${mode}/pages/${FIXTURE_PAGE_ID}.json`;
  const tokens = JSON.parse(
    fs.readFileSync(buildPath + OUTPUT_BASE_FILENAME + `.${mode}.json`)
  );
  const document = JSON.parse(fs.readFileSync(documentFilepath));
  const mainPage = JSON.parse(fs.readFileSync(mainPageFilepath));
  const now = new Date();

  // Insert tokens as swatches and text styles into document.json
  document.sharedSwatches.objects = tokens.colors.map(colorSwatch).map(cleanUpIdKey);
  document.layerTextStyles.objects = tokens.textStyles.map(textStyle).map(cleanUpIdKey);
  document.layerStyles.objects = tokens.layerStyles.map(layerStyle).map(cleanUpIdKey);

  // Add build information to main page
  mainPage.layers[0].layers[0].overrideValues[0].value = `Design Tokens (${mode})`;
  mainPage.layers[0].layers[0].overrideValues[1].value = `v${version} (generated on ${now.toUTCString()})`;
  fs.writeFileSync(documentFilepath, JSON.stringify(document));
  fs.writeFileSync(mainPageFilepath, JSON.stringify(mainPage));
}

function cleanUpIdKey(token) {
  delete token.__uuid
  return token
}

function colorSwatch(token) {
  return {
    ...token,
    do_objectID: token.__uuid,
  };
}

function textStyle(token) {
  return {
    _class: 'sharedStyle',
    do_objectID: token.__uuid,
    name: token.name,
    value: {
      _class: 'style',
      // Generate an extra uuid based on the parent UUID
      do_objectID: uuid(token.__uuid, 5).toUpperCase(),
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

function layerStyle(token) {
  return {
    _class: 'sharedStyle',
    do_objectID: token.__uuid,
    name: token.name,
    value: {
      _class: 'style',
      // Generate an extra uuid based on the parent UUID
      do_objectID: uuid(token.__uuid, 5).toUpperCase(),
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
      shadows: [...token.elevations],
    },
  };
}
