const fs = require('fs');
const PDFParser = require('pdf2json');

/**
 * MVP Bank Statement Parser
 * Extracts text from a PDF and uses basic heuristics to find transactions.
 */
async function parsePDF(filePath) {
  console.log(`🔍 Starting PDF parse for file: ${filePath}`);
  
  const text = await new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1); // 1 tells it to extract raw text
    
    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error("PDF Parsing Error:", errData.parserError);
      reject(new Error(`Failed to read PDF text. Details: ${errData.parserError}`));
    });
    
    pdfParser.on("pdfParser_dataReady", () => {
      resolve(pdfParser.getRawTextContent());
    });
    
    pdfParser.loadPDF(filePath);
  });

  const lines = text.split(/\r?\n/);
  const transactions = [];
  
  console.log(`📄 PDF text extracted! Total lines: ${lines.length}`);

  // More robust regex: removed ^ anchor as some environments prepend hidden characters or spaces
  const dateRegex = /(\d{2}[\/\-\s](?:\d{2}|[a-zA-Z]{3})[\/\-\s]\d{2,4})/;
  // Match all amounts on the line
  const amountRegexAll = /([\d,]+\.\d{2})(?:\s*(Cr|Dr|CR|DR))?/g;

  let idCounter = 1;
  let previousBalance = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = line.match(dateRegex);

    if (dateMatch) {
      const dateStr = dateMatch[0].trim();
      const amounts = [...line.matchAll(amountRegexAll)];
      
      if (amounts.length === 0) {
        // Log lines that have a date but no amounts to see what the parser is missing
        console.log(`[Parser Debug] Date found but no amounts on line ${i}: "${line}"`);
        continue;
      }

      let targetMatch;
      let currentBalance = null;

      if (amounts.length >= 2) {
        // If multiple amounts, second-to-last is usually the transaction amount, last is balance
        targetMatch = amounts[amounts.length - 2];
        currentBalance = parseFloat(amounts[amounts.length - 1][1].replace(/,/g, ''));
      } else {
        // Only one amount found
        targetMatch = amounts[0];
      }

      let amount = parseFloat(targetMatch[1].replace(/,/g, ''));
      let type = 'UNKNOWN';

      if (targetMatch[2]) {
        type = targetMatch[2].toLowerCase() === 'cr' ? 'CREDIT' : 'DEBIT';
      } else if (previousBalance !== null && currentBalance !== null) {
        if (currentBalance > previousBalance) {
          type = 'CREDIT';
        } else if (currentBalance < previousBalance) {
          type = 'DEBIT';
        } else {
          type = 'DEBIT'; 
        }
      } else {
        type = 'DEBIT'; // Default fallback
      }

      let description = line.replace(dateRegex, '').replace(amountRegexAll, '').trim();
      
      // Clean up description removing leftover artifacts
      description = description.replace(/^[-\s]+/, '').replace(/[-\s]+$/, '');

      // Multi-line description heuristic:
      // If the description is empty or very short, grab text from the next few lines
      // until we hit another date or empty line.
      let lookaheadIndex = i + 1;
      let extraDescription = [];
      while (lookaheadIndex < lines.length && lookaheadIndex < i + 4) {
        const nextLine = lines[lookaheadIndex].trim();
        // Stop if we hit an empty line, another date, or another amount
        if (!nextLine || nextLine.match(dateRegex) || nextLine.match(amountRegexAll)) break;
        extraDescription.push(nextLine);
        lookaheadIndex++;
      }

      if (extraDescription.length > 0) {
        description = (description + ' ' + extraDescription.join(' ')).trim();
      } else if (!description && i > 0) {
        // Fallback: check the PREVIOUS line if the description is entirely empty
        const prevLine = lines[i - 1].trim();
        if (prevLine && !prevLine.match(dateRegex) && !prevLine.match(amountRegexAll)) {
          description = prevLine;
        }
      }

      transactions.push({
        id: idCounter++,
        date: dateStr,
        description: description || 'Unknown Description',
        amount: amount,
        type: type,
      });

      if (currentBalance !== null) {
        previousBalance = currentBalance;
      }
    }
  }

  if (transactions.length === 0) {
    console.log("⚠️ No transactions matched! Raw Text Inspection:");
    // JSON.stringify helps see hidden characters like \r or \t
    console.log(JSON.stringify(text.substring(0, 1000))); 
    console.log("Sample Lines:\n", lines.slice(0, 15).join('\n'));
  }

  return transactions;
}

module.exports = { parsePDF };