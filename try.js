const ModelFactory = require('./modelFactory');

(async () => {
  const modelFactory = new ModelFactory();
  const response = await modelFactory.getInstance('turbo-3.5').ask('Hello, how to reverse string in javascript?');

  console.log(response);
})();
