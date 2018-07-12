const _ = require('underscore');

const ID = _.now();

const constants = {
    ACTION_ID: `${ID}-xkcd-share|`,
    COLOR_ERROR: '#6E7B91',
    regex: {
        IMG: 'https://imgs.xkcd.com/comics/',
        XKCD: /https:\/\/xkcd.com\/([0-9a-z]*)/gmi
    },
    TEMP_DIR: './temp_files',
    URL_EXT: 'info.0.json',
    BUTTON_SHARE: 'Share With Space',
    NOT_FOUND: '404 - Comic Not Found',
    COMIC_SHARED: '200 - Comic Shared With Space',
}

module.exports = constants;