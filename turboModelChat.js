const { Configuration, OpenAIApi } = require('openai');
const { MongoClient} = require('mongodb');
const mongoURL = process.env.MONGO_URL?? 'mongodb://127.0.0.1:27039/ai';
const ChatModel = require('./chatModel');
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
// docker run -it --rm --name ai-db -p 27039:27017 -d mongo:5.0.10
const readline = require('readline');
const ask = async (question) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer.trim() || ask(question)));
    }).finally(() => rl.close());
};

(async () => {
    const mongodbClient = await MongoClient.connect(mongoURL);
    const db = mongodbClient.db('ai');
    const prompt = await ask('Using Turbo Model.\r\nPlease enter your questions to ChatGPT:\r\n');
    const openai = new OpenAIApi(configuration);
    const chatModel = new ChatModel(openai);
    try {
        const result = await chatModel.createCompletion(prompt);
        console.log(result);
        await db.collection('chatlog').insertOne(
            {
            question: prompt, 
            answer: result,
            model: chatModel.getModelName(),
            create_at: new Date()
        });
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