const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CATEGORIES = ['Food', 'Travel', 'Utilities', 'Shopping', 'Salary', 'Transfer', 'Other'];

// Layer 1 & 2: Fast Local Heuristics
function localCategorize(description) {
  const desc = description.toLowerCase();
  
  if (desc.match(/(zomato|swiggy|restaurant|mcdonalds|dominos|kfc|pizza|cafe|starbucks|food|grocery|blinkit|zepto|instamart|bigbasket|dmart)/)) return 'Food';
  if (desc.match(/(uber|ola|irctc|makemytrip|cleartrip|flight|indigo|ticket|train|bus|metro|rapido|petrol|fuel|hpcl|bpcl|ioc|shell|yatra)/)) return 'Travel';
  if (desc.match(/(amazon|flipkart|myntra|ajio|meesho|shopping|retail|mall|store|supermarket|mart|ikea|zara|h&m|lifestyle|pantaloons|pos\s*debit|purchase)/)) return 'Shopping';
  if (desc.match(/(salary|payroll|bonus|stipend|wages|salary|credited)/)) return 'Salary';
  if (desc.match(/(electricity|jio|airtel|recharge|vodafone|vi|bsnl|broadband|wifi|internet|water|gas|utility|bill|billdesk|postpaid|bescom)/)) return 'Utilities';
  if (desc.match(/(upi|neft|imps|rtgs|transfer|paytm|phonepe|gpay|bharatpe|cred|ach|atm|cash|withdrawal|deposit)/)) return 'Transfer';
  if (desc.match(/(movie|cinema|netflix|amazon prime|hotstar|spotify|hotstar|bookmyshow|pvr|inox|entertainment)/)) return 'Entertainment';
  if (desc.match(/(pharmacy|hospital|clinic|doctor|apollo|medplus|netmeds|health|medical|insurance|policy)/)) return 'Health';

  return null; // Unknown
}

/**
 * Categorizes an array of transactions using heuristics and OpenAI
 */
async function categorizeTransactions(transactions) {
  const categorized = [];
  const unknowns = [];

  // Pass 1: Local Heuristics
  for (const tx of transactions) {
    const category = localCategorize(tx.description);
    if (category) {
      categorized.push({ ...tx, category });
    } else {
      unknowns.push(tx);
    }
  }

  // Pass 2: OpenAI Batching for Unknowns
  if (unknowns.length > 0 && process.env.OPENAI_API_KEY) {
    // For MVP, we limit to 50 to avoid massive token usage in one go.
    const batch = unknowns.slice(0, 50); 
    const mappingPrompt = batch.map(tx => `ID: ${tx.id}, Desc: "${tx.description}"`).join('\n');

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `Map each transaction ID to a category: ${CATEGORIES.join(', ')}. Return strictly JSON like: {"mappings": [{"id": 1, "category": "Food"}]}` },
          { role: 'user', content: mappingPrompt }
        ],
        response_format: { type: 'json_object' }
      });

      const aiMapping = JSON.parse(response.choices[0].message.content).mappings;
      const aiMap = new Map(aiMapping.map(m => [m.id, m.category]));

      for (const tx of unknowns) categorized.push({ ...tx, category: aiMap.get(tx.id) || 'Other' });
    } catch (error) {
      console.error("OpenAI Categorization Error:", error);
      unknowns.forEach(tx => categorized.push({ ...tx, category: 'Other' }));
    }
  } else {
    unknowns.forEach(tx => categorized.push({ ...tx, category: 'Other' }));
  }

  // Sort back by ID to maintain chronological order
  return categorized.sort((a, b) => a.id - b.id);
}

module.exports = { categorizeTransactions };