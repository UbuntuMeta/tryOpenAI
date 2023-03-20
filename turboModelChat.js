const { Configuration, OpenAIApi } = require('openai');
const { MongoClient, ObjectId } = require('mongodb');

const mongoURL = process.env.MONGO_URL ?? 'mongodb://127.0.0.1:27039/ai';
const readline = require('readline');

const ChatModel = require('./chatModel');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const ask = async (question) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim() || ask(question)));
  }).finally(() => rl.close());
};

(async () => {
  const mongodbClient = await MongoClient.connect(mongoURL);
  const db = mongodbClient.db('ai');
  let prompt = await ask('Using Turbo Model.\r\nPlease enter your questions to ChatGPT:\r\n');
  const openai = new OpenAIApi(configuration);
  const chatModel = new ChatModel(openai);
  const isStillRequesting = true;
  try {
    const conversationId = new ObjectId();
    while (isStillRequesting) {
      const responseContent = await chatModel.createCompletion(prompt);
      await db.collection('chatlog').insertOne(
        {
          conversation_id: conversationId,
          question: prompt,
          answer: responseContent,
          model: chatModel.getModelName(),
          create_at: new Date(),
        },
      );
      prompt = await ask('Continue to ask, enter what you want in the same conversation:\r\n');
      if (prompt === 'stop') {
        console.log('System: Bye, have a good day.\r\n');
        process.exit(0);
      }
    }
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
})();
