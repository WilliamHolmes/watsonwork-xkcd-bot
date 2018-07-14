const _ = require('underscore');

const ID = _.now();

const constants = {
    ACTION_ID: `${ID}-xkcd-share|`,
    ACTION_RANDOM: `RANDOM`,
    COLOR_ERROR: '#6E7B91',
    regex: {
        IMG: 'https://imgs.xkcd.com/comics/',
        XKCD: /https:\/\/xkcd.com\/([0-9a-z]*)/gmi
    },
    TEMP_DIR: './temp_files',
    URL_EXT: 'info.0.json',
    BUTTON_SHARE: 'Share With Space',
    BUTTON_MORE: 'Try Another',
    NOT_FOUND: '404 - Comic Not Found',
    COMIC_SHARED: 'Shared With Space',
}

module.exports = constants;