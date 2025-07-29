// API function to send edge list data to backend for prediction
import axios from 'axios';

// Determine API URL based on environment
const getApiBaseUrl = () => {
  // In Docker environment, use relative URL (nginx will proxy)
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  // In development, use the environment variable or default to localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Send edge list data to backend for prediction
 * @param {string} formattedEdges - The formatted edge list string
 * @returns {Promise<Object>} - Response from the backend
 */
export const sendPredictionRequest = async (formattedEdges) => {
  try {
    console.log('Sending request to:', `${API_BASE_URL}/predict`);
    console.log('Request data:', { edgelist: formattedEdges });
    
    const response = await axios.post(`${API_BASE_URL}/predict`, {
      edgelist: formattedEdges
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000 // 10 second timeout
    });

    console.log('Backend response:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error sending prediction request:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
}; 