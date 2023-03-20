module.exports = class ChatModel {
  constructor(openai) {
    this.openai = openai;
    this.message = [];
  }

  // eslint-disable-next-line class-methods-use-this
  getModelName() {
    return 'gpt-3.5-turbo';
  }

  async createCompletion(question) {
  // Add user's question to the messages array.
    this.message.push({ role: 'user', content: question });

    // Send the question to the OpenAI API.
    const response = await this.openai.createChatCompletion({
      model: this.getModelName(),
      messages: this.message,
    });

    // Get the response from the API.
    const responseMessage = response.data.choices[0].text;

    // Log the response to the console.
    console.log('########### assistant said:\r\n########');
    console.log(responseMessage);
    console.log('###################\r\n');

    // Add the response to the messages array.
    this.message.push({ role: 'assistant', content: responseMessage });

    return responseMessage;
  }
};
