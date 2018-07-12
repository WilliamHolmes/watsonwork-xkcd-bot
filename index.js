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
    const dest = `${constants.TEMP_DIR}/${getName(img)}`;
    const stream = fs.createWriteStream(dest)
    .on('error', console.error)
    .on('finish', () => {
        app.sendFile(spaceId, dest);
        del.sync(dest, { force: true });
    });
    request(img).pipe(stream).on('error', console.error);
}

const postCard = (message, annotation, data) => {
    const { userId } = message;
    const { alt, title, num, day, month, year } = data;
    const date = +(new Date(`${month}/${day}/${year}`));
    const subTitle = `Comic #${num}`;
    const card = UI.card(title, subTitle, alt, [UI.cardButton(constants.BUTTON_SHARE, 'some_action_id')], date);
    app.sendTargetedMessage(userId, annotation, [card]);
}

const postAnnotation = (message, annotation, title = '', description = '') => {
    const { userId } = message;
    app.sendTargetedMessage(userId, annotation, UI.generic(title, description));
}

const onCardError = (message, annotation, error) => {
    postAnnotation(message, annotation, constants.NOT_FOUND, error);
}

app.on('message-created', message => {
    const { content = '', spaceId } = message;
    _.each(content.match(constants.regex.XKCD), url => {
        xkcd.get(getName(url)).then(data => postComic(data, spaceId)).catch(() => sendErrorMessage(spaceId, url));
    });
});

app.on('actionSelected:/RANDOM', (message, annotation) => {
    xkcd.random().then(data => postCard(message, annotation, data)).catch(error => onCardError(message, annotation, error));
});

app.on('actionSelected:/LATEST', (message, annotation) => {
    xkcd.latest().then(data => postCard(message, annotation, data)).catch(error => onCardError(message, annotation, error));
});

app.on('actionSelected:/GET', (message, annotation, params) => {
    xkcd.get(_.first(params)).then(data => postCard(message, annotation, data)).catch(error => onCardError(message, annotation, error));
 });
