const API = require('xkcd-api');

const callBack = (err, res) => {
    if (err) {
        return Promise.reject(err);
    } else {
        return Promise.resolve(res);
    }
};

const get = id => new Promise((resolve, reject) => API.get(id, (err, res) => err ? reject(err) : resolve(res)));
const latest = () => new Promise((resolve, reject) => API.latest((err, res) => err ? reject(err) : resolve(res)));
const random = () => new Promise((resolve, reject) => API.random((err, res) => err ? reject(err) : resolve(res)));

module.exports = { get, latest, random };