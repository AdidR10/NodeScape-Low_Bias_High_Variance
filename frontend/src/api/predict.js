// API function to send edge list data to backend for prediction
import axios from 'axios';

const API_BASE_URL = 'https://api.graph-predict.com';

/**
 * Send edge list data to backend for prediction
 * @param {string} formattedEdges - The formatted edge list string
 * @returns {Promise<Object>} - Response from the backend
 */
export const sendPredictionRequest = async (formattedEdges) => {
  // TODO: Uncomment when API is ready
  // try {
  //   const response = await axios.post(`${API_BASE_URL}/predict`, {
  //     edges: formattedEdges
  //   }, {
  //     headers: {
  //       'Content-Type': 'application/json',
  //     }
  //   });

  //   return {
  //     success: true,
  //     data: response.data
  //   };
  // } catch (error) {
  //   console.error('Error sending prediction request:', error);
  //   return {
  //     success: false,
  //     error: error.response?.data?.message || error.message
  //   };
  // }

  // Mock response for now
  console.log('Mock API call - Edges:', formattedEdges);
  return {
    success: true,
    data: { "value": 2 }
  };
}; 