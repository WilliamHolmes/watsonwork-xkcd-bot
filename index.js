const _ = require('underscore');
// const download = require('image-downloader');
const fetch = require('node-fetch');

const fs = require('fs');
const request = require('request');

const appFramework = require('watsonworkspace-bot');
appFramework.level('verbose');
appFramework.startServer();
const app = appFramework.create();

require('watsonworkspace-sdk').UI;

const constants = require('./js/constants');
// const strings = require('./js/strings');

app.authenticate().then(() => app.uploadPhoto('./appicon.jpg'));

const sendErrorMessage = (spaceId, url, invalid) => {
    app.sendMessage(spaceId, {
        actor: { name: 'Oh no!' },
        color: constants.COLOR_ERROR,
        text: invalid ? url : `[${url}](${url})`,
        title: 'something went wrong',
        type: 'generic',
        version: '1'
    });
}


app.on('message-created', (message, annotation) => {
    const { content = '', spaceId } = message;
    console.log('CONTENT', content);
    _.each(content.match(constants.regex.XKCD), url => {
        console.log('XKCD url', url);
        fetch(`${url}/info.0.json`).then(res => res.json()).then(({ img }) => {
            console.log('fetch IMG', img);
            // const dest =  `/${strings.chompLeft(img, constants.regex.IMG)}`;
            const dest = `./temp_files/${_.last(img.split('/'))}`;
            console.log('fetch DEST', dest);
            request.get(img).pipe(fs.createWriteStream(dest))
                .on('error', err => {
                    console.log('request ERROR', err);
                })
                .on('finish', () => {
                    console.log('download OK', url, img);
                    app.sendFile(spaceId, dest);
                    del.sync(dest, { force: true });
                    console.log('download END', url, img);
                });
        }).catch(err => {
            console.log('fetch ERROR', url, err);
            sendErrorMessage(spaceId, url, true);
        });
    });
});