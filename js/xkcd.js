const API = require('xkcd-api');
const rssToJSON = require('rss-to-json');
const _ = require('underscore');

const constants = require('./constants');
const strings = require('./strings');

const getDate = date => {
    const d = new Date(date);
    return {
        month: d.getUTCMonth() + 1,
        year: d.getUTCFullYear(),
        day: d.getUTCDate()
    }
};

const getFeed = () => {
    return new Promise((resolve, reject) => {
        rssToJSON.load(constants.FEED, (err, rss) => err ? reject(err) : resolve(rss));
    });
};

const parseFeed = data => {
    return _.map(data.items, ({ title, description, url, created }) => {
        const { day, month, year } = getDate(created);
        const num = url.match(constants.regex.NUM)[1];
        const alt = strings.between(description, 'title="', '"');
        const img = strings.between(description, 'src="', '"');
        return { alt, title, num, day, month, year, img }
    });
}

const get = id => new Promise((resolve, reject) => API.get(id, (err, res) => err ? reject(err) : resolve(res)));
const latest = () => new Promise((resolve, reject) => API.latest((err, res) => err ? reject(err) : resolve(res)));
const random = () => new Promise((resolve, reject) => API.random((err, res) => err ? reject(err) : resolve(res)));
const feed = () => new Promise((resolve, reject) => getFeed().then(parseFeed).then(resolve).catch(reject));

module.exports = { get, latest, random, feed };