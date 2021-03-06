"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VertexBuffer = void 0;
var tslib_1 = require("tslib");
var BufferObjects_1 = require("./BufferObjects");
var mustBeUndefined_1 = require("../checks/mustBeUndefined");
var ShareableContextConsumer_1 = require("./ShareableContextConsumer");
/**
 * A wrapper around a WebGLBuffer with binding to ARRAY_BUFFER.
 */
var VertexBuffer = /** @class */ (function (_super) {
    tslib_1.__extends(VertexBuffer, _super);
    /**
     *
     */
    function VertexBuffer(contextManager, data, usage, levelUp) {
        if (levelUp === void 0) { levelUp = 0; }
        var _this = _super.call(this, contextManager) || this;
        _this.data = data;
        _this.usage = usage;
        _this.setLoggingName('VertexBuffer');
        if (levelUp === 0) {
            _this.synchUp();
        }
        return _this;
    }
    /**
     *
     */
    VertexBuffer.prototype.resurrector = function (levelUp) {
        _super.prototype.resurrector.call(this, levelUp + 1);
        this.setLoggingName('VertexBuffer');
        if (levelUp === 0) {
            this.synchUp();
        }
    };
    /**
     *
     */
    VertexBuffer.prototype.destructor = function (levelUp) {
        if (levelUp === 0) {
            this.cleanUp();
        }
        mustBeUndefined_1.mustBeUndefined(this.getLoggingName(), this.webGLBuffer);
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    VertexBuffer.prototype.upload = function () {
        var gl = this.gl;
        if (gl) {
            if (this.webGLBuffer) {
                if (this.data) {
                    gl.bufferData(BufferObjects_1.BufferObjects.ARRAY_BUFFER, this.data, this.usage);
                }
            }
        }
    };
    VertexBuffer.prototype.contextFree = function () {
        if (this.webGLBuffer) {
            var gl = this.gl;
            if (gl) {
                gl.deleteBuffer(this.webGLBuffer);
            }
            else {
                console.error(this.getLoggingName() + " must leak WebGLBuffer because WebGLRenderingContext is " + typeof gl);
            }
            this.webGLBuffer = void 0;
        }
        else {
            // It's a duplicate, ignore.
        }
        _super.prototype.contextFree.call(this);
    };
    VertexBuffer.prototype.contextGain = function () {
        _super.prototype.contextGain.call(this);
        var gl = this.gl;
        if (!this.webGLBuffer) {
            this.webGLBuffer = gl.createBuffer();
            this.bind();
            this.upload();
            this.unbind();
        }
        else {
            // It's a duplicate, ignore the call.
        }
    };
    VertexBuffer.prototype.contextLost = function () {
        this.webGLBuffer = void 0;
        _super.prototype.contextLost.call(this);
    };
    VertexBuffer.prototype.bind = function () {
        var gl = this.gl;
        if (gl) {
            gl.bindBuffer(BufferObjects_1.BufferObjects.ARRAY_BUFFER, this.webGLBuffer);
        }
    };
    VertexBuffer.prototype.unbind = function () {
        var gl = this.gl;
        if (gl) {
            gl.bindBuffer(BufferObjects_1.BufferObjects.ARRAY_BUFFER, null);
        }
    };
    return VertexBuffer;
}(ShareableContextConsumer_1.ShareableContextConsumer));
exports.VertexBuffer = VertexBuffer;
