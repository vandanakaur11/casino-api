const { transactionsModel, userModel } = require('../models/index');
const moment = require('moment');
require('dotenv').config();
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const sha1 = require('sha1');
const hSHa1 = require('sha-1')
const saltedSha1 = require('salted-sha1');
const _ = require('lodash');
const { findIndex } = require('lodash');

const auth = {
    key: process.env.urgent_game_token
}



// credit controller start here
const credit = async (req) => {
    const io = req.io;

    let { amount, remote_id, key } = req.query;


    let trimUrl = req.url.replace(`&key=${key}`, '');
    trimUrl = trimUrl.replace('/?', '')

    if (!amount || !remote_id || !key) {
        return {
            status: 400,
            response: `please provide all require fields`
        }
    }

    const hash = hSHa1(auth.key.concat(trimUrl));

    if (key !== hash) {
        return {
            status: 400,
            response: 'transaction reject'
        }
    }

    try {
        const findPlayer = await userModel.findOne({ remote_id }).lean();

        if (!findPlayer) return { status: 400, response: 'player not found or create player id first' }

        amount = Number(amount);

        let nowBalnc = findPlayer.balance + amount;

        const updPlayer = await userModel.findOneAndUpdate({ remote_id }, {
            credit: amount,
            balance: nowBalnc,
        })

        const createHistory = await transactionsModel.create({
            credit: amount,
            balance: nowBalnc,
            debit: 0,
            remote_id,
            date: moment().format("MM-DD-YYYY, h:mm:ss a")
        })
        createHistory.save();
        const doc_id = createHistory._id
        io.emit('update-transaction', {
            remote_id,
            doc_id
        })

        if (updPlayer) {
            return {
                status: 200,
                balance: nowBalnc
            }
        }

    } catch (error) {
        return {
            status: 400,
            response: `internal server error: ${error.message}`
        };
    }
}

// credit controller end here



// debit controller start here

const debit = async (req) => {
    let { amount, remote_id, key } = req.query;


    if (!amount || !remote_id || !key) {
        return {
            status: 400,
            response: `please provide all require fields`
        }
    }

    let trimUrl = req.url.replace(`&key=${key}`, '');
    trimUrl = trimUrl.replace('/?', '');

    const hash = hSHa1(auth.key.concat(trimUrl));

    if (key !== hash) {
        return {
            status: 400,
            response: 'transaction reject'
        }
    }

    try {

        const findPlayer = await userModel.findOne({ remote_id }).lean();

        if (!findPlayer) return { status: 400, response: 'player not found or create player id first' }

        amount = Number(amount);

        if (findPlayer.balance <= 0) {
            return {
                status: 200,
                balance: findPlayer.balance
            }
        }
        let nowBalance;
        nowBalance = findPlayer.balance - amount;

        if (nowBalance <= 0) {
            nowBalance = 0
        }

        const updPlayer = await userModel.findOneAndUpdate({ remote_id }, {
            debit: amount,
            balance: nowBalance,
        });

        const createHistory = await transactionsModel.create({
            credit: 0,
            balance: nowBalance,
            debit: amount,
            remote_id,
            date: moment().format("MM-DD-YYYY, h:mm:ss a")
        })

        createHistory.save();

        if (updPlayer) {
            return {
                status: 200,
                balance: nowBalance
            }
        }
    } catch (error) {
        return {
            status: 400,
            response: `internal server error: ${error.message}`
        };
    }
}


// debit controller end here

const currentBalance = async (req) => {
    // console.log(req.query)
    let { remote_id } = req.query;

    if (!remote_id) {
        return {
            status: 200,
            response: `please provide all require fields`
        }
    }

    try {

        const getbalance = await userModel.findOne({ remote_id });

        if (!getbalance) return { status: 400, balance: 000 };

        return {
            status: 200,
            balance: getbalance.balance
        }
    } catch (error) {
        return {
            status: 400,
            response: `internal server error: ${error.message}`
        };
    }
}

const getHistory = async (req, res) => {
    let { remote_id } = req.query;
    if (!remote_id) {
        return res.send({
            status: 404,
            history: []
        })
    }

    try {
        const history = await transactionsModel.find({ remote_id }).lean().exec();
        return res.send({
            status: 200,
            response: history
        })
    } catch (error) {
        return {
            status: 400,
            response: `internal server error: ${error.message}`
        };
    }
}

const updateTransaction = async (req, res) => {
    const { doc_id, game_id } = req.body;

    if (!doc_id || !game_id) {
        return res.send({
            error: true,
            response: 'invalid fields'
        })
    }

    try {
        const transaction = await transactionsModel.findOneAndUpdate({
            _id: doc_id
        }, { game_id }).exec();

        transaction.save();

        return res.send({
            Error: false,
            response: 'Transaction Updated'
        })
    } catch (error) {
        console.log(`Error: ${error.message}`)
    }
}

const getAllGameTopPlayer = async (req, res) => {
    let scoreList = [];
    try {
        for (let game = 1; game < 27; game++) {

            let AllPlayer = await transactionsModel.find({ game_id: game });
            
            AllPlayer = AllPlayer.map(ele => {
                if (ele !== null) return ele.remote_id;
            });

            let unique_remote_id = _.uniq(AllPlayer);
            
            let eachGameScore = [];
            for (let index = 0; index < unique_remote_id.length; index++) {
                let score = 0;
                let result = await transactionsModel.find({ remote_id: unique_remote_id[index], debit: 0 });
                result.forEach((ele) => {
                    score += ele.credit;
                });
                eachGameScore.push({

                    remote_id: unique_remote_id[index],
                    score
                });
            }
            scoreList.push({
                game_id: game,
                playeRecords: eachGameScore
            })

        }
        scoreList = scoreList.map((ele) => {
            let players = ele.playeRecords;
            players = players.map((ele) => {
                return ele.score
            });

            let maxValue = _.max(players);
            let ind = players.indexOf(maxValue)
            return {
                game_id: ele.game_id,
                highScore: ele.playeRecords[ind]
            }

        })
        return res.send({
            message: scoreList
        })

    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}

const getLeaderBoardSingleGame = async(req,res) =>{
    let {game_id} = req.query;

    try {
        let userList  = await transactionsModel.find({game_id});
        userList = userList.map(ele => {
            if (ele !== null) return ele.remote_id;
        });
        userList = _.uniq(userList);

        
        let eachGameScore = [];
            for (let index = 0; index < userList.length; index++) {
                let score = 0;
                let result = await transactionsModel.find({ remote_id: userList[index], debit: 0 , game_id:game_id});
                result.forEach((ele) => {
                    score += ele.credit;
                });
                
                eachGameScore.push({
                    
                    remote_id: userList[index],
                    score
                });
            }

        eachGameScore = _.sortBy(eachGameScore,['score'])
        eachGameScore = eachGameScore.reverse();
        console.log(eachGameScore);
        return res.send({
            Error: false,
            message: eachGameScore
        })
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}

module.exports = {
    credit,
    debit,
    currentBalance,
    getHistory,
    updateTransaction,
    getAllGameTopPlayer,
    getLeaderBoardSingleGame
}