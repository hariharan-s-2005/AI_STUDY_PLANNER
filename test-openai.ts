import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function test() {
  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10
    });

    console.log('Success:', completion.choices[0]?.message?.content);
  } catch (error: any) {
    console.error('Error:', error?.message);
  }
}

test();
