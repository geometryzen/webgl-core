"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLBlendFunc = void 0;
var tslib_1 = require("tslib");
var ShareableBase_1 = require("../core/ShareableBase");
var WebGLBlendFunc = /** @class */ (function (_super) {
    tslib_1.__extends(WebGLBlendFunc, _super);
    function WebGLBlendFunc(contextManager, sfactor, dfactor) {
        var _this = _super.call(this) || this;
        _this.contextManager = contextManager;
        _this.setLoggingName('WebGLBlendFunc');
        _this.sfactor = sfactor;
        _this.dfactor = dfactor;
        return _this;
    }
    WebGLBlendFunc.prototype.destructor = function (levelUp) {
        this.sfactor = void 0;
        this.dfactor = void 0;
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    WebGLBlendFunc.prototype.contextFree = function () {
        // do nothing
    };
    WebGLBlendFunc.prototype.contextGain = function () {
        this.execute(this.contextManager.gl);
    };
    WebGLBlendFunc.prototype.contextLost = function () {
        // do nothing
    };
    WebGLBlendFunc.prototype.execute = function (gl) {
        gl.blendFunc(this.sfactor, this.dfactor);
    };
    return WebGLBlendFunc;
}(ShareableBase_1.ShareableBase));
exports.WebGLBlendFunc = WebGLBlendFunc;
