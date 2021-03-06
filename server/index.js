const keys = require('./keys');

// Express
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres
const { Pool } = require('pg');
const { pgUser, pgHost, pgDatabase, pgPassword, pgPort } = keys;
const pgClient = new Pool({
    user: pgUser,
    host: pgHost,
    database: pgDatabase,
    password: pgPassword,
    port: pgPort,
});
pgClient.on('error', () => console.log('Lost PG connection'));

pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err));

// Redis
const redis = require('redis');
const { redisHost, redisPort } = keys;
const redisClient = redis.createClient({
    host: redisHost,
    port: redisPort,
    retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

// Express route handlers
app.get('/', (req, res) => {
    res.send('Hi');
});
app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values');
    res.send(values.rows);
});
app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});
app.post('/values', async (req, res) => {
    const index = req.body.index;
    if (parseInt(index) > 40) {
        return res.status(422).send('Index is too damn high');
    }
    redisClient.hset('values', index, 'Nothing here yet!');
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true });
});

app.listen(5000, err => {
    console.log('Listening...');
});