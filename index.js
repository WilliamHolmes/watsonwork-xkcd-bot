const _ = require('underscore');
const del = require('delete');
// const fetch = require('node-fetch');

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

const sendErrorMessage = (spaceId, url) => {
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
    console.log('postComic', img);
    const dest = `${constants.TEMP_DIR}/${getName(img)}`;
    const stream = fs.createWriteStream(dest)
    .on('error', console.error)
    .on('finish', () => {
        app.sendFile(spaceId, dest);
        del.sync(dest, { force: true });
    });
    request(img).pipe(stream).on('error', console.error);
}

app.on('message-created', message => {
    const { content = '', spaceId } = message;
    _.each(content.match(constants.regex.XKCD), url => {
        const id = getName(url);
        xkcd.get(id).then(res => postComic(res, spaceId)).catch(() => sendErrorMessage(spaceId, url));
    });
});

app.on('actionSelected:/RANDOM', (message, annotation) => {
    xkcd.random().then(res => {
        const { userId } = message;
        app.sendTargetedMessage(userId, annotation, UI.generic('Comic', res));
    });
});

app.on('actionSelected:/LATEST', (message, annotation) => {
    xkcd.latest().then(res => {
        const { userId } = message;
        app.sendTargetedMessage(userId, annotation, UI.generic('Comic', res));
    });
});

app.on('actionSelected:/GET', (message, annotation, params) => {
    xkcd.get(_.first(params)).then(res => {
        const { userId } = message;
        app.sendTargetedMessage(userId, annotation, UI.generic('Comic', res));
    });
 });
