const express  = require('express');
const redis = require('redis');
const port = 3000;
const redisPort = 6379;
const USER_NAME = 'username';

const app = express();
const client = redis.createClient({
    legacyMode: true
});

client.connect()
    .then(async (res) => {
        console.log('connected');
    })
    .catch((err) => {
        console.log('err happened' + err);
    });

// request data from repository
async function getRepo(req, res) {
    const username = req.params.username;
    console.log('username: ' + username);
    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        const {public_repos} = await response.json();
        // cache data to redis
        client.set(username, public_repos);
        res.send("HTTP");
    } catch (error) {
        console.log(error);
        res.status(404);
    }
}

// cache middleware 
function cache(req, res, next) {
    const username = req.params.username;
    //console.log('username: CC ' + username);
    client.get(username, (err, data) => {
        if (err) throw err.message;
        if (data != null) {
            res.send("cached data");
        } else {
            next();
        }
    });
}

app.get(`/repos/:${USER_NAME}`, cache, getRepo);

app.listen(port, () => {
    console.log("Server listening on port " + port);
});