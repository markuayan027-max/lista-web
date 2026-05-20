const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:f0e7293a94d8cc2103d3334f43db9c59@2r6c3q25.ap-southeast.database.insforge.app:5432/insforge?sslmode=require'
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT password FROM auth.users LIMIT 1");
  console.log(res.rows[0]);
  await client.end();
}
run();
