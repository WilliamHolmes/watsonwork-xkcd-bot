const _ = require('underscore');

const ID = '0b3c5f29-57f5-4005-8b90-e90c6fea69d7';

const constants = {
    ACTION_ID: `${ID}-xkcd-share|`,
    ACTION_RANDOM: `RANDOM_CARD`,
    COLOR_ERROR: '#6E7B91',
    regex: {
        NUM: /^https:\/\/xkcd.com\/(\d+)/,
        IMG: 'https://imgs.xkcd.com/comics/',
        XKCD: /https:\/\/xkcd.com\/([0-9a-z]*)/gmi
    },
    FEED: 'https://xkcd.com/rss.xml',
    TEMP_DIR: './temp_files',
    URL_EXT: 'info.0.json',
    BUTTON_SHARE: 'Share With Space',
    BUTTON_MORE: 'Try Another',
    NOT_FOUND: '404 - Comic Not Found',
    COMIC_SHARED: 'Shared With Space',
}

module.exports = constants;