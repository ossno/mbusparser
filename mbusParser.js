const Parser = require('./parser');

function MBusParser(b64string) {
    let parsed = new Parser(b64string);
    return parsed;
}
MBusParser.prototype = {
    constructor: MBusParser,
}

module.exports = MBusParser;