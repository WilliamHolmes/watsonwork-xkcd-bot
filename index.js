const _ = require('underscore');
const del = require('delete');
const fetch = require('node-fetch');

const fs = require('fs');
const request = require('request');

const appFramework = require('watsonworkspace-bot');
appFramework.level('verbose');
appFramework.startServer();
const app = appFramework.create();

const UI = require('watsonworkspace-sdk').UI;

const constants = require('./js/constants');
const xkcd = require('./js/xkcd');

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

const getName = url => _.last(url.split('/'));

const postComic =  (data, spaceId) => {
    const { img } = data;
    const dest = `${constants.TEMP_DIR}/${getName(img)}`;
    const stream = fs.createWriteStream(dest)
    .on('error', onError)
    .on('finish', () => {
        app.sendFile(spaceId, dest);
        del.sync(dest, { force: true });
    });
    request(img).pipe(stream).on('error', console.error);
}

app.on('message-created', message => {
    const { content = '', spaceId } = message;
    _.each(content.match(constants.regex.XKCD), url => {
        xkcd.get(getName(url)).then(res => postComic(res, spaceId)).catch(() => sendErrorMessage(spaceId, url));
    });
});

app.on('actionSelected:/RANDOM', (message, annotation) => {
    xkcd.random().then(res => {
        const { userId } = message;
        app.sendTargetedMessage(userId, annotation, UI.generic(err, res));
    });
});

app.on('actionSelected:/LATEST', (message, annotation) => {
    xkcd.latest().then(res => {
        const { userId } = message;
        app.sendTargetedMessage(userId, annotation, UI.generic(err, res));
    });
});

app.on('actionSelected:/GET', (message, annotation, params) => {
    xkcd.get(_.first(params)).then(res => {
        const { userId } = message;
        app.sendTargetedMessage(userId, annotation, UI.generic(err, res));
    });
 });
