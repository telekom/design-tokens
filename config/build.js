const StyleDictionary = require('style-dictionary');
const fs = require('fs-extra');

require('./shared'); // register common transforms

const configs = [
  require('./css.config'),
  require('./js.config'),
  require('./figma.config'),
  require('./sketch.config'),
];

configs.forEach((config) => StyleDictionary.extend(config).buildAllPlatforms());

if (process.env.DIST) {
  updateDistFolder();
}

/**
 * Copy outputs that get checked in git to dist folder.
 * @todo explain why this is here
 */
async function updateDistFolder() {
  await fs.emptyDir('dist');
  await fs.copy('build/figma', 'dist/figma');
  await fs.copy('build/sketch', 'dist/sketch');
}
