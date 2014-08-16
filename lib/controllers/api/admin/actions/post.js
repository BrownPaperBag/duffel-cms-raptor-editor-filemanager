var File = require('duffel-cms-raptor-editor-filemanager').File(),
  plupload = require('../../../../plupload');

module.exports = function(parameters) {
  var app = parameters.app;

  function deleteFile(req, res) {
  }

  app.protect.post('/duffel-cms-raptor-editor-filemanager/admin/actions', 'edit-files', function(req, res){
    var action = req.query.action;

    switch (action) {
      case 'upload':
        return plupload(req, res);

      case 'delete':
        return deleteFile(req, res);
    }
  });
};

