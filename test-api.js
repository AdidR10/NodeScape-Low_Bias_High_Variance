const axios = require('axios');

const testApiConnection = async () => {
  const testData = {
    edgelist: "0,1;1,2;2,3"
  };

  try {
    console.log('Testing API connection...');
    console.log('Backend URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000');
    
    const response = await axios.post('http://localhost:5000/predict', testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });

    console.log('✅ API connection successful!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ API connection failed!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
};

// Run the test if this file is executed directly
if (require.main === module) {
  testApiConnection();
}

module.exports = { testApiConnection }; 