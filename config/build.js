/**
 * Telekom Design Tokens https://github.com/telekom/design-tokens
 *
 * Copyright (c) 2021 Lukas Oppermann and contributors, Deutsche Telekom AG
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const StyleDictionary = require('style-dictionary');

// Register common transforms
require('./shared');

// e.g. `css` -> `require('./css.config')`
const configs = process.env.CONFIG.split(',').map((name) =>
  require(`./${name}.config`)
);

// Build all configs
configs.forEach((config) => StyleDictionary.extend(config).buildAllPlatforms());
