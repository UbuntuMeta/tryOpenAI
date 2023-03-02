const { Configuration, OpenAIApi } = require('openai');
const { MongoClient} = require('mongodb');
const mongoURL = process.env.MONGO_URL?? 'mongodb://127.0.0.1:27039/ai';

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
    const prompt = await ask('Please enter your questions to ChatGPT:\r\n');
    const openai = new OpenAIApi(configuration);
    try {
        const modelName = 'text-davinci-003';
         //"gpt-3.5-turbo";
        const response = await openai.createCompletion({
            model: modelName,
            prompt,
            temperature: 0.7,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        console.log("######Response is:######\r\n")
        console.log(response.data.choices[0].text);
        await db.collection('chatlog').insertOne(
            {
            question: prompt, 
            answer: response.data.choices[0].text,
            model: modelName,
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

