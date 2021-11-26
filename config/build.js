const StyleDictionary = require('style-dictionary');

require('./shared'); // register common transforms

const configs = [
  require('./css.config'),
  require('./js.config'),
  require('./figma.config'),
  require('./sketch.config'),
];

configs.forEach((config) => StyleDictionary.extend(config).buildAllPlatforms());
