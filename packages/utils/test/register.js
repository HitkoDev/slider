require('ts-node').register(require('../tsconfig.json'))
require('source-map-support/register')
require('reflect-metadata')

// Better Set inspection for failed tests

Set.prototype.inspect = function () {
    return `Set { ${Array.from(this.values()).join(', ')} }`;
}
