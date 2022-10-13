const express = require('express');
const { credit, debit, currentBalance, getHistory, updateTransaction, getAllGameTopPlayer, getLeaderBoardSingleGame } = require('../controllers/adminController');
require('dotenv').config()
const hSHa1 = require('sha-1');
const auth = {
    token: process.env.rune_scape,
    casino_id: process.env.casino_id,
    key: process.env.urgent_game_token
}




const app = express();

const router = express.Router();

router.get('/', async (req, res) => {
    let { action } = req.query;

    if (action === 'credit') {
        let data = await credit(req);
        return res.json(data);
    }

    if (action === 'debit') {
        let data = await debit(req);
        return res.json(data);
    }

    if (action === 'balance') {

        let { key } = req.query;

        if (!key) {

            return res.json({
                status: 400,
                response: 'reject transaction'
            });
        }
        let url = req.url.replace(`&key=${key}`, '');

        url = url.replace('/?', '');

        const hash = hSHa1(auth.key.concat(url));


        if (key === hash) {

            let data = await currentBalance(req);
            return res.json(data);
        } else {
            return res.json({
                status: 400,
                response: 'reject transaction'
            });
        }
    }
})



router.get('/fe', async (req, res) => {

    let { action, casino_id, token } = req.query;
    if (!action) return res.json({
        status: 400,
        response: 'indentifiy the action first'
    })
    if (action === 'credit') {
        if (!casino_id || !token) {
            return res.json({
                status: 400,
                response: 'Need token verification'
            })
        }

        if (auth.casino_id !== casino_id || auth.token !== token) {
            return res.json({
                status: 400,
                response: 'Invalid token and casino id'
            });
        }

        let data = await credit(req);
        return res.json(data);

    }

    if (action === 'debit') {
        if (!casino_id || !token) {
            return res.json({
                status: 400,
                response: 'Need token verification'
            })
        }

        if (auth.casino_id !== casino_id || auth.token !== token) {
            return res.json({
                status: 400,
                response: 'Invalid token and casino id'
            });
        }
        let data = await debit(req);
        return res.json(data);
    }

    if (action === 'balance') {
        // if (!casino_id || !token) {
        //     return res.json({
        //         status: 400,
        //         response: 'Need token verification'
        //     })
        // }

        // if (auth.casino_id !== casino_id || auth.token !== token) {
        //     return res.json({
        //         status: 400,
        //         response: 'Invalid token and casino id'
        //     });
        // }
        let data = await currentBalance(req);
        return res.json(data);
    }
})

router.get('/transactions', getHistory);

router.post('/update-transaction', updateTransaction);

router.get('/getAllTopPlayer', getAllGameTopPlayer)

router.get('/getLeaderBoard', getLeaderBoardSingleGame);

exports.adminRoute = app.use("/admin", router);