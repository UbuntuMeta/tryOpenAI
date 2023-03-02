module.exports = class ChatModel {
    constructor(openai) {
        this.openai = openai;
    }
    getModelName() {
        return 'gpt-3.5-turbo';
    }

    async createCompletion(question) {
        const response = await this.openai.createChatCompletion({
            model: this.getModelName(),
            messages: [{role: 'user', content: question}]
        });

        return response.data.choices[0].message;
    }
}