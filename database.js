const {Pool} = require('pg');
const pool = new Pool({
  connectionString: procces.env.POSTGRES_URL
})

module.exports = pool;