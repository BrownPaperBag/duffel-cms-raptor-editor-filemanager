var File = require('duffel-cms-raptor-editor-filemanager').File(),
  multiparty = require('multiparty'),
  Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs')),
  mmmagic = require('mmmagic'),
  Magic = mmmagic.Magic;

function saveFile(file) {
  var magic = new Magic(mmmagic.MAGIC_MIME_TYPE);

  magic.detect(file.data, function(error, mimeType) {

    if (error) {
      throw error;
    }

    File.create({
      name: file.name,
      type: mimeType,
      size: file.size,
      data: file.data,
      user_id: file.user_id
    }, function(error, savedFile) {
      if (error) {
        throw error;
      }
    });
  });
}

// Store uploads in progress in case chunking occurs.
var pendingUploads = {};


/**
 * Check for and save any pending uploads, delete said uploads from queue after.
 *
 * @param {Request} req
 */
function finalizePendingUploads(req) {
  var userUploads = pendingUploads[req.user.id];

  if (!userUploads) {
    return;
  }

  Object.keys(userUploads).forEach(function(fileName) {
    var filesData = userUploads[fileName];

    if (filesData.chunks != filesData.files.length) {
      return;
    }

    delete pendingUploads[req.user.id][fileName];

    Promise.map(filesData.files, function(filePath) {
      return fs.readFileAsync(filePath);
    })
    .then(function(filesData) {
      var wholeFile = Buffer.concat(filesData);
      saveFile({
        data: wholeFile,
        name: fileName,
        size: wholeFile.length,
        user_id: req.user.id
      });
    });
  });
}

var FIVE_MINUTES = 1000 * 60 * 5;
/**
 * Check for and delete stale uploads periodically
 */
setInterval(function deleteStalledUploads() {
  Object.keys(pendingUploads).forEach(function(userId) {
    var userUploads = pendingUploads[userId];

    Object.keys(userUploads).forEach(function(fileName) {

      // create a timestamp representing 5 minutes in the past
      var staleTimestamp = (+new Date()) - FIVE_MINUTES;
      if (userUploads[fileName].updated > staleTimestamp) {
        return;
      }

      delete pendingUploads[userId][fileName];
    });
  });

}, FIVE_MINUTES);

/**
 * Add uploaded file or chunk of uploaded
 * file and requisite meta data to the upload queue
 *
 * @param {Request} req
 * @param {Response} res
 */
module.exports = function plupload(req, res) {

  var form = new multiparty.Form(),
    userId = req.user.id;

  form.parse(req, function(err, fields, files) {

    var name = fields.name[0];
    if (!fields.chunk) {
      fields.chunk = [0];
      fields.chunks = [1];
    }

    if (!pendingUploads[userId]) {
      pendingUploads[userId] = {};
    }

    if (!pendingUploads[userId][name]) {
      pendingUploads[userId][name] = {
        chunks: fields.chunks[0],
        files: [],
        updated: +new Date()
      };
    }

    pendingUploads[userId][name].files.push(files.file[0].path);

    finalizePendingUploads(req);

    res.json(
      {
      'jsonrpc': '2.0',
      'result': name,
      'id': 1
    });
  });
};

