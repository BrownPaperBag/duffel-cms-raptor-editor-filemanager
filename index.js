module.exports = {
  initialise: require('./lib/initialise'),
  File: function() {
    return require('./lib/models/File').model();
  }
};

