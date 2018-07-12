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

// const getImageData = url => fetch(`${url}/${constants.URL_EXT}`).then(res => res.json()).then(({ img }) => ({ img, fileName: getFileName(img) }));
const getImageData = url => request(`${url}/${constants.URL_EXT}`).then(res => JSON.parse(res)).then(({ img }) => ({ img, fileName: getFileName(img) }));

app.on('message-created', (message, annotation) => {
    const { content = '', spaceId } = message;
    _.each(content.match(constants.regex.XKCD), url => {
        getImageData(url).then(({ img, fileName }) => {
            const dest = `${constants.TEMP_DIR}/${fileName}`;
            const stream = fs.createWriteStream(dest)
            .on('error', onError)
            .on('finish', () => {
                app.sendFile(spaceId, dest);
                del.sync(dest, { force: true });
            });
            request(img).pipe(stream).on('error', onError)
        }).catch(err => sendErrorMessage(spaceId, url));
    });
});