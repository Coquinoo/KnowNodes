/*** Generated by streamline 0.6.0 (callbacks) - DO NOT EDIT ***/ var __rt=require('streamline/lib/callbacks/runtime').runtime(__filename),__func=__rt.__func; (function() {
  var NodeValidator, UserValidator, __hasProp = {
  }.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) { child[key] = parent[key]; }; }; function ctor() { this.constructor = child; }; ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  NodeValidator = require("./nodeValidator");

  module.exports = UserValidator = (function(_super) {
    __extends(UserValidator, _super);

    function UserValidator() {
      UserValidator.__super__.constructor.call(this, "kn_User"); };


    UserValidator.prototype.validate = function UserValidator_prototype_validate__1(data, _) { var __this = this; var __frame = { name: "UserValidator_prototype_validate__1", line: 15 }; return __func(_, this, arguments, UserValidator_prototype_validate__1, 1, __frame, function __$UserValidator_prototype_validate__1() {
        UserValidator.__super__.validate.call(__this, data);
        return _(null, __this.check(data.__CreatedOn__).notNull().isInt()); }); };


    return UserValidator;

  })(NodeValidator);

}).call(this);