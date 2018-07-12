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

const getName = url => _.last(url.split('/'));

// const getImageData = url => fetch(`${url}/${constants.URL_EXT}`).then(res => res.json()).then(({ img }) => ({ img, fileName: getFileName(img) }));

const postComic =  (data, spaceId) => {
    const { img } = data;
    const dest = `${constants.TEMP_DIR}/${getName(img)}`;
    const stream = fs.createWriteStream(dest)
    .on('error', onError)
    .on('finish', () => {
        app.sendFile(spaceId, dest);
        del.sync(dest, { force: true });
    });
    request(img).pipe(stream).on('error', onError);
}

app.on('message-created', message => {
    const { content = '', spaceId } = message;
    _.each(content.match(constants.regex.XKCD), url => {
        xkcd.get(getName(url), (err, data) => {
            if(err) {
                sendErrorMessage(spaceId, url);
            } else {
                postComic(data);
            }
        });
    });
});

app.on('actionSelected:/RANDOM', (message, annotation) => {
    xkcd.random((err, res) => {
        const { userId } = message;
        app.sendTargetedMessage(userId, annotation, UI.generic(err, res));
    });
});

app.on('actionSelected:/LATEST', (message, annotation) => {
    xkcd.latest((err, res) => {
        const { userId } = message;
        app.sendTargetedMessage(userId, annotation, UI.generic(err, res));
    });
});

app.on('actionSelected:/GET', (message, annotation, params) => {
    xkcd.get(_.first(params), (err, res) => {
        const { userId } = message;
        app.sendTargetedMessage(userId, annotation, UI.generic(err, res));
    });
 });
