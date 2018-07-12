const _ = require('underscore');
const del = require('delete');
const fetch = require('node-fetch');

const xkcd = require('xkcd-api');

const fs = require('fs');
const request = require('request');

const appFramework = require('watsonworkspace-bot');
appFramework.level('verbose');
appFramework.startServer();
const app = appFramework.create();

const UI = require('watsonworkspace-sdk').UI;

const constants = require('./js/constants');

app.authenticate().then(() => app.uploadPhoto('./appicon.jpg'));

const sendErrorMessage = (spaceId, url, invalid) => {
    app.sendMessage(spaceId, {
        actor: { name: 'Oh no!' },
        color: constants.COLOR_ERROR,
        text: `[${url}](${url})`,
        title: 'something went wrong',
        type: 'generic',
        version: '1'
    });
}

const onError = err => console.log('request ERROR', err);

const getFileName = imgURL => _.last(imgURL.split('/'));

const getImageData = url => fetch(`${url}/${constants.URL_EXT}`).then(res => res.json()).then(({ img }) => ({ img, fileName: getFileName(img) }));


const getComic = (message, annotation, data) => {
    const { err, res } = data;
    if (err) {
        const { userId } = message;
        app.sendTargetedMessage(userId, annotation, UI.generic(constants.NOT_FOUND, ''))
    } else {
        sendComic(message, res)
    }
}

const sendComic = (message, data) => {
    const { img } = data;
    const fileName = getFileName(img);
    const dest = `${constants.TEMP_DIR}/${fileName}`;
    const stream = fs.createWriteStream(dest)
        .on('error', onError)
        .on('finish', () => {
            app.sendFile(message.spaceId, dest);
            del.sync(dest, { force: true });
        });
    request(img).pipe(stream).on('error', onError)
}

app.on('message-created', message => {
    const { content = '', spaceId } = message;
    _.each(content.match(constants.regex.XKCD), url => {
        getImageData(url).then(data => sendComic(message, data)).catch(err => sendErrorMessage(spaceId, url));
    });
});

app.on('actionSelected:/random', (message, annotation, params) => {
    xkcd.random(({ ...data }) => getComic(message, annotation, data));
});

app.on('actionSelected:/latest', (message, annotation, params) => {
    console.log('actionSelected latest', message, annotation, params);
});

app.on('actionSelected:/get', (message, annotation, params) => {
    console.log('actionSelected get', message, annotation, params);
 });
