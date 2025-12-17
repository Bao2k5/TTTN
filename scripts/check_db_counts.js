// scripts/check_db_counts.js
require('dotenv').config();
const mongoose = require('mongoose');
(async function(){
  try{
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/thuongmaidientu';
    await mongoose.connect(uri);
    console.log('Connected to', uri);
    const names = ['adminlogs','carts','collections','products','orders','users','reviews','promos'];
    for(const n of names){
      const col = mongoose.connection.collection(n);
      const exists = await col.countDocuments().catch(()=>null);
      console.log(n.padEnd(12), ':', exists === null ? 'collection missing or error' : exists);
    }
    await mongoose.disconnect();
  }catch(err){
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
