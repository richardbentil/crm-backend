/* const axios = require('axios');
const ErrorResponse = require('../utils/errorResponse');

const AI_API_URL = process.env.AI_API_URL;
const AI_API_KEY = process.env.AI_API_KEY;

exports.generateContent = async (prompt, contentType) => {
  try {
    const response = await axios.post(
      `${AI_API_URL}/generate`,
      {
        prompt,
        contentType
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.generatedContent;
  } catch (error) {
    throw new ErrorResponse('Error generating AI content', 500);
  }
};

exports.optimizeContent = async (content, contentType) => {
  try {
    const response = await axios.post(
      `${AI_API_URL}/optimize`,
      {
        content,
        contentType
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.optimizedContent;
  } catch (error) {
    throw new ErrorResponse('Error optimizing content', 500);
  }
};

 */