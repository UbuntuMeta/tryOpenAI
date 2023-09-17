const { Configuration, OpenAIApi } = require('openai');
const { MongoClient } = require('mongodb');
const readline = require('readline');
const ModelFactory = require('./modelFactory');

const mongoURL = process.env.MONGO_URL ?? 'mongodb://127.0.0.1:27039/ai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

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
/**
 * initialize the model name by input from user, the default model name is gpt-3.5-turbo
 *
 * @returns {string} modelName
 */
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
  let response;
  try {
    // Create different openai model by factory pattern
    if (modelName === 'gpt-3.5-turbo') {
      const modelFactory = new ModelFactory();
      const model = modelFactory.getInstance(modelName);
      response = model.ask(prompt);
      console.log(response);
    } else if (modelName === 'text-davinci-003') {
      response = await openai.createCompletion({
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
    }
    await db.collection('chatlog').insertOne(
      {
        question: prompt,
        answer: response.data.choices[0].text,
        model: modelName,
        create_at: new Date(),
      },
    );
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
