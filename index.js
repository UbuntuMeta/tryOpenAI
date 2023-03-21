const { Configuration, OpenAIApi } = require('openai');
const { MongoClient } = require('mongodb');

const mongoURL = process.env.MONGO_URL ?? 'mongodb://127.0.0.1:27039/ai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const readline = require('readline');

const ask = async (questionMessage) => {
  const readFromLine = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    readFromLine.question(
      questionMessage,
      (answer) => resolve(answer.trim() || ask(questionMessage)),
    );
  }).finally(() => readFromLine.close());
};
const stopByPrompt = (prompt) => {
  if (prompt === 'stop') {
    console.log('Bye, see you next time!\r\n');
    process.exit(0);
  }
};

// The function introduceGPT() is used to introduce the user to the chatbot.
// The function will print instructions on how to use the chatbot.
const introduceGPT = () => {
  console.log('Welcome to use ChatGPT, a chatbot powered by OpenAI GPT-3.\r\n');
  console.log('If you want to stop, just type "stop" in the prompt.\r\n');
};

const initModel = async () => {
  const modelName = await ask('Please enter the model name that you want to use:(Default is gpt-3.5-turbo)\r\n');
  stopByPrompt(modelName);
  if (modelName.length === 0) return 'gpt-3.5-turbo';
  return modelName;
};

(async () => {
  introduceGPT();
  const mongodbClient = await MongoClient.connect(mongoURL);
  const db = mongodbClient.db('ai');
  const modelName = await initModel();
  const prompt = await ask('Please enter your questions to ChatGPT:\r\n');
  stopByPrompt(prompt);
  const openai = new OpenAIApi(configuration);
  try {
    // Create different openai model by factory pattern
    // const modelName = 'text-davinci-003';
    // "gpt-3.5-turbo";
    if (modelName === 'text-davinci-003') {
      const response = await openai.createCompletion({
        model: modelName,
        prompt,
        temperature: 0.7,
        max_tokens: 3000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      console.log('######Response is:######\r\n');
      console.log(response.data.choices[0].text);
      await db.collection('chatlog').insertOne(
        {
          question: prompt,
          answer: response.data.choices[0].text,
          model: modelName,
          create_at: new Date(),
        },
      );
    }
    // TODO use turbo-3.5 model to run and use factory pattern to create different models
    process.exit(0);
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
})();
