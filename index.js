const _ = require('underscore');
const download = require('image-downloader');
const fetch = request('node-fetch');

const appFramework = require('watsonworkspace-bot');
appFramework.level('verbose');
appFramework.startServer();
const app = appFramework.create();

const UI = require('watsonworkspace-sdk').UI;

const constants = require('./js/constants');
const strings = require('./js/strings');

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
        // const imageId = strings.chompLeft(url.toLowerCase(), constants.regex.KEY);
        // console.log('XKCD imageId', imageId);
        fetch.get(`${url}/info.0.json`).then(res => res.json()).then(data => {
            console.log('fetchival data', data);
            const { img, num } = data;
            const dest =  `./${constants.TEMP_DIR}/xkcd_${num}.png`;
            download.image({ url: img, dest }).then(() => {
                console.log('download OK');
                app.sendFile(spaceId, dest);
                del.sync(dest, { force: true });
            }).catch(err => {
                console.log('download ERROR', err);
                sendErrorMessage(spaceId, url);
            });
        }).catch(err => {
            console.log('fetchival ERROR', err);
            sendErrorMessage(spaceId, url, true);
        });
    });
});