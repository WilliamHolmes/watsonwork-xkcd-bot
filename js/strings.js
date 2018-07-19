const string = require('string');

const strings = {
    chompLeft: (str, value) => string(str).chompLeft(value).s,
    substitue: (str, values) => string(str).template(values).s,
    between: (str, str1, str2) => string(str).between(str1, str2).s
}

module.exports = strings;