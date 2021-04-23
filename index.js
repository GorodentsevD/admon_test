const express = require('express');
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());


const buffer = require('./buffer')(process.env.BUFFER_IMPL);

/**
 * @param {string} req.body.message
 */
app.post('/give', async (req, res) => {
    try {
        if (!req.body.message) {
            return res.status(400).send({
                error: {
                    code: 400,
                    message: 'Attribute `message` is required'
                }
            });
        }

        await buffer.storeMessage(req.body.message);

        return res.end();
    } catch (e) {
        console.log('something went wrong on /give route', e);
        return res.send({
            error: {
                code: 500,
                message: e.message || 'Internal server error'
            }
        });
    }
});

/**
 * @param {number} [req.query.count] - count of rows
 */
app.get('/receive', async (req, res) => {
    try {
        const count = req.query && req.query.count;

        const messages = await buffer.getMessages(count || null);

        return res.send(messages);
    } catch (e) {
        console.log('something went wrong on /receive route', e);
        return res.send({
            error: {
                code: 500,
                message: e.message || 'Internal server error'
            }
        })
    }
});

app.listen(process.env.APP_PORT, () => {
    console.log(`app listening at http://localhost:${process.env.APP_PORT}`)
});