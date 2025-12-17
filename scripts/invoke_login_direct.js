require('dotenv').config();
const mongoose = require('mongoose');
const auth = require('../BE/src/controllers/auth.controller');
(async ()=>{
  await mongoose.connect(process.env.MONGO_URI);
  const req = { body: { email: 'admin@example.com', password: 'admin123' } };
  const res = { status(code){ this._status = code; return this; }, json(obj){ console.log('RES STATUS:', this._status||200); console.log('RES BODY:', obj); return obj; } };
  try{
    await auth.login(req, res);
    process.exit(0);
  }catch(e){ console.error('invoke error', e); process.exit(1); }
})();
