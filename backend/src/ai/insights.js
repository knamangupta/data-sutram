const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateInsights(categorizedTransactions) {
  // 1. Compute Deterministic Aggregates
  let totalIn = 0;
  let totalOut = 0;
  const categorySpend = {};

  for (const tx of categorizedTransactions) {
    if (tx.type === 'CREDIT') {
      totalIn += tx.amount;
    } else {
      totalOut += tx.amount;
      categorySpend[tx.category] = (categorySpend[tx.category] || 0) + tx.amount;
    }
  }

  const summary = { totalIn, totalOut, net: totalIn - totalOut, categorySpend };
  let insights = ["Upload more complete data for tailored AI insights."];
  
  // 2. Generate AI Insights based strictly on aggregates
  if (process.env.OPENAI_API_KEY && categorizedTransactions.length > 0) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a financial advisor. Analyze the JSON summary and generate 3 short, specific financial insights. Return strictly JSON: {"insights": ["insight 1", "insight 2", "insight 3"]}' },
          { role: 'user', content: JSON.stringify(summary) }
        ],
        response_format: { type: 'json_object' }
      });
      insights = JSON.parse(response.choices[0].message.content).insights;
    } catch (error) {
      console.error("OpenAI Insight Error:", error);
      insights = ["AI insights are currently unavailable due to a service error. You can still view your deterministic aggregates."];
    }
  }
  return { summary, insights };
}

module.exports = { generateInsights };