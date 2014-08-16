var controllerLoader = require('controller-loader'),
  path = require('path');

module.exports = function(app, callback) {

  require('./models/File').initialise(app.get('database'));

  controllerLoader.load(path.resolve(path.join(__dirname, '../lib/controllers')), function(controller) {
    require(controller)({
      app: app
    });
  }, callback);
};
