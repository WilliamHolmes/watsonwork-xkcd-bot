const _ = require('underscore');
const del = require('delete');

const fs = require('fs');
const request = require('request');

const appFramework = require('watsonworkspace-bot');
appFramework.level('verbose');
appFramework.startServer();
const app = appFramework.create();

const UI = require('watsonworkspace-sdk').UI;

const constants = require('./js/constants');
const strings = require('./js/strings');
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

const postComic = (data, spaceId) => {
    const { img } = data;
    const dest = `${constants.TEMP_DIR}/${getName(img)}`;
    return new Promise((resolve, reject) => {
        request(img).pipe(fs.createWriteStream(dest)
            .on('error', reject)
            .on('finish', () => {
                app.sendFile(spaceId, dest);
                del.sync(dest, { force: true });
                resolve();
            })).on('error', reject);
    })
}

const postAnnotation = (message, annotation, title = '', description = '') => {
    const { userId } = message;
    app.sendTargetedMessage(userId, annotation, UI.generic(title, description));
}

const postCard = (message, annotation, data, buttons = []) => {
    const { userId } = message;
    const { alt, title, num, day, month, year, img } = data;
    const date = +(new Date(`${month}/${day}/${year}`));
    const subTitle = `Comic #${num}`;
    const actionId = `${constants.ACTION_ID}${JSON.stringify({ alt, title, num, day, month, year, img })}`;
    const card = UI.card(title, subTitle, alt, [UI.cardButton(constants.BUTTON_SHARE, actionId), ...buttons], date);
    app.sendTargetedMessage(userId, annotation, [card]);
}

const postRandomCard = (message, annotation, data) => {
    return postCard(message, annotation, data, [UI.cardButton(constants.BUTTON_MORE, `${constants.ACTION_ID}${constants.ACTION_RANDOM}`)]);
}

const onComicError = (message, annotation, error) => {
    postAnnotation(message, annotation, constants.NOT_FOUND, error);
}

const onComicShared = (message, annotation, data) => {
    const { title, num } = data;
    postAnnotation(message, annotation, `Comic #${num} - ${title}`, constants.COMIC_SHARED);
}

// EVENT Handlers

const onMessageReceived = message => {
    const { content = '', spaceId } = message;
    _.each(content.match(constants.regex.XKCD), url => {
        xkcd.get(getName(url)).then(data => postComic(data, spaceId)).catch(() => sendErrorMessage(spaceId, url));
    });
};

const getRandomComic = (message, annotation) => {
    xkcd.random().then(data => postRandomCard(message, annotation, data)).catch(error => onComicError(message, annotation, error));
}

const getLatestComic = (message, annotation) => {
    xkcd.latest().then(data => postCard(message, annotation, data)).catch(error => onComicError(message, annotation, error));
};

const getComicById = (message, annotation, params) => {
    const comicId = _.first(params);
    xkcd.get(comicId).then(data => postCard(message, annotation, data)).catch(error => onComicError(message, annotation, error));
};

const onActionSelected = (message, annotation) => {
    const { actionId = '' } = annotation;
    if (actionId.includes(constants.ACTION_ID)) {
        const action = strings.chompLeft(actionId, constants.ACTION_ID);
        switch (action) {
            case constants.ACTION_RANDOM:
                return getRandomComic(message, annotation);
            default:
                return postComic(JSON.parse(action), message.spaceId).then(() => onComicShared(message, annotation, data)).catch(err => onComicError(message, annotation, error));
        }
    }
}

// EVENTS

app.on('message-created', onMessageReceived);

app.on('actionSelected:/RANDOM', getRandomComic);

app.on('actionSelected:/LATEST', getLatestComic);

app.on('actionSelected:/GET', getComicById);

app.on('actionSelected', onActionSelected);