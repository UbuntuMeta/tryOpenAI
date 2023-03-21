module.exports = class Turbo35Model {
  constructor(openai) {
    this.modelName = 'gpt-3.5-turbo';
    this.openai = openai;
    this.message = [];
  }

  async ask(question) {
    this.message.push({ role: 'user', content: question });

    // Send the question to the OpenAI API.
    const response = await this.openai.createChatCompletion({
      model: this.modelName,
      messages: this.message,
    });

    // Get the response from the API.
    const responseMessage = response.data.choices[0].message.content;
    // Add the response to the messages array.
    this.message.push({ role: 'assistant', content: responseMessage });

    return responseMessage;
  }
};
