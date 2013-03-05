// Generated by CoffeeScript 1.4.0
(function() {
  var BaseModule, cache;

  cache = require('memory-cache');

  module.exports = BaseModule = (function() {

    function BaseModule(user) {
      var _this = this;
      this.DB = require('../DB/knownodeDB');
      this.neo4jDB = this.DB.getNeo4jDB();
      if (user && user.id) {
        this.user = cache.get('USER_' + user.id);
        if (!(this.user != null)) {
          this.neo4jDB.getNodeById(user.id, function(err, usr) {
            if (!(err != null)) {
              cache.put('USER_' + user.id, usr, 1000);
              return _this.user = usr;
            }
          });
        }
      } else {
        this.user = user || {};
      }
    }

    return BaseModule;

  })();

}).call(this);
