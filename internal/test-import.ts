import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../tilefix-core/tilefix-core.js') as {
  evaluateQuality?: (image: unknown, options?: unknown) => unknown;
  calculateSeamMetrics?: unknown;
};

assert.equal(typeof core.evaluateQuality, 'function', 'TileFixFireflyDoctor must export evaluateQuality');
assert.equal(typeof core.calculateSeamMetrics, 'function', 'TileFixFireflyDoctor must export calculateSeamMetrics');
console.log('Core submodule successfully imported through its actual CommonJS export.');
console.log('Note: @tilesmith/types and analyzeTile are not present in the checked-out main repo API.');
