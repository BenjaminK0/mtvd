const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { parse } = require('csv-parse/sync');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function getEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: 'embedding-001' });
  const result = await model.embedContent({
    content: {
      parts: [{ text }],
    },
    taskType: 'retrieval_document',
  });
  return result.embedding.values;
}

async function run() {
  const csvData = fs.readFileSync('docs.csv', 'utf-8');
  const records = parse(csvData, {
    columns: true, // uses first row as keys
    skip_empty_lines: true,
  });

  for (const row of records) {
    const paragraph = row.text?.trim();
    if (!paragraph) continue;

    const embedding = await getEmbedding(paragraph);

    const { error } = await supabase.from('rag_docs').insert({
      text: paragraph,
      embedding,
    });

    if (error) console.error('Error inserting:', error.message);
    else console.log('Inserted:', paragraph.slice(0, 50));
  }
}

run();
