require('dotenv').config()

exports.config = {
    jwt_secret: process.env.jwt_token,
    mongo_uri: process.env.mongo_uri
}