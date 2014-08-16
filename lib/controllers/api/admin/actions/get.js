var File = require('duffel-cms-raptor-editor-filemanager').File();

module.exports = function(parameters) {
  var app = parameters.app;

  app.protect.get('/duffel-cms-raptor-editor-filemanager/admin/actions', 'view-files', function(req, res){

    var where = {};

    if (req.query.path) {
      where.path = req.query.path;
    }

    if (req.query.search) {
      where.name = {
        like: '%' + req.query.search + '%'
      };
    }

    var sort = req.query.sort;
    if (sort == 'mtime') {
      sort = 'updated';
    }

    var query = {
      where: where,
      order: sort + ' ' + req.query.direction,
      limit: req.query.limit,
      skip: req.query.start * req.query.limit,
    };

    File.count({
      path: req.query.path
    }, function(error, total) {
      if (error) {
        throw error;
      }

      File.find(query, function(error, files) {
        if (error) {
          throw error;
        }

        res.send({
          start: req.query.start,
          limit: req.query.limit,
          total: total,
          filteredTotal: files.length,
          tags: [],
          directories: [],
          files: files.map(function(file) {
            file.mtime = +new Date(file.updated);
            return file;
          })
        });
      });
    });

  });
};

