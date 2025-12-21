const axios = require('axios');

(async function(){
  try{
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZThiNGEwNmQ3NmE1Y2Q4NTczM2UxZCIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiaWRtaW4iLCJpYXQiOjE3NjIxNDc2NTMsImV4cCI6MTc2Mjc1MjQ1M30.cQbxBORTxnE0rEadFDExSRVcCZtmn5W-P2P9B7yIE0c';
    const id = '69083d45a20a410fda654244';
    const res = await axios.delete(`http://localhost:3000/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Delete response:', res.data);
  } catch (e) {
    console.error('Error:', e.response ? e.response.data : e.message);
  }
})();
