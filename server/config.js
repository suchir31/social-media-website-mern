onst functions = require('firebase-functions');

module.exports = {
  mongoURI: functions.config().mongodb.uri
};
