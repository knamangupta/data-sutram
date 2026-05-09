const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function processChatQuery(query, transactions) {
  if (!process.env.OPENAI_API_KEY) {
    return "OpenAI API key is missing. Chat is currently disabled.";
  }

  try {
    // Compress transactions to save tokens and fit well within context limits
    const compressedTx = transactions.map(tx => `[${tx.date}] ${tx.description} - ${tx.amount} ${tx.type} (${tx.category})`).join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful and precise financial AI assistant. Use the following bank statement data to answer the user's query. Do not offer general financial advice. If the answer is not in the data, state 'I cannot find this in your statement'. Calculate amounts carefully.\n\nTransactions:\n${compressedTx}`
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.2, // Low temperature prevents math hallucinations
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Chat Error:", error);
    throw error; // Fail explicitly
  }
}

module.exports = { processChatQuery };