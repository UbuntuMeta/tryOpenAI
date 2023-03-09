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
    this.message.push({ role: 'user', content: question });
    const response = await this.openai.createChatCompletion({
      model: this.getModelName(),
      messages: this.message,
    });
    console.log('########### assistant said:\r\n########');
    console.log(response.data.choices[0].message.content);
    console.log('###################\r\n');
    // put all chat log into the message
    this.message.push({ role: 'assistant', content: response.data.choices[0].message.content });
    return response.data.choices[0].message.content;
  }
};
