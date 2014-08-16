var File = null;

function initialise(database) {

  var User = require('duffel-auth').User();

  File = database.connections.main.define('file', {
    name: String,
    path: String,
    data: {
      type: Buffer,
      mysql: {
        dataType: 'LONGBLOB'
      }
    },
    size: Number,
    type: String,
    updated: Date,
    created: {
      type: Date,
      default: Date.now
    }
  });

  User.hasMany(File, {
    as: 'files',
    foreignKey: 'user_id'
  });

}

module.exports = {
  initialise: function(database) {
    initialise(database);
  },
  model: function() {
    return File;
  }
};

