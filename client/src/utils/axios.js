import axios from 'axios';

// Assuming you have a function to retrieve the JWT token from localStorage or state
const getToken = () => {
  return localStorage.getItem('token'); // Replace with your actual storage method
};

// Example function making a POST request with Axios
const postData = async (data) => {
  const token = getToken(); // Retrieve the token
  try {
    const response = await axios.post('http://localhost:5000/api/protectedEndpoint', data, {
      headers: {
        'Authorization': `Bearer ${token}` // Include token in Authorization header
      }
    });
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error; // Handle error as needed
  }
};

export default postData;
