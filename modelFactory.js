const { Configuration, OpenAIApi } = require('openai');
const Turbo35Model = require('./models/turbo35Model');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * The ModelFactory class is used to create different model instance by map
 */
class ModelFactory {
  constructor() {
    this.modelClasses = new Map();
    this.modelClasses.set('turbo-3.5', Turbo35Model);
  }

  getInstance(modelName) {
    const ModelClass = this.modelClasses.get(modelName);
    if (ModelClass) {
      return new ModelClass(openai);
    }
    throw new Error('Model not found');
  }
}

module.exports = ModelFactory;
