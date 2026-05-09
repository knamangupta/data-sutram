const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

/**
 * Uploads a bank statement PDF to the backend for processing.
 * @param {File} file - The PDF file object from an input or drag-and-drop.
 * @returns {Promise<{ message: string, summary: Object, insights: Array, transactions: Array }>}
 */
export const uploadStatement = async (file) => {
  const formData = new FormData();
  formData.append('statement', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload statement');
  }

  return response.json();
};

/**
 * Sends a chat query along with the parsed transactions context.
 * @param {string} query - The user's question.
 * @param {Array} transactions - The parsed transactions array stored in the frontend state.
 * @returns {Promise<{ answer: string }>}
 */
export const askChatAssistant = async (query, transactions) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, transactions }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get chat response');
  }

  return response.json();
};