require("ts-node").register(require('../tsconfig.json'))
require("source-map-support/register");

// Better Set inspection for failed tests

Set.prototype.inspect = function () {
    return `Set { ${Array.from(this.values()).join(', ')} }`;
}
