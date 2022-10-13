const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const transactionsScheema = new Schema({
    remote_id: {
        type: String
    },
    game_id: {
        type: String
    },
    email: {
        type: String
    },
    balance: {
        type: Number
    },
    date: {
        type: String
    },
    credit: {
        type: Number
    },
    debit: {
        type: Number
    }
}, { timestamps: true }
)

exports.transactionsModel = mongoose.model("transactions", transactionsScheema);