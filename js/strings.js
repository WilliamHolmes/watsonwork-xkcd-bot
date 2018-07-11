const string = require('string');

const strings = {
    chompLeft: (str, value) => string(str).chompLeft(value).s,
    substitue: (str, values) => string(str).template(values).s
}

module.exports = strings;