const {Pool} = require('pg');
const pool = new Pool({
  connectionString: proccess.env.POSTGRES_URL
})

module.exports = pool;