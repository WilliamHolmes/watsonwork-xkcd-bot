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

const getImageData = url => fetch(`${url}/${constants.URL_EXT}`).then(res => res.json());

app.on('message-created', (message, annotation) => {
    const { content = '', spaceId } = message;
    console.log('CONTENT', content);
    _.each(content.match(constants.regex.XKCD), url => {
        console.log('XKCD url', url);
        getImageData(`${url}/info.0.json`).then(({ img }) => {
            console.log('fetch IMG', img);
            const dest = `./temp_files/${_.last(img.split('/'))}`;
            console.log('fetch DEST', dest);
            const stream = fs.createWriteStream(dest)
            .on('error', onError)
            .on('finish', () => {
                console.log('download OK', url, img);
                app.sendFile(spaceId, dest);
                console.log('download sendFile', spaceId, dest);
                del.sync(dest, { force: true });
                console.log('download END', url, img);
            });
            request(img).pipe(stream).on('error', onError)
        }).catch(err => sendErrorMessage(spaceId, url));
    });
});