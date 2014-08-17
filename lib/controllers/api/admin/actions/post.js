var File = require('duffel-cms-raptor-editor-filemanager').File(),
  Pluploader = require('node-pluploader');

module.exports = function(parameters) {
  var app = parameters.app;

  var pluploader = new Pluploader({
    uploadLimit: 16
  });

  pluploader.on('fileUploaded', function(file, req) {

    File.create({
      name: file.name,
      type: file.type,
      size: file.size,
      data: file.data,
      user_id: req.user.id
    }, function(error, savedFile) {
      if (error) {
        throw error;
      }
    });

  });

  pluploader.on('error', function(error) {
      throw error;
  });

  function deleteFile(req, res) {
  }

  app.protect.post('/duffel-cms-raptor-editor-filemanager/admin/actions', 'edit-files', function(req, res){
    var action = req.query.action;

    switch (action) {
      case 'upload':
        return pluploader.handleRequest(req, res);

      case 'delete':
        return deleteFile(req, res);
    }
  });
};

