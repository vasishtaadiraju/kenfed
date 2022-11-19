const {Client} = require('pg')

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "osdm007$",
    database: "kenfed"
})

module.exports = client