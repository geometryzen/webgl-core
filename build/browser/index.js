(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.webglCore = global.webglCore || {})));
}(this, (function (exports) { 'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function isDefined(arg) {
    return (typeof arg !== 'undefined');
}

/**
 * throws name + " must " + message + [" in " + context] + "."
 */
function mustSatisfy(name, condition, messageBuilder, contextBuilder) {
    if (!condition) {
        var message = messageBuilder ? messageBuilder() : "satisfy some condition";
        var context = contextBuilder ? " in " + contextBuilder() : "";
        throw new Error(name + " must " + message + context + ".");
    }
}

function isEQ(value, limit) {
    return value === limit;
}

function mustBeEQ(name, value, limit, contextBuilder) {
    mustSatisfy(name, isEQ(value, limit), function () { return "be equal to " + limit; }, contextBuilder);
    return value;
}

function isNumber(x) {
    return (typeof x === 'number');
}

function isInteger(x) {
    // % coerces its operand to numbers so a typeof test is required.
    // Note that ECMAScript 6 provides Number.isInteger().
    return isNumber(x) && x % 1 === 0;
}

function beAnInteger() {
    return "be an integer";
}
function mustBeInteger(name, value, contextBuilder) {
    mustSatisfy(name, isInteger(value), beAnInteger, contextBuilder);
    return value;
}

function isString(s) {
    return (typeof s === 'string');
}

function beAString() {
    return "be a string";
}
function mustBeString(name, value, contextBuilder) {
    mustSatisfy(name, isString(value), beAString, contextBuilder);
    return value;
}

function readOnly(name) {
    mustBeString('name', name);
    var message = {
        get message() {
            return "Property `" + name + "` is readonly.";
        }
    };
    return message;
}

var statistics = {};
var chatty = true;
var skip = true;
var trace = false;
var traceName = void 0;
var LOGGING_NAME_REF_CHANGE = 'refChange';
function prefix(message) {
    return LOGGING_NAME_REF_CHANGE + ": " + message;
}
function log(message) {
    return console.log(prefix(message));
}
function warn(message) {
    return console.warn(prefix(message));
}
function error$1(message) {
    return console.error(prefix(message));
}
function garbageCollect() {
    var uuids = Object.keys(statistics);
    uuids.forEach(function (uuid) {
        var element = statistics[uuid];
        if (element.refCount === 0) {
            delete statistics[uuid];
        }
    });
}
function computeOutstanding() {
    var uuids = Object.keys(statistics);
    var uuidsLength = uuids.length;
    var total = 0;
    for (var i = 0; i < uuidsLength; i++) {
        var uuid = uuids[i];
        var statistic = statistics[uuid];
        total += statistic.refCount;
    }
    return total;
}
function stop() {
    if (skip) {
        warn("Nothing to see because skip mode is " + skip);
    }
    garbageCollect();
    return computeOutstanding();
}
function outstandingMessage(outstanding) {
    return "There are " + outstanding + " outstanding reference counts.";
}
function dump() {
    var outstanding = stop();
    if (outstanding > 0) {
        console.warn("Memory Leak!");
        console.warn(outstandingMessage(outstanding));
        console.warn(JSON.stringify(statistics, null, 2));
    }
    else {
        if (chatty) {
            console.log(outstandingMessage(outstanding));
        }
    }
    return outstanding;
}
function refChange(uuid, name, change) {
    if (change === void 0) { change = 0; }
    if (change !== 0 && skip) {
        return void 0;
    }
    if (trace) {
        if (traceName) {
            if (name === traceName) {
                var element = statistics[uuid];
                if (element) {
                    log(change + " on " + uuid + " @ " + name);
                }
                else {
                    log(change + " on " + uuid + " @ " + name);
                }
            }
        }
        else {
            // trace everything
            log(change + " on " + uuid + " @ " + name);
        }
    }
    if (change === +1) {
        var element = statistics[uuid];
        if (!element) {
            element = { refCount: 0, name: name, zombie: false };
            statistics[uuid] = element;
        }
        else {
            // It's more efficient to synchronize the name than by using a change of zero.
            element.name = name;
        }
        element.refCount += change;
    }
    else if (change === -1) {
        var element = statistics[uuid];
        if (element) {
            element.refCount += change;
            if (element.refCount === 0) {
                element.zombie = true;
            }
            else if (element.refCount < 0) {
                error$1("refCount < 0 for " + name);
            }
        }
        else {
            error$1(change + " on " + uuid + " @ " + name);
        }
    }
    else if (change === 0) {
        // When the value of change is zero, the uuid is either a command or a method on an exisiting uuid.
        var message = isDefined(name) ? uuid + " @ " + name : uuid;
        if (uuid === 'stop') {
            if (chatty) {
                log(message);
            }
            return stop();
        }
        else {
            if (uuid === 'dump') {
                return dump();
            }
            else if (uuid === 'verbose') {
                chatty = true;
            }
            else if (uuid === 'quiet') {
                chatty = false;
            }
            else if (uuid === 'start') {
                if (chatty) {
                    log(message);
                }
                skip = false;
                trace = false;
            }
            else if (uuid === 'reset') {
                if (chatty) {
                    log(message);
                }
                statistics = {};
                chatty = true;
                skip = true;
                trace = false;
                traceName = void 0;
            }
            else if (uuid === 'trace') {
                if (chatty) {
                    log(message);
                }
                skip = false;
                trace = true;
                traceName = name;
            }
            else {
                throw new Error(prefix("Unexpected command uuid => " + uuid + ", name => " + name));
            }
        }
    }
    else {
        throw new Error(prefix("change must be +1 or -1 for normal recording, or 0 for logging to the console."));
    }
    return void 0;
}

function uuid4() {
    var maxFromBits = function (bits) {
        return Math.pow(2, bits);
    };
    var limitUI06 = maxFromBits(6);
    var limitUI08 = maxFromBits(8);
    var limitUI12 = maxFromBits(12);
    var limitUI16 = maxFromBits(16);
    var limitUI32 = maxFromBits(32);
    var getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    var randomUI06 = function () {
        return getRandomInt(0, limitUI06 - 1);
    };
    var randomUI08 = function () {
        return getRandomInt(0, limitUI08 - 1);
    };
    var randomUI12 = function () {
        return getRandomInt(0, limitUI12 - 1);
    };
    var randomUI16 = function () {
        return getRandomInt(0, limitUI16 - 1);
    };
    var randomUI32 = function () {
        return getRandomInt(0, limitUI32 - 1);
    };
    var randomUI48 = function () {
        return (0 | Math.random() * (1 << 30)) + (0 | Math.random() * (1 << 48 - 30)) * (1 << 30);
    };
    var paddedString = function (str, length, z) {
        str = String(str);
        z = (!z) ? '0' : z;
        var i = length - str.length;
        for (; i > 0; i >>>= 1, z += z) {
            if (i & 1) {
                str = z + str;
            }
        }
        return str;
    };
    var fromParts = function (timeLow, timeMid, timeHiAndVersion, clockSeqHiAndReserved, clockSeqLow, node) {
        var hex = paddedString(timeLow.toString(16), 8) +
            '-' +
            paddedString(timeMid.toString(16), 4) +
            '-' +
            paddedString(timeHiAndVersion.toString(16), 4) +
            '-' +
            paddedString(clockSeqHiAndReserved.toString(16), 2) +
            paddedString(clockSeqLow.toString(16), 2) +
            '-' +
            paddedString(node.toString(16), 12);
        return hex;
    };
    return {
        generate: function () {
            return fromParts(randomUI32(), randomUI16(), 0x4000 | randomUI12(), 0x80 | randomUI06(), randomUI08(), randomUI48());
        },
        // addition by Ka-Jan to test for validity
        // Based on: http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
        validate: function (uuid) {
            var testPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            return testPattern.test(uuid);
        }
    };
}

/**
 * <p>
 * Convenient base class for derived classes implementing <code>Shareable</code>.
 * </p>
 *
 *
 *     class MyShareableClass extends ShareableBase {
 *       constructor() {
 *         // First thing you do is call super to invoke constructors up the chain.
 *         super()
 *         // Setting the logging name is both a good practice and increments the tally
 *         // of constructors in the constructor chain. The runtime architecture will
 *         // verify that the number of destructor calls matches these logging name calls.
 *         this.setLoggingName('MyShareableClass')
 *         // Finally, your initialization code here.
 *         // addRef and shared resources, maybe create owned resources.
 *       }
 *       protected destructor(levelUp: number): void {
 *         // Firstly, your termination code here.
 *         // Release any shared resources and/or delete any owned resources.
 *         // Last thing you do is to call the super destructor, incrementing the level.
 *         // The runtime architecture will verify that the destructor count matches the
 *         // constructor count.
 *         super.destructor(levelUp + 1)
 *       }
 *     }
 *
 */
var ShareableBase = (function () {
    /**
     *
     */
    function ShareableBase() {
        /**
         * The unique identifier used for reference count monitoring.
         */
        this._uuid = uuid4().generate();
        this._type = 'ShareableBase';
        this._levelUp = 0;
        this._refCount = 1;
        refChange(this._uuid, this._type, +1);
    }
    /**
     * Experimental
     *
     * restore (a zombie) to life.
     */
    ShareableBase.prototype.resurrector = function (levelUp, grumble) {
        if (grumble === void 0) { grumble = false; }
        if (grumble) {
            throw new Error("`protected resurrector(levelUp: number): void` method should be implemented by `" + this._type + "`.");
        }
        this._levelUp = 0;
        this._refCount = 1;
        refChange(this._uuid, this._type, +1);
    };
    /**
     * <p>
     * Outputs a warning to the console that this method should be implemented by the derived class.
     * </p>
     * <p>
     * <em>This method should be implemented by derived classes.</em>
     * </p>
     * <p>
     * <em>Not implementing this method in a derived class risks leaking resources allocated by the derived class.</em>
     * </p>
     *
     * @param levelUp A number that should be incremented for each destructor call.
     */
    ShareableBase.prototype.destructor = function (levelUp, grumble) {
        if (grumble === void 0) { grumble = false; }
        mustBeInteger('levelUp', levelUp);
        mustBeEQ(this._type + " constructor-destructor chain mismatch: destructor index " + levelUp, levelUp, this._levelUp);
        if (grumble) {
            console.warn("`protected destructor(): void` method should be implemented by `" + this._type + "`.");
        }
        // This is the sentinel that this destructor was eventually called.
        // We can check this invariant in the final release method.
        this._levelUp = void 0;
    };
    Object.defineProperty(ShareableBase.prototype, "levelUp", {
        /**
         * Returns the total length of the inheritance hierarchy that this instance is involved in.
         */
        get: function () {
            return this._levelUp;
        },
        set: function (levelUp) {
            // The only way the level gets changed is through setLoggingName.
            throw new Error(readOnly('levelUp').message);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * An object is a zombie if it has been released by all who have held references.
     * In some cases it may be possible to recycle a zombie.
     */
    ShareableBase.prototype.isZombie = function () {
        return typeof this._refCount === 'undefined';
    };
    /**
     * <p>
     * Notifies this instance that something is referencing it.
     * </p>
     *
     * @returns The new value of the reference count.
     */
    ShareableBase.prototype.addRef = function () {
        if (this.isZombie()) {
            this.resurrector(0, true);
            return this._refCount;
        }
        else {
            this._refCount++;
            refChange(this._uuid, this._type, +1);
            return this._refCount;
        }
    };
    /**
     * Returns the name that was assigned by the call to the setLoggingName method.
     */
    ShareableBase.prototype.getLoggingName = function () {
        return this._type;
    };
    /**
     * This method is for use within constructors.
     *
     * Immediately after a call to the super class constructor, make a call to setLoggingName.
     * This will have the effect of refining the name used for reporting reference counts.
     *
     * This method has the secondary purpose of enabling a tally of the number of classes
     * in the constructor chain. This enables the runtime architecture to verify that destructor
     * chains are consistent with constructor chains, which is a good practice for cleaning up resources.
     *
     * Notice that this method is intentionally protected to discourage it from being called outside of the constructor.
     *
     * @param name This will usually be set to the name of the class.
     */
    ShareableBase.prototype.setLoggingName = function (name) {
        this._type = mustBeString('name', name);
        this._levelUp += 1;
        // Update the name used by the reference count tracking.
        refChange(this._uuid, name, +1);
        refChange(this._uuid, name, -1);
    };
    /**
     * <p>
     * Notifies this instance that something is dereferencing it.
     * </p>
     *
     * @returns The new value of the reference count.
     */
    ShareableBase.prototype.release = function () {
        this._refCount--;
        refChange(this._uuid, this._type, -1);
        var refCount = this._refCount;
        if (refCount === 0) {
            // destructor called with `true` means grumble if the method has not been overridden.
            // The following will call the most derived class first, if such a destructor exists.
            this.destructor(0, true);
            // refCount is used to indicate zombie status so let that go to undefined.
            this._refCount = void 0;
            // Keep the type and uuid around for debugging reference count problems.
            // this._type = void 0
            // this._uuid = void 0
            if (isDefined(this._levelUp)) {
                throw new Error(this._type + ".destructor method is not calling all the way up the chain.");
            }
        }
        return refCount;
    };
    Object.defineProperty(ShareableBase.prototype, "uuid", {
        get: function () {
            return this._uuid;
        },
        enumerable: true,
        configurable: true
    });
    return ShareableBase;
}());

var WebGLBlendFunc = (function (_super) {
    __extends(WebGLBlendFunc, _super);
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
}(ShareableBase));

function beANumber() {
    return "be a `number`";
}
function mustBeNumber(name, value, contextBuilder) {
    mustSatisfy(name, isNumber(value), beANumber, contextBuilder);
    return value;
}

var WebGLClearColor = (function (_super) {
    __extends(WebGLClearColor, _super);
    function WebGLClearColor(contextManager, r, g, b, a) {
        if (r === void 0) { r = 0; }
        if (g === void 0) { g = 0; }
        if (b === void 0) { b = 0; }
        if (a === void 0) { a = 1; }
        var _this = _super.call(this) || this;
        _this.contextManager = contextManager;
        _this.setLoggingName('WebGLClearColor');
        _this.r = mustBeNumber('r', r);
        _this.g = mustBeNumber('g', g);
        _this.b = mustBeNumber('b', b);
        _this.a = mustBeNumber('a', a);
        return _this;
    }
    /**
     *
     */
    WebGLClearColor.prototype.destructor = function (levelUp) {
        this.r = void 0;
        this.g = void 0;
        this.b = void 0;
        this.a = void 0;
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    WebGLClearColor.prototype.contextFree = function () {
        // Do nothing;
    };
    WebGLClearColor.prototype.contextGain = function () {
        mustBeNumber('r', this.r);
        mustBeNumber('g', this.g);
        mustBeNumber('b', this.b);
        mustBeNumber('a', this.a);
        this.contextManager.gl.clearColor(this.r, this.g, this.b, this.a);
    };
    WebGLClearColor.prototype.contextLost = function () {
        // Do nothing;
    };
    return WebGLClearColor;
}(ShareableBase));

/**
 * disable(capability: Capability): void
 */
var WebGLDisable = (function (_super) {
    __extends(WebGLDisable, _super);
    function WebGLDisable(contextManager, capability) {
        var _this = _super.call(this) || this;
        _this.contextManager = contextManager;
        _this.setLoggingName('WebGLDisable');
        _this._capability = mustBeNumber('capability', capability);
        return _this;
    }
    WebGLDisable.prototype.destructor = function (levelUp) {
        this._capability = void 0;
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    WebGLDisable.prototype.contextFree = function () {
        // do nothing
    };
    WebGLDisable.prototype.contextGain = function () {
        this.contextManager.gl.disable(this._capability);
    };
    WebGLDisable.prototype.contextLost = function () {
        // do nothing
    };
    return WebGLDisable;
}(ShareableBase));

/**
 * enable(capability: Capability): void
 */
var WebGLEnable = (function (_super) {
    __extends(WebGLEnable, _super);
    function WebGLEnable(contextManager, capability) {
        var _this = _super.call(this) || this;
        _this.contextManager = contextManager;
        _this.setLoggingName('WebGLEnable');
        _this._capability = mustBeNumber('capability', capability);
        return _this;
    }
    WebGLEnable.prototype.destructor = function (levelUp) {
        this._capability = void 0;
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    WebGLEnable.prototype.contextFree = function () {
        // do nothing
    };
    WebGLEnable.prototype.contextGain = function () {
        this.contextManager.gl.enable(this._capability);
    };
    WebGLEnable.prototype.contextLost = function () {
        // do nothing
    };
    return WebGLEnable;
}(ShareableBase));

/**
 * An object-oriented representation of an <code>attribute</code> in a GLSL shader program.
 */
var Attrib = (function () {
    /**
     *
     */
    function Attrib(contextManager, info) {
        /**
         *
         */
        this.suppressWarnings = true;
        this._name = info.name;
    }
    Object.defineProperty(Attrib.prototype, "index", {
        /**
         * Returns the cached index obtained by calling <code>getAttribLocation</code> on the
         * <code>WebGLRenderingContext</code>.
         */
        get: function () {
            return this._index;
        },
        set: function (unused) {
            throw new Error(readOnly('index').message);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Notifies this <code>Attrib</code> of a browser free WebGL context event.
     * This <code>Attrib</code> responds by setting its cached index and context to undefined.
     */
    Attrib.prototype.contextFree = function () {
        // Nothing to deallocate. Just reflect notification in state variables.
        // This is coincidentally the same as contextLost, but not appropriate for DRY.
        this._index = void 0;
        this._gl = void 0;
    };
    /**
     * Notifies this <code>Attrib</code> of a browser gain WebGL context event.
     * This <code>Attrib</code> responds by obtaining and caching attribute index.
     *
     * @param context
     * @param program
     */
    Attrib.prototype.contextGain = function (context, program) {
        this._index = context.getAttribLocation(program, this._name);
        this._gl = context;
    };
    /**
     * Notifies this <code>Attrib</code> of a browser lost WebGL context event.
     * This <code>Attrib</code> responds by setting its cached index and context to undefined.
     */
    Attrib.prototype.contextLost = function () {
        this._index = void 0;
        this._gl = void 0;
    };
    /**
     * Specifies the data formats and locations of vertex attributes in a vertex attributes array.
     * Calls the <code>vertexAttribPointer</code> method
     * on the underlying <code>WebGLRenderingContext</code>
     * using the cached attribute index and the supplied parameters.
     * Note that the <code>type</code> parameter is hard-code to <code>FLOAT</code>.
     *
     * @param size The number of components per attribute. Must be 1, 2, 3, or 4.
     * @param type The data type of each component in the array.
     * @param normalized Specifies whether fixed-point data values should be normalized (true), or are converted to fixed point vales (false) when accessed.
     * @param stride The distance in bytes between the beginning of consecutive vertex attributes.
     * @param offset The offset in bytes of the first component in the vertex attribute array. Must be a multiple of type.
     */
    Attrib.prototype.config = function (size, type, normalized, stride, offset) {
        if (normalized === void 0) { normalized = false; }
        if (stride === void 0) { stride = 0; }
        if (offset === void 0) { offset = 0; }
        // TODO: Notice that when this function is called, the cached index is used.
        // This suggests that we should used the cached indices to to look up attributes
        // when we are in the animation loop.
        if (this._gl) {
            this._gl.vertexAttribPointer(this._index, size, type, normalized, stride, offset);
        }
        else {
            if (!this.suppressWarnings) {
                console.warn("vertexAttribPointer(index = " + this._index + ", size = " + size + ", type = " + type + ", normalized = " + normalized + ", stride = " + stride + ", offset = " + offset + ")");
            }
        }
    };
    /**
     * Calls the <code>enableVertexAttribArray</code> method
     * on the underlying <code>WebGLRenderingContext</code>
     * using the cached attribute index.
     */
    Attrib.prototype.enable = function () {
        if (this._gl) {
            this._gl.enableVertexAttribArray(this._index);
        }
        else {
            if (!this.suppressWarnings) {
                console.warn("enableVertexAttribArray(index = " + this._index + ")");
            }
        }
    };
    /**
     * Calls the <code>disableVertexAttribArray</code> method
     * on the underlying <code>WebGLRenderingContext</code>
     * using the cached attribute index.
     */
    Attrib.prototype.disable = function () {
        if (this._gl) {
            this._gl.disableVertexAttribArray(this._index);
        }
        else {
            if (!this.suppressWarnings) {
                console.warn("disableVertexAttribArray(index = " + this._index + ")");
            }
        }
    };
    /**
     * Returns the address of the specified vertex attribute.
     * Experimental.
     */
    Attrib.prototype.getOffset = function () {
        if (this._gl) {
            // The API docs don't permit the pname attribute to be anything other than VERTEX_ATTRIB_ARRAY_POINTER.
            return this._gl.getVertexAttribOffset(this._index, this._gl.VERTEX_ATTRIB_ARRAY_POINTER);
        }
        else {
            if (!this.suppressWarnings) {
                console.warn("getVertexAttribOffset(index = " + this._index + ", VERTEX_ATTRIB_ARRAY_POINTER)");
            }
            return void 0;
        }
    };
    /**
     * Returns a non-normative string representation of the GLSL attribute.
     */
    Attrib.prototype.toString = function () {
        return ['attribute', this._name].join(' ');
    };
    return Attrib;
}());

/**
 * The enumerated modes of drawing WebGL primitives.
 *
 * https://www.khronos.org/registry/webgl/specs/1.0/
 */

(function (BeginMode) {
    BeginMode[BeginMode["POINTS"] = 0] = "POINTS";
    BeginMode[BeginMode["LINES"] = 1] = "LINES";
    BeginMode[BeginMode["LINE_LOOP"] = 2] = "LINE_LOOP";
    BeginMode[BeginMode["LINE_STRIP"] = 3] = "LINE_STRIP";
    BeginMode[BeginMode["TRIANGLES"] = 4] = "TRIANGLES";
    BeginMode[BeginMode["TRIANGLE_STRIP"] = 5] = "TRIANGLE_STRIP";
    BeginMode[BeginMode["TRIANGLE_FAN"] = 6] = "TRIANGLE_FAN";
})(exports.BeginMode || (exports.BeginMode = {}));

(function (BlendingFactorDest) {
    BlendingFactorDest[BlendingFactorDest["ZERO"] = 0] = "ZERO";
    BlendingFactorDest[BlendingFactorDest["ONE"] = 1] = "ONE";
    BlendingFactorDest[BlendingFactorDest["SRC_COLOR"] = 768] = "SRC_COLOR";
    BlendingFactorDest[BlendingFactorDest["ONE_MINUS_SRC_COLOR"] = 769] = "ONE_MINUS_SRC_COLOR";
    BlendingFactorDest[BlendingFactorDest["SRC_ALPHA"] = 770] = "SRC_ALPHA";
    BlendingFactorDest[BlendingFactorDest["ONE_MINUS_SRC_ALPHA"] = 771] = "ONE_MINUS_SRC_ALPHA";
    BlendingFactorDest[BlendingFactorDest["DST_ALPHA"] = 772] = "DST_ALPHA";
    BlendingFactorDest[BlendingFactorDest["ONE_MINUS_DST_ALPHA"] = 773] = "ONE_MINUS_DST_ALPHA";
})(exports.BlendingFactorDest || (exports.BlendingFactorDest = {}));

(function (BlendingFactorSrc) {
    BlendingFactorSrc[BlendingFactorSrc["ZERO"] = 0] = "ZERO";
    BlendingFactorSrc[BlendingFactorSrc["ONE"] = 1] = "ONE";
    BlendingFactorSrc[BlendingFactorSrc["DST_COLOR"] = 774] = "DST_COLOR";
    BlendingFactorSrc[BlendingFactorSrc["ONE_MINUS_DST_COLOR"] = 775] = "ONE_MINUS_DST_COLOR";
    BlendingFactorSrc[BlendingFactorSrc["SRC_ALPHA_SATURATE"] = 776] = "SRC_ALPHA_SATURATE";
    BlendingFactorSrc[BlendingFactorSrc["SRC_ALPHA"] = 770] = "SRC_ALPHA";
    BlendingFactorSrc[BlendingFactorSrc["ONE_MINUS_SRC_ALPHA"] = 771] = "ONE_MINUS_SRC_ALPHA";
    BlendingFactorSrc[BlendingFactorSrc["DST_ALPHA"] = 772] = "DST_ALPHA";
    BlendingFactorSrc[BlendingFactorSrc["ONE_MINUS_DST_ALPHA"] = 773] = "ONE_MINUS_DST_ALPHA";
})(exports.BlendingFactorSrc || (exports.BlendingFactorSrc = {}));

/**
 * A capability that may be enabled or disabled for a WebGLRenderingContext.
 */

(function (Capability) {
    /**
     * Let polygons be culled.
     */
    Capability[Capability["CULL_FACE"] = 2884] = "CULL_FACE";
    /**
     * Blend computed fragment color values with color buffer values.
     */
    Capability[Capability["BLEND"] = 3042] = "BLEND";
    /**
     *
     */
    Capability[Capability["DITHER"] = 3024] = "DITHER";
    /**
     *
     */
    Capability[Capability["STENCIL_TEST"] = 2960] = "STENCIL_TEST";
    /**
     * Enable updates of the depth buffer.
     */
    Capability[Capability["DEPTH_TEST"] = 2929] = "DEPTH_TEST";
    /**
     * Abandon fragments outside a scissor rectangle.
     */
    Capability[Capability["SCISSOR_TEST"] = 3089] = "SCISSOR_TEST";
    /**
     * Add an offset to the depth values of a polygon's fragments.
     */
    Capability[Capability["POLYGON_OFFSET_FILL"] = 32823] = "POLYGON_OFFSET_FILL";
    /**
     *
     */
    Capability[Capability["SAMPLE_ALPHA_TO_COVERAGE"] = 32926] = "SAMPLE_ALPHA_TO_COVERAGE";
    /**
     *
     */
    Capability[Capability["SAMPLE_COVERAGE"] = 32928] = "SAMPLE_COVERAGE";
})(exports.Capability || (exports.Capability = {}));

(function (ClearBufferMask) {
    ClearBufferMask[ClearBufferMask["DEPTH_BUFFER_BIT"] = 256] = "DEPTH_BUFFER_BIT";
    ClearBufferMask[ClearBufferMask["STENCIL_BUFFER_BIT"] = 1024] = "STENCIL_BUFFER_BIT";
    ClearBufferMask[ClearBufferMask["COLOR_BUFFER_BIT"] = 16384] = "COLOR_BUFFER_BIT";
})(exports.ClearBufferMask || (exports.ClearBufferMask = {}));

/**
 * DataType with values from WebGLRenderingContextBase.
 *
 * https://www.khronos.org/registry/webgl/specs/1.0/
 */

(function (DataType) {
    DataType[DataType["BYTE"] = 5120] = "BYTE";
    DataType[DataType["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
    DataType[DataType["SHORT"] = 5122] = "SHORT";
    DataType[DataType["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
    DataType[DataType["INT"] = 5124] = "INT";
    DataType[DataType["UNSIGNED_INT"] = 5125] = "UNSIGNED_INT";
    DataType[DataType["FLOAT"] = 5126] = "FLOAT";
})(exports.DataType || (exports.DataType = {}));

/**
 * An enumeration specifying the depth comparison function, which sets the conditions
 * under which the pixel will be drawn. The default value is LESS.
 */

(function (DepthFunction) {
    /**
     * never pass
     */
    DepthFunction[DepthFunction["NEVER"] = 512] = "NEVER";
    /**
     * pass if the incoming value is less than the depth buffer value
     */
    DepthFunction[DepthFunction["LESS"] = 513] = "LESS";
    /**
     * pass if the incoming value equals the the depth buffer value
     */
    DepthFunction[DepthFunction["EQUAL"] = 514] = "EQUAL";
    /**
     * pass if the incoming value is less than or equal to the depth buffer value
     */
    DepthFunction[DepthFunction["LEQUAL"] = 515] = "LEQUAL";
    /**
     * pass if the incoming value is greater than the depth buffer value
     */
    DepthFunction[DepthFunction["GREATER"] = 516] = "GREATER";
    /**
     * pass if the incoming value is not equal to the depth buffer value
     */
    DepthFunction[DepthFunction["NOTEQUAL"] = 517] = "NOTEQUAL";
    /**
     * pass if the incoming value is greater than or equal to the depth buffer value
     */
    DepthFunction[DepthFunction["GEQUAL"] = 518] = "GEQUAL";
    /**
     * always pass
     */
    DepthFunction[DepthFunction["ALWAYS"] = 519] = "ALWAYS";
})(exports.DepthFunction || (exports.DepthFunction = {}));

function beDefined() {
    return "not be 'undefined'";
}
function mustBeDefined(name, value, contextBuilder) {
    mustSatisfy(name, isDefined(value), beDefined, contextBuilder);
    return value;
}

function notSupported(name) {
    mustBeString('name', name);
    var message = {
        get message() {
            return "Method `" + name + "` is not supported.";
        }
    };
    return message;
}

function isNull(x) {
    return x === null;
}

function isObject(x) {
    return (typeof x === 'object');
}

function beObject() {
    return "be a non-null `object`";
}
function mustBeNonNullObject(name, value, contextBuilder) {
    mustSatisfy(name, isObject(value) && !isNull(value), beObject, contextBuilder);
    return value;
}

/**
 *
 */
var ShareableContextConsumer = (function (_super) {
    __extends(ShareableContextConsumer, _super);
    /**
     *
     */
    function ShareableContextConsumer(contextManager) {
        var _this = _super.call(this) || this;
        _this.contextManager = contextManager;
        /**
         * Keep track of subscription state
         */
        _this.isSubscribed = false;
        // The buck stops here so we must assert the existence of the contextManager. 
        mustBeNonNullObject('contextManager', contextManager);
        _this.setLoggingName('ShareableContextConsumer');
        contextManager.addRef();
        _this.subscribe(false);
        return _this;
    }
    /**
     *
     */
    ShareableContextConsumer.prototype.resurrector = function (levelUp) {
        _super.prototype.resurrector.call(this, levelUp + 1);
        this.setLoggingName('ShareableContextConsumer');
        this.contextManager.addRef();
        this.subscribe(false);
    };
    /**
     *
     */
    ShareableContextConsumer.prototype.destructor = function (levelUp) {
        this.unsubscribe(false);
        this.contextManager.release();
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    /**
     * Instructs the consumer to subscribe to context events.
     *
     * This method is idempotent; calling it more than once with the same <code>ContextManager</code> does not change the state.
     */
    ShareableContextConsumer.prototype.subscribe = function (synchUp) {
        if (!this.isSubscribed) {
            this.contextManager.addContextListener(this);
            this.isSubscribed = true;
            if (synchUp) {
                this.synchUp();
            }
        }
    };
    /**
     * Instructs the consumer to unsubscribe from context events.
     *
     * This method is idempotent; calling it more than once does not change the state.
     */
    ShareableContextConsumer.prototype.unsubscribe = function (cleanUp) {
        if (this.isSubscribed) {
            this.contextManager.removeContextListener(this);
            this.isSubscribed = false;
            if (cleanUp) {
                this.cleanUp();
            }
        }
    };
    /**
     *
     */
    ShareableContextConsumer.prototype.synchUp = function () {
        this.contextManager.synchronize(this);
    };
    /**
     *
     */
    ShareableContextConsumer.prototype.cleanUp = function () {
        if (this.gl) {
            if (this.gl.isContextLost()) {
                this.contextLost();
            }
            else {
                this.contextFree();
            }
        }
        else {
            // There is no contextProvider so resources should already be clean.
        }
    };
    ShareableContextConsumer.prototype.contextFree = function () {
        // Do nothing.
    };
    ShareableContextConsumer.prototype.contextGain = function () {
        // Do nothing.
    };
    ShareableContextConsumer.prototype.contextLost = function () {
        // Do nothing.
    };
    Object.defineProperty(ShareableContextConsumer.prototype, "gl", {
        /**
         * Provides access to the underlying WebGL context.
         */
        get: function () {
            return this.contextManager.gl;
        },
        enumerable: true,
        configurable: true
    });
    return ShareableContextConsumer;
}(ShareableBase));

/**
 * GeometryBase
 */
var GeometryBase = (function (_super) {
    __extends(GeometryBase, _super);
    /**
     *
     */
    function GeometryBase(contextManager, levelUp) {
        var _this = _super.call(this, contextManager) || this;
        _this.setLoggingName("GeometryBase");
        if (levelUp === 0) {
            _this.synchUp();
        }
        return _this;
    }
    /**
     *
     */
    GeometryBase.prototype.resurrector = function (levelUp) {
        _super.prototype.resurrector.call(this, levelUp + 1);
        this.setLoggingName("GeometryBase");
        if (levelUp === 0) {
            this.synchUp();
        }
    };
    /**
     *
     */
    GeometryBase.prototype.destructor = function (levelUp) {
        if (levelUp === 0) {
            this.cleanUp();
        }
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    /**
     *
     */
    GeometryBase.prototype.bind = function (material) {
        mustBeDefined('material', material);
        throw new Error(notSupported("bind(material: Material)").message);
    };
    /**
     *
     */
    GeometryBase.prototype.unbind = function (material) {
        mustBeDefined('material', material);
        throw new Error(notSupported("unbind(material: Material)").message);
    };
    /**
     *
     */
    GeometryBase.prototype.draw = function () {
        throw new Error(notSupported('draw()').message);
    };
    return GeometryBase;
}(ShareableContextConsumer));

/**
 * WebGLBuffer usage.
 */

(function (Usage) {
    /**
     * Contents of the buffer are likely to not be used often.
     * Contents are written to the buffer, but not read.
     */
    Usage[Usage["STREAM_DRAW"] = 35040] = "STREAM_DRAW";
    /**
     * Contents of the buffer are likely to be used often and not change often.
     * Contents are written to the buffer, but not read.
     */
    Usage[Usage["STATIC_DRAW"] = 35044] = "STATIC_DRAW";
    /**
     * Contents of the buffer are likely to be used often and change often.
     * Contents are written to the buffer, but not read.
     */
    Usage[Usage["DYNAMIC_DRAW"] = 35048] = "DYNAMIC_DRAW";
})(exports.Usage || (exports.Usage = {}));

/**
 * Computes the number of elements represented by the attribute values.
 */
function computeCount(attribs, aNames) {
    var aNamesLen = aNames.length;
    // TODO: We currently return after computing the count for the first aName, but we should
    // perform a consistency check.
    for (var a = 0; a < aNamesLen; a++) {
        var aName = aNames[a];
        var attrib = attribs[aName];
        var vLength = attrib.values.length;
        var size = mustBeInteger('size', attrib.size);
        return vLength / size;
    }
    return 0;
}

/**
 * Computes the interleaved attribute values array.
 */
function computeAttributes(attributes, aNames) {
    var aNamesLen = aNames.length;
    var values = [];
    var iLen = computeCount(attributes, aNames);
    for (var i = 0; i < iLen; i++) {
        // Looping over the attribute name as the inner loop creates the interleaving.
        for (var a = 0; a < aNamesLen; a++) {
            var aName = aNames[a];
            var attrib = attributes[aName];
            var size = attrib.size;
            for (var s = 0; s < size; s++) {
                values.push(attrib.values[i * size + s]);
            }
        }
    }
    return values;
}

/**
 * @deprecated
 */
function computePointers(attributes, aNames) {
    var aNamesLen = aNames.length;
    var pointers = [];
    var offset = 0;
    for (var a = 0; a < aNamesLen; a++) {
        var aName = aNames[a];
        var attrib = attributes[aName];
        // FIXME: It's a lot more complicated choosing these parameters than for the simple FLOAT case.
        pointers.push({ name: aName, size: attrib.size, type: exports.DataType.FLOAT, normalized: true, offset: offset });
        offset += attrib.size * 4; // We're assuming that the data type is FLOAT
    }
    return pointers;
}

/**
 * Computes the stride for a given collection of attributes.
 */
function computeStride(attributes, aNames) {
    var aNamesLen = aNames.length;
    var stride = 0;
    for (var a = 0; a < aNamesLen; a++) {
        var aName = aNames[a];
        var attrib = attributes[aName];
        stride += attrib.size * 4; // We're assuming that the data type is gl.FLOAT
    }
    return stride;
}

/**
 * Converts the Primitive to the interleaved VertexArrays format.
 * This conversion is performed for eddiciency; it allows multiple attributes to be
 * combined into a single array of numbers so that it may be stored in a single vertex buffer.
 *
 * @param primitive The Primitive to be converted.
 * @param order The ordering of the attributes.
 */
function vertexArraysFromPrimitive(primitive, order) {
    if (primitive) {
        var keys = order ? order : Object.keys(primitive.attributes);
        var that = {
            mode: primitive.mode,
            indices: primitive.indices,
            attributes: computeAttributes(primitive.attributes, keys),
            stride: computeStride(primitive.attributes, keys),
            pointers: computePointers(primitive.attributes, keys)
        };
        return that;
    }
    else {
        return void 0;
    }
}

var BufferObjects;
(function (BufferObjects) {
    BufferObjects[BufferObjects["ARRAY_BUFFER"] = 34962] = "ARRAY_BUFFER";
    BufferObjects[BufferObjects["ELEMENT_ARRAY_BUFFER"] = 34963] = "ELEMENT_ARRAY_BUFFER";
    BufferObjects[BufferObjects["ARRAY_BUFFER_BINDING"] = 34964] = "ARRAY_BUFFER_BINDING";
    BufferObjects[BufferObjects["ELEMENT_ARRAY_BUFFER_BINDING"] = 34965] = "ELEMENT_ARRAY_BUFFER_BINDING";
})(BufferObjects || (BufferObjects = {}));

function isUndefined(arg) {
    return (typeof arg === 'undefined');
}

function beUndefined() {
    return "be 'undefined'";
}
function mustBeUndefined(name, value, contextBuilder) {
    mustSatisfy(name, isUndefined(value), beUndefined, contextBuilder);
    return value;
}

/**
 * A wrapper around a WebGLBuffer with binding to ARRAY_BUFFER.
 */
var VertexBuffer = (function (_super) {
    __extends(VertexBuffer, _super);
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
        mustBeUndefined(this.getLoggingName(), this.webGLBuffer);
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    VertexBuffer.prototype.upload = function () {
        var gl = this.gl;
        if (gl) {
            if (this.webGLBuffer) {
                if (this.data) {
                    gl.bufferData(BufferObjects.ARRAY_BUFFER, this.data, this.usage);
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
            gl.bindBuffer(BufferObjects.ARRAY_BUFFER, this.webGLBuffer);
        }
    };
    VertexBuffer.prototype.unbind = function () {
        var gl = this.gl;
        if (gl) {
            gl.bindBuffer(BufferObjects.ARRAY_BUFFER, null);
        }
    };
    return VertexBuffer;
}(ShareableContextConsumer));

/**
 * A concrete Geometry for supporting drawArrays.
 */
var GeometryArrays = (function (_super) {
    __extends(GeometryArrays, _super);
    /**
     *
     */
    function GeometryArrays(contextManager, primitive, options, levelUp) {
        if (options === void 0) { options = {}; }
        if (levelUp === void 0) { levelUp = 0; }
        var _this = _super.call(this, contextManager, levelUp + 1) || this;
        /**
         * The <code>first</code> parameter in the drawArrays call.
         * This is currently hard-code to zero because this class only supportes buffering one primitive.
         */
        _this.first = 0;
        mustBeNonNullObject('primitive', primitive);
        _this.setLoggingName('GeometryArrays');
        // FIXME: order as an option
        var vertexArrays = vertexArraysFromPrimitive(primitive, options.order);
        _this.mode = vertexArrays.mode;
        _this.vbo = new VertexBuffer(contextManager, new Float32Array(vertexArrays.attributes), exports.Usage.STATIC_DRAW);
        // FIXME: Hacky
        _this.count = vertexArrays.attributes.length / (vertexArrays.stride / 4);
        // FIXME: stride is not quite appropriate here because we don't have BYTES.
        _this.stride = vertexArrays.stride;
        _this.pointers = vertexArrays.pointers;
        if (levelUp === 0) {
            _this.synchUp();
        }
        return _this;
    }
    /**
     *
     */
    GeometryArrays.prototype.resurrector = function (levelUp) {
        _super.prototype.resurrector.call(this, levelUp + 1);
        this.setLoggingName('GeometryArrays');
        this.vbo.addRef();
        if (levelUp === 0) {
            this.synchUp();
        }
    };
    /**
     *
     */
    GeometryArrays.prototype.destructor = function (levelUp) {
        if (levelUp === 0) {
            this.cleanUp();
        }
        this.vbo.release();
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    GeometryArrays.prototype.bind = function (material) {
        this.vbo.bind();
        var pointers = this.pointers;
        if (pointers) {
            var iLength = pointers.length;
            for (var i = 0; i < iLength; i++) {
                var pointer = pointers[i];
                var attrib = material.getAttrib(pointer.name);
                if (attrib) {
                    attrib.config(pointer.size, pointer.type, pointer.normalized, this.stride, pointer.offset);
                    attrib.enable();
                }
            }
        }
        return this;
    };
    GeometryArrays.prototype.draw = function () {
        if (this.gl) {
            this.gl.drawArrays(this.mode, this.first, this.count);
        }
        return this;
    };
    GeometryArrays.prototype.unbind = function (material) {
        var pointers = this.pointers;
        if (pointers) {
            var iLength = pointers.length;
            for (var i = 0; i < iLength; i++) {
                var pointer = pointers[i];
                var attrib = material.getAttrib(pointer.name);
                if (attrib) {
                    attrib.disable();
                }
            }
        }
        this.vbo.unbind();
        return this;
    };
    return GeometryArrays;
}(GeometryBase));

/**
 * A wrapper around a WebGLBuffer with binding to ELEMENT_ARRAY_BUFFER.
 */
var IndexBuffer = (function (_super) {
    __extends(IndexBuffer, _super);
    /**
     *
     */
    function IndexBuffer(contextManager, data, usage, levelUp) {
        if (levelUp === void 0) { levelUp = 0; }
        var _this = _super.call(this, contextManager) || this;
        _this.data = data;
        _this.usage = usage;
        _this.setLoggingName('IndexBuffer');
        if (levelUp === 0) {
            _this.synchUp();
        }
        return _this;
    }
    /**
     *
     */
    IndexBuffer.prototype.resurrector = function (levelUp) {
        _super.prototype.resurrector.call(this, levelUp + 1);
        this.setLoggingName('IndexBuffer');
        if (levelUp === 0) {
            this.synchUp();
        }
    };
    /**
     *
     */
    IndexBuffer.prototype.destructor = function (levelUp) {
        if (levelUp === 0) {
            this.cleanUp();
        }
        mustBeUndefined(this.getLoggingName(), this.webGLBuffer);
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    IndexBuffer.prototype.upload = function () {
        var gl = this.gl;
        if (gl) {
            if (this.webGLBuffer) {
                if (this.data) {
                    gl.bufferData(BufferObjects.ELEMENT_ARRAY_BUFFER, this.data, this.usage);
                }
            }
        }
    };
    IndexBuffer.prototype.contextFree = function () {
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
    IndexBuffer.prototype.contextGain = function () {
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
    IndexBuffer.prototype.contextLost = function () {
        this.webGLBuffer = void 0;
        _super.prototype.contextLost.call(this);
    };
    /**
     * Binds the underlying WebGLBuffer to the ELEMENT_ARRAY_BUFFER target.
     */
    IndexBuffer.prototype.bind = function () {
        var gl = this.gl;
        if (gl) {
            gl.bindBuffer(BufferObjects.ELEMENT_ARRAY_BUFFER, this.webGLBuffer);
        }
    };
    IndexBuffer.prototype.unbind = function () {
        var gl = this.gl;
        if (gl) {
            gl.bindBuffer(BufferObjects.ELEMENT_ARRAY_BUFFER, null);
        }
    };
    return IndexBuffer;
}(ShareableContextConsumer));

function isArray(x) {
    return Object.prototype.toString.call(x) === '[object Array]';
}

function beAnArray() {
    return "be an array";
}
function mustBeArray(name, value, contextBuilder) {
    mustSatisfy(name, isArray(value), beAnArray, contextBuilder);
    return value;
}

/**
 * A Geometry that supports interleaved vertex buffers.
 */
var GeometryElements = (function (_super) {
    __extends(GeometryElements, _super);
    /**
     *
     */
    function GeometryElements(contextManager, primitive, options, levelUp) {
        if (options === void 0) { options = {}; }
        if (levelUp === void 0) { levelUp = 0; }
        var _this = _super.call(this, contextManager, levelUp + 1) || this;
        /**
         * Hard-coded to zero right now.
         * This suggests that the index buffer could be used for several gl.drawElements(...)
         */
        _this.offset = 0;
        _this.setLoggingName('GeometryElements');
        mustBeNonNullObject('primitive', primitive);
        var vertexArrays = vertexArraysFromPrimitive(primitive, options.order);
        _this.mode = vertexArrays.mode;
        _this.count = vertexArrays.indices.length;
        _this.ibo = new IndexBuffer(contextManager, new Uint16Array(vertexArrays.indices), exports.Usage.STATIC_DRAW);
        _this.stride = vertexArrays.stride;
        if (!isNull(vertexArrays.pointers) && !isUndefined(vertexArrays.pointers)) {
            if (isArray(vertexArrays.pointers)) {
                _this.pointers = vertexArrays.pointers;
            }
            else {
                mustBeArray('data.pointers', vertexArrays.pointers);
            }
        }
        else {
            _this.pointers = [];
        }
        _this.vbo = new VertexBuffer(contextManager, new Float32Array(vertexArrays.attributes), exports.Usage.STATIC_DRAW);
        if (levelUp === 0) {
            _this.synchUp();
        }
        return _this;
    }
    /**
     *
     */
    GeometryElements.prototype.resurrector = function (levelUp) {
        _super.prototype.resurrector.call(this, levelUp + 1);
        this.setLoggingName('GeometryElements');
        this.ibo.addRef();
        this.vbo.addRef();
        if (levelUp === 0) {
            this.synchUp();
        }
    };
    /**
     *
     */
    GeometryElements.prototype.destructor = function (levelUp) {
        if (levelUp === 0) {
            this.cleanUp();
        }
        this.ibo.release();
        this.vbo.release();
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    GeometryElements.prototype.contextFree = function () {
        this.ibo.contextFree();
        this.vbo.contextFree();
        _super.prototype.contextFree.call(this);
    };
    GeometryElements.prototype.contextGain = function () {
        this.ibo.contextGain();
        this.vbo.contextGain();
        _super.prototype.contextGain.call(this);
    };
    GeometryElements.prototype.contextLost = function () {
        this.ibo.contextLost();
        this.vbo.contextLost();
        _super.prototype.contextLost.call(this);
    };
    GeometryElements.prototype.bind = function (material) {
        this.vbo.bind();
        var pointers = this.pointers;
        if (pointers) {
            var iLength = pointers.length;
            for (var i = 0; i < iLength; i++) {
                var pointer = pointers[i];
                var attrib = material.getAttrib(pointer.name);
                if (attrib) {
                    attrib.config(pointer.size, pointer.type, pointer.normalized, this.stride, pointer.offset);
                    attrib.enable();
                }
            }
        }
        this.ibo.bind();
        return this;
    };
    GeometryElements.prototype.unbind = function (material) {
        this.ibo.unbind();
        var pointers = this.pointers;
        if (pointers) {
            var iLength = pointers.length;
            for (var i = 0; i < iLength; i++) {
                var pointer = pointers[i];
                var attrib = material.getAttrib(pointer.name);
                if (attrib) {
                    attrib.disable();
                }
            }
        }
        this.vbo.unbind();
        return this;
    };
    GeometryElements.prototype.draw = function () {
        if (this.gl) {
            if (this.count) {
                this.gl.drawElements(this.mode, this.count, exports.DataType.UNSIGNED_SHORT, this.offset);
            }
        }
        return this;
    };
    return GeometryElements;
}(GeometryBase));

/**
 * Canonical variable names, which also act as semantic identifiers for name overrides.
 * These names must be stable to avoid breaking custom vertex and fragment shaders.
 */
var GraphicsProgramSymbols = (function () {
    function GraphicsProgramSymbols() {
    }
    /**
     * 'aColor'
     */
    GraphicsProgramSymbols.ATTRIBUTE_COLOR = 'aColor';
    /**
     * 'aGeometryIndex'
     */
    GraphicsProgramSymbols.ATTRIBUTE_GEOMETRY_INDEX = 'aGeometryIndex';
    /**
     * 'aNormal'
     */
    GraphicsProgramSymbols.ATTRIBUTE_NORMAL = 'aNormal';
    /**
     * 'aOpacity'
     */
    GraphicsProgramSymbols.ATTRIBUTE_OPACITY = 'aOpacity';
    /**
     * 'aPosition'
     */
    GraphicsProgramSymbols.ATTRIBUTE_POSITION = 'aPosition';
    /**
     * 'aTangent'
     */
    GraphicsProgramSymbols.ATTRIBUTE_TANGENT = 'aTangent';
    /**
     * 'aCoords'
     */
    GraphicsProgramSymbols.ATTRIBUTE_COORDS = 'aCoords';
    /**
     * 'uAlpha'
     */
    GraphicsProgramSymbols.UNIFORM_ALPHA = 'uAlpha';
    /**
     * 'uAmbientLight'
     */
    GraphicsProgramSymbols.UNIFORM_AMBIENT_LIGHT = 'uAmbientLight';
    /**
     * 'uColor'
     */
    GraphicsProgramSymbols.UNIFORM_COLOR = 'uColor';
    /**
     * 'uDirectionalLightColor'
     */
    GraphicsProgramSymbols.UNIFORM_DIRECTIONAL_LIGHT_COLOR = 'uDirectionalLightColor';
    /**
     * 'uDirectionalLightDirection'
     */
    GraphicsProgramSymbols.UNIFORM_DIRECTIONAL_LIGHT_DIRECTION = 'uDirectionalLightDirection';
    /**
     * 'uImage'
     */
    GraphicsProgramSymbols.UNIFORM_IMAGE = 'uImage';
    /**
     * 'uOpacity'
     */
    GraphicsProgramSymbols.UNIFORM_OPACITY = 'uOpacity';
    /**
     * 'uPointLightColor'
     */
    GraphicsProgramSymbols.UNIFORM_POINT_LIGHT_COLOR = 'uPointLightColor';
    /**
     * 'uPointLightPosition'
     */
    GraphicsProgramSymbols.UNIFORM_POINT_LIGHT_POSITION = 'uPointLightPosition';
    /**
     * 'uPointSize'
     */
    GraphicsProgramSymbols.UNIFORM_POINT_SIZE = 'uPointSize';
    /**
     * 'uProjection'
     */
    GraphicsProgramSymbols.UNIFORM_PROJECTION_MATRIX = 'uProjection';
    /**
     * 'uReflectionOne'
     */
    GraphicsProgramSymbols.UNIFORM_REFLECTION_ONE_MATRIX = 'uReflectionOne';
    /**
     * 'uReflectionTwo'
     */
    GraphicsProgramSymbols.UNIFORM_REFLECTION_TWO_MATRIX = 'uReflectionTwo';
    /**
     * 'uModel'
     */
    GraphicsProgramSymbols.UNIFORM_MODEL_MATRIX = 'uModel';
    /**
     * 'uNormal'
     */
    GraphicsProgramSymbols.UNIFORM_NORMAL_MATRIX = 'uNormal';
    /**
     * 'uView'
     */
    GraphicsProgramSymbols.UNIFORM_VIEW_MATRIX = 'uView';
    /**
     * 'vColor'
     */
    GraphicsProgramSymbols.VARYING_COLOR = 'vColor';
    /**
     * 'vCoords'
     */
    GraphicsProgramSymbols.VARYING_COORDS = 'vCoords';
    /**
     * 'vLight'
     */
    GraphicsProgramSymbols.VARYING_LIGHT = 'vLight';
    return GraphicsProgramSymbols;
}());

(function (PixelFormat) {
    PixelFormat[PixelFormat["DEPTH_COMPONENT"] = 6402] = "DEPTH_COMPONENT";
    PixelFormat[PixelFormat["ALPHA"] = 6406] = "ALPHA";
    PixelFormat[PixelFormat["RGB"] = 6407] = "RGB";
    PixelFormat[PixelFormat["RGBA"] = 6408] = "RGBA";
    PixelFormat[PixelFormat["LUMINANCE"] = 6409] = "LUMINANCE";
    PixelFormat[PixelFormat["LUMINANCE_ALPHA"] = 6410] = "LUMINANCE_ALPHA";
})(exports.PixelFormat || (exports.PixelFormat = {}));

/**
 *
 */

(function (TextureParameterName) {
    TextureParameterName[TextureParameterName["TEXTURE_MAG_FILTER"] = 10240] = "TEXTURE_MAG_FILTER";
    TextureParameterName[TextureParameterName["TEXTURE_MIN_FILTER"] = 10241] = "TEXTURE_MIN_FILTER";
    TextureParameterName[TextureParameterName["TEXTURE_WRAP_S"] = 10242] = "TEXTURE_WRAP_S";
    TextureParameterName[TextureParameterName["TEXTURE_WRAP_T"] = 10243] = "TEXTURE_WRAP_T";
})(exports.TextureParameterName || (exports.TextureParameterName = {}));

var Texture = (function (_super) {
    __extends(Texture, _super);
    function Texture(target, contextManager, levelUp) {
        if (levelUp === void 0) { levelUp = 0; }
        var _this = _super.call(this, contextManager) || this;
        _this.setLoggingName('Texture');
        _this._target = target;
        if (levelUp === 0) {
            _this.synchUp();
        }
        return _this;
    }
    Texture.prototype.destructor = function (levelUp) {
        if (levelUp === 0) {
            this.cleanUp();
        }
        _super.prototype.destructor.call(this, levelUp + 1);
        mustBeUndefined(this.getLoggingName(), this._texture);
    };
    Texture.prototype.contextFree = function () {
        if (this._texture) {
            this.gl.deleteTexture(this._texture);
            this._texture = void 0;
            _super.prototype.contextFree.call(this);
        }
    };
    Texture.prototype.contextGain = function () {
        if (!this._texture) {
            _super.prototype.contextGain.call(this);
            this._texture = this.contextManager.gl.createTexture();
        }
    };
    Texture.prototype.contextLost = function () {
        this._texture = void 0;
        _super.prototype.contextLost.call(this);
    };
    /**
     *
     */
    Texture.prototype.bind = function () {
        if (this.gl) {
            this.gl.bindTexture(this._target, this._texture);
        }
        else {
            console.warn(this.getLoggingName() + ".bind() missing WebGL rendering context.");
        }
    };
    /**
     *
     */
    Texture.prototype.unbind = function () {
        if (this.gl) {
            this.gl.bindTexture(this._target, null);
        }
        else {
            console.warn(this.getLoggingName() + ".unbind() missing WebGL rendering context.");
        }
    };
    Object.defineProperty(Texture.prototype, "minFilter", {
        get: function () {
            throw new Error('minFilter is write-only');
        },
        set: function (filter) {
            if (this.gl) {
                this.bind();
                this.gl.texParameteri(this._target, exports.TextureParameterName.TEXTURE_MIN_FILTER, filter);
                this.unbind();
            }
            else {
                console.warn(this.getLoggingName() + ".minFilter missing WebGL rendering context.");
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Texture.prototype, "magFilter", {
        get: function () {
            throw new Error('magFilter is write-only');
        },
        set: function (filter) {
            if (this.gl) {
                this.bind();
                this.gl.texParameteri(this._target, exports.TextureParameterName.TEXTURE_MAG_FILTER, filter);
                this.unbind();
            }
            else {
                console.warn(this.getLoggingName() + ".magFilter missing WebGL rendering context.");
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Texture.prototype, "wrapS", {
        get: function () {
            throw new Error('wrapS is write-only');
        },
        set: function (mode) {
            if (this.gl) {
                this.bind();
                this.gl.texParameteri(this._target, exports.TextureParameterName.TEXTURE_WRAP_S, mode);
                this.unbind();
            }
            else {
                console.warn(this.getLoggingName() + ".wrapS missing WebGL rendering context.");
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Texture.prototype, "wrapT", {
        get: function () {
            throw new Error('wrapT is write-only');
        },
        set: function (mode) {
            if (this.gl) {
                this.bind();
                this.gl.texParameteri(this._target, exports.TextureParameterName.TEXTURE_WRAP_T, mode);
                this.unbind();
            }
            else {
                console.warn(this.getLoggingName() + ".wrapT missing WebGL rendering context.");
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     *
     */
    Texture.prototype.upload = function () {
        throw new Error(this.getLoggingName() + ".upload() must be implemented.");
    };
    return Texture;
}(ShareableContextConsumer));

var ImageTexture = (function (_super) {
    __extends(ImageTexture, _super);
    function ImageTexture(image, target, contextManager, levelUp) {
        if (levelUp === void 0) { levelUp = 0; }
        var _this = _super.call(this, target, contextManager, levelUp + 1) || this;
        _this.image = image;
        _this.setLoggingName('ImageTexture');
        if (levelUp === 0) {
            _this.synchUp();
        }
        return _this;
    }
    ImageTexture.prototype.destructor = function (levelUp) {
        if (levelUp === 0) {
            this.cleanUp();
        }
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    Object.defineProperty(ImageTexture.prototype, "naturalHeight", {
        get: function () {
            if (this.image) {
                return this.image.naturalHeight;
            }
            else {
                return void 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageTexture.prototype, "naturalWidth", {
        get: function () {
            if (this.image) {
                return this.image.naturalWidth;
            }
            else {
                return void 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    ImageTexture.prototype.upload = function () {
        if (this.gl) {
            this.gl.texImage2D(this._target, 0, exports.PixelFormat.RGBA, exports.PixelFormat.RGBA, exports.DataType.UNSIGNED_BYTE, this.image);
        }
        else {
            console.warn(this.getLoggingName() + ".upload() missing WebGL rendering context.");
        }
    };
    return ImageTexture;
}(Texture));

(function (PixelType) {
    PixelType[PixelType["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
    PixelType[PixelType["UNSIGNED_SHORT_4_4_4_4"] = 32819] = "UNSIGNED_SHORT_4_4_4_4";
    PixelType[PixelType["UNSIGNED_SHORT_5_5_5_1"] = 32820] = "UNSIGNED_SHORT_5_5_5_1";
    PixelType[PixelType["UNSIGNED_SHORT_5_6_5"] = 33635] = "UNSIGNED_SHORT_5_6_5";
})(exports.PixelType || (exports.PixelType = {}));

/**
 * Essentially constructs the ShareableArray without incrementing the
 * reference count of the elements, and without creating zombies.
 */
function transferOwnership(data) {
    if (data) {
        var result = new ShareableArray(data);
        // The result has now taken ownership of the elements, so we can release.
        for (var i = 0, iLength = data.length; i < iLength; i++) {
            var element = data[i];
            if (element && element.release) {
                element.release();
            }
        }
        return result;
    }
    else {
        return void 0;
    }
}
/**
 * <p>
 * Collection class for maintaining an array of types derived from Shareable.
 * </p>
 * <p>
 * Provides a safer way to maintain reference counts than a native array.
 * </p>
 */
var ShareableArray = (function (_super) {
    __extends(ShareableArray, _super);
    /**
     *
     */
    function ShareableArray(elements) {
        if (elements === void 0) { elements = []; }
        var _this = _super.call(this) || this;
        _this.setLoggingName('ShareableArray');
        _this._elements = elements;
        for (var i = 0, l = _this._elements.length; i < l; i++) {
            var element = _this._elements[i];
            if (element.addRef) {
                element.addRef();
            }
        }
        return _this;
    }
    /**
     *
     */
    ShareableArray.prototype.destructor = function (levelUp) {
        for (var i = 0, l = this._elements.length; i < l; i++) {
            var element = this._elements[i];
            if (element.release) {
                element.release();
            }
        }
        this._elements = void 0;
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    /**
     *
     */
    ShareableArray.prototype.find = function (match) {
        var result = new ShareableArray([]);
        var elements = this._elements;
        var iLen = elements.length;
        for (var i = 0; i < iLen; i++) {
            var candidate = elements[i];
            if (match(candidate)) {
                result.push(candidate);
            }
        }
        return result;
    };
    /**
     *
     */
    ShareableArray.prototype.findOne = function (match) {
        var elements = this._elements;
        for (var i = 0, iLength = elements.length; i < iLength; i++) {
            var candidate = elements[i];
            if (match(candidate)) {
                if (candidate.addRef) {
                    candidate.addRef();
                }
                return candidate;
            }
        }
        return void 0;
    };
    /**
     * Gets the element at the specified index, incrementing the reference count.
     */
    ShareableArray.prototype.get = function (index) {
        var element = this.getWeakRef(index);
        if (element) {
            if (element.addRef) {
                element.addRef();
            }
        }
        return element;
    };
    /**
     * Gets the element at the specified index, without incrementing the reference count.
     */
    ShareableArray.prototype.getWeakRef = function (index) {
        return this._elements[index];
    };
    /**
     *
     */
    ShareableArray.prototype.indexOf = function (searchElement, fromIndex) {
        return this._elements.indexOf(searchElement, fromIndex);
    };
    Object.defineProperty(ShareableArray.prototype, "length", {
        /**
         *
         */
        get: function () {
            if (this._elements) {
                return this._elements.length;
            }
            else {
                console.warn("ShareableArray is now a zombie, length is undefined");
                return void 0;
            }
        },
        set: function (unused) {
            throw new Error(readOnly('length').message);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * The slice() method returns a shallow copy of a portion of an array into a new array object.
     *
     * It does not remove elements from the original array.
     */
    ShareableArray.prototype.slice = function (begin, end) {
        return new ShareableArray(this._elements.slice(begin, end));
    };
    /**
     * The splice() method changes the content of an array by removing existing elements and/or adding new elements.
     */
    ShareableArray.prototype.splice = function (index, deleteCount) {
        // The release burdon is on the caller now.
        return transferOwnership(this._elements.splice(index, deleteCount));
    };
    /**
     *
     */
    ShareableArray.prototype.shift = function () {
        // No need to addRef because ownership is being transferred to caller.
        return this._elements.shift();
    };
    /**
     * Traverse without Reference Counting
     */
    ShareableArray.prototype.forEach = function (callback) {
        return this._elements.forEach(callback);
    };
    /**
     * Pushes <code>element</code> onto the tail of the list and increments the element reference count.
     */
    ShareableArray.prototype.push = function (element) {
        if (element) {
            if (element.addRef) {
                element.addRef();
            }
        }
        return this.pushWeakRef(element);
    };
    /**
     * Pushes <code>element</code> onto the tail of the list <em>without</em> incrementing the <code>element</code> reference count.
     */
    ShareableArray.prototype.pushWeakRef = function (element) {
        return this._elements.push(element);
    };
    /**
     *
     */
    ShareableArray.prototype.pop = function () {
        // No need to addRef because ownership is being transferred to caller.
        return this._elements.pop();
    };
    /**
     *
     */
    ShareableArray.prototype.unshift = function (element) {
        if (element.addRef) {
            element.addRef();
        }
        return this.unshiftWeakRef(element);
    };
    /**
     * <p>
     * <code>unshift</code> <em>without</em> incrementing the <code>element</code> reference count.
     * </p>
     */
    ShareableArray.prototype.unshiftWeakRef = function (element) {
        return this._elements.unshift(element);
    };
    return ShareableArray;
}(ShareableBase));

/**
 * A collection of Renderable objects.
 */
var Scene = (function (_super) {
    __extends(Scene, _super);
    function Scene(contextManager, levelUp) {
        if (levelUp === void 0) { levelUp = 0; }
        var _this = _super.call(this, contextManager) || this;
        _this.setLoggingName('Scene');
        mustBeNonNullObject('contextManager', contextManager);
        _this._drawables = new ShareableArray([]);
        if (levelUp === 0) {
            _this.synchUp();
        }
        return _this;
    }
    Scene.prototype.destructor = function (levelUp) {
        if (levelUp === 0) {
            this.cleanUp();
        }
        this._drawables.release();
        this._drawables = void 0;
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    Scene.prototype.add = function (drawable) {
        mustBeNonNullObject('drawable', drawable);
        this._drawables.push(drawable);
    };
    Scene.prototype.contains = function (drawable) {
        mustBeNonNullObject('drawable', drawable);
        return this._drawables.indexOf(drawable) >= 0;
    };
    /**
     * @deprecated. Use the render method instead.
     */
    Scene.prototype.draw = function (ambients) {
        console.warn("Scene.draw is deprecated. Please use the Scene.render method instead.");
        this.render(ambients);
    };
    /**
     * Traverses the collection of Renderable objects, calling render(ambients) on each one.
     * The rendering takes place in two stages.
     * In the first stage, non-transparent objects are drawn.
     * In the second state, transparent objects are drawn.
     */
    Scene.prototype.render = function (ambients) {
        var gl = this.gl;
        if (gl) {
            var ds = this._drawables;
            var iLen = ds.length;
            /**
             * true is non-transparent objects exist.
             */
            var passOne = false;
            /**
             * true if transparent objects exist.
             */
            var passTwo = false;
            // Zeroth pass through objects determines what kind of objects exist.
            for (var i = 0; i < iLen; i++) {
                var d = ds.getWeakRef(i);
                if (d.transparent) {
                    passTwo = true;
                }
                else {
                    passOne = true;
                }
            }
            if (passOne || passTwo) {
                if (passTwo) {
                    var previousMask = gl.getParameter(gl.DEPTH_WRITEMASK);
                    if (passOne) {
                        // Render non-transparent objects in the first pass.
                        gl.depthMask(true);
                        for (var i = 0; i < iLen; i++) {
                            var d = ds.getWeakRef(i);
                            if (!d.transparent) {
                                d.render(ambients);
                            }
                        }
                    }
                    // Render transparent objects in the second pass.
                    gl.depthMask(false);
                    for (var i = 0; i < iLen; i++) {
                        var d = ds.getWeakRef(i);
                        if (d.transparent) {
                            d.render(ambients);
                        }
                    }
                    gl.depthMask(previousMask);
                }
                else {
                    // There must be non-transparent objects, render them.
                    for (var i = 0; i < iLen; i++) {
                        var d = ds.getWeakRef(i);
                        if (!d.transparent) {
                            d.render(ambients);
                        }
                    }
                }
            }
        }
    };
    Scene.prototype.find = function (match) {
        return this._drawables.find(match);
    };
    Scene.prototype.findOne = function (match) {
        return this._drawables.findOne(match);
    };
    Scene.prototype.findOneByName = function (name) {
        return this.findOne(function (drawable) { return drawable.name === name; });
    };
    Scene.prototype.findByName = function (name) {
        return this.find(function (drawable) { return drawable.name === name; });
    };
    Scene.prototype.remove = function (drawable) {
        mustBeNonNullObject('drawable', drawable);
        var index = this._drawables.indexOf(drawable);
        if (index >= 0) {
            this._drawables.splice(index, 1).release();
        }
    };
    Scene.prototype.contextFree = function () {
        for (var i = 0; i < this._drawables.length; i++) {
            var drawable = this._drawables.getWeakRef(i);
            if (drawable.contextFree) {
                drawable.contextFree();
            }
        }
        _super.prototype.contextFree.call(this);
    };
    Scene.prototype.contextGain = function () {
        for (var i = 0; i < this._drawables.length; i++) {
            var drawable = this._drawables.getWeakRef(i);
            if (drawable.contextGain) {
                drawable.contextGain();
            }
        }
        _super.prototype.contextGain.call(this);
    };
    Scene.prototype.contextLost = function () {
        for (var i = 0; i < this._drawables.length; i++) {
            var drawable = this._drawables.getWeakRef(i);
            if (drawable.contextLost) {
                drawable.contextLost();
            }
        }
        _super.prototype.contextLost.call(this);
    };
    return Scene;
}(ShareableContextConsumer));

function decodeType(gl, type) {
    if (type === gl.VERTEX_SHADER) {
        return "VERTEX_SHADER";
    }
    else if (type === gl.FRAGMENT_SHADER) {
        return "FRAGMENT_SHADER";
    }
    else {
        return "type => " + type + " shader";
    }
}
/**
 *
 */
function makeWebGLShader(gl, source, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (compiled) {
        return shader;
    }
    else {
        if (!gl.isContextLost()) {
            var message = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(message);
        }
        else {
            throw new Error("Context lost while compiling " + decodeType(gl, type) + ".");
        }
    }
}

/**
 *
 */
var Shader = (function (_super) {
    __extends(Shader, _super);
    function Shader(source, type, engine) {
        var _this = _super.call(this, engine) || this;
        _this.setLoggingName('Shader');
        _this._source = mustBeString('source', source);
        _this._shaderType = mustBeNumber('type', type);
        return _this;
    }
    Shader.prototype.destructor = function (levelUp) {
        _super.prototype.destructor.call(this, levelUp + 1);
        mustBeUndefined(this.getLoggingName(), this._shader);
    };
    Shader.prototype.contextFree = function () {
        if (this._shader) {
            this.contextManager.gl.deleteShader(this._shader);
            this._shader = void 0;
        }
        _super.prototype.contextFree.call(this);
    };
    Shader.prototype.contextGain = function () {
        this._shader = makeWebGLShader(this.contextManager.gl, this._source, this._shaderType);
        _super.prototype.contextGain.call(this);
    };
    Shader.prototype.contextLost = function () {
        this._shader = void 0;
        _super.prototype.contextLost.call(this);
    };
    return Shader;
}(ShareableContextConsumer));

/**
 *
 */

(function (TextureMagFilter) {
    TextureMagFilter[TextureMagFilter["NEAREST"] = 9728] = "NEAREST";
    TextureMagFilter[TextureMagFilter["LINEAR"] = 9729] = "LINEAR";
})(exports.TextureMagFilter || (exports.TextureMagFilter = {}));

/**
 *
 */

(function (TextureMinFilter) {
    TextureMinFilter[TextureMinFilter["NEAREST"] = 9728] = "NEAREST";
    TextureMinFilter[TextureMinFilter["LINEAR"] = 9729] = "LINEAR";
    TextureMinFilter[TextureMinFilter["NEAREST_MIPMAP_NEAREST"] = 9984] = "NEAREST_MIPMAP_NEAREST";
    TextureMinFilter[TextureMinFilter["LINEAR_MIPMAP_NEAREST"] = 9985] = "LINEAR_MIPMAP_NEAREST";
    TextureMinFilter[TextureMinFilter["NEAREST_MIPMAP_LINEAR"] = 9986] = "NEAREST_MIPMAP_LINEAR";
    TextureMinFilter[TextureMinFilter["LINEAR_MIPMAP_LINEAR"] = 9987] = "LINEAR_MIPMAP_LINEAR";
})(exports.TextureMinFilter || (exports.TextureMinFilter = {}));

/**
 *
 */

(function (TextureTarget) {
    TextureTarget[TextureTarget["TEXTURE_2D"] = 3553] = "TEXTURE_2D";
    TextureTarget[TextureTarget["TEXTURE"] = 5890] = "TEXTURE";
})(exports.TextureTarget || (exports.TextureTarget = {}));

/**
 *
 */

(function (TextureWrapMode) {
    TextureWrapMode[TextureWrapMode["REPEAT"] = 10497] = "REPEAT";
    TextureWrapMode[TextureWrapMode["CLAMP_TO_EDGE"] = 33071] = "CLAMP_TO_EDGE";
    TextureWrapMode[TextureWrapMode["MIRRORED_REPEAT"] = 33648] = "MIRRORED_REPEAT";
})(exports.TextureWrapMode || (exports.TextureWrapMode = {}));

function beObject$1() {
    return "be an `object`";
}
function mustBeObject(name, value, contextBuilder) {
    mustSatisfy(name, isObject(value), beObject$1, contextBuilder);
    return value;
}

/**
 * A wrapper around a <code>WebGLUniformLocation</code>.
 */
var Uniform = (function () {
    function Uniform(info) {
        if (!isNull(info)) {
            mustBeObject('info', info);
            this.name = info.name;
        }
    }
    Uniform.prototype.contextFree = function () {
        this.contextLost();
    };
    Uniform.prototype.contextGain = function (gl, program) {
        this.contextLost();
        this.gl = gl;
        // If the location is null, no uniforms are updated and no error code is generated.
        if (!isNull(this.name)) {
            this.location = gl.getUniformLocation(program, this.name);
        }
        else {
            this.location = null;
        }
    };
    Uniform.prototype.contextLost = function () {
        this.gl = void 0;
        this.location = void 0;
    };
    Uniform.prototype.uniform1f = function (x) {
        var gl = this.gl;
        if (gl) {
            gl.uniform1f(this.location, x);
        }
    };
    Uniform.prototype.uniform1i = function (x) {
        var gl = this.gl;
        if (gl) {
            gl.uniform1i(this.location, x);
        }
    };
    Uniform.prototype.uniform2f = function (x, y) {
        var gl = this.gl;
        if (gl) {
            gl.uniform2f(this.location, x, y);
        }
    };
    Uniform.prototype.uniform2i = function (x, y) {
        var gl = this.gl;
        if (gl) {
            gl.uniform2i(this.location, x, y);
        }
    };
    Uniform.prototype.uniform3f = function (x, y, z) {
        var gl = this.gl;
        if (gl) {
            gl.uniform3f(this.location, x, y, z);
        }
    };
    Uniform.prototype.uniform3i = function (x, y, z) {
        var gl = this.gl;
        if (gl) {
            gl.uniform3i(this.location, x, y, z);
        }
    };
    Uniform.prototype.uniform4f = function (x, y, z, w) {
        var gl = this.gl;
        if (gl) {
            gl.uniform4f(this.location, x, y, z, w);
        }
    };
    Uniform.prototype.uniform4i = function (x, y, z, w) {
        var gl = this.gl;
        if (gl) {
            gl.uniform4i(this.location, x, y, z, w);
        }
    };
    /**
     * Sets a uniform location of type <code>mat2</code> in the <code>WebGLProgram</code>.
     */
    Uniform.prototype.matrix2fv = function (transpose, value) {
        var gl = this.gl;
        if (gl) {
            gl.uniformMatrix2fv(this.location, transpose, value);
        }
    };
    /**
     * Sets a uniform location of type <code>mat3</code> in a <code>WebGLProgram</code>.
     */
    Uniform.prototype.matrix3fv = function (transpose, value) {
        var gl = this.gl;
        if (gl) {
            gl.uniformMatrix3fv(this.location, transpose, value);
        }
    };
    /**
     * Sets a uniform location of type <code>mat4</code> in a <code>WebGLProgram</code>.
     */
    Uniform.prototype.matrix4fv = function (transpose, value) {
        var gl = this.gl;
        if (gl) {
            gl.uniformMatrix4fv(this.location, transpose, value);
        }
    };
    Uniform.prototype.uniform1fv = function (data) {
        var gl = this.gl;
        if (gl) {
            gl.uniform1fv(this.location, data);
        }
    };
    Uniform.prototype.uniform2fv = function (data) {
        var gl = this.gl;
        if (gl) {
            gl.uniform2fv(this.location, data);
        }
    };
    Uniform.prototype.uniform3fv = function (data) {
        var gl = this.gl;
        if (gl) {
            gl.uniform3fv(this.location, data);
        }
    };
    Uniform.prototype.uniform4fv = function (data) {
        var gl = this.gl;
        if (gl) {
            gl.uniform4fv(this.location, data);
        }
    };
    Uniform.prototype.toString = function () {
        return ['uniform', this.name].join(' ');
    };
    return Uniform;
}());

/**
 * Verify that the enums match the values in the WebGL rendering context.
 */
function checkEnums(gl) {
    // BeginMode
    mustBeEQ('LINE_LOOP', exports.BeginMode.LINE_LOOP, gl.LINE_LOOP);
    mustBeEQ('LINE_STRIP', exports.BeginMode.LINE_STRIP, gl.LINE_STRIP);
    mustBeEQ('LINES', exports.BeginMode.LINES, gl.LINES);
    mustBeEQ('POINTS', exports.BeginMode.POINTS, gl.POINTS);
    mustBeEQ('TRIANGLE_FAN', exports.BeginMode.TRIANGLE_FAN, gl.TRIANGLE_FAN);
    mustBeEQ('TRIANGLE_STRIP', exports.BeginMode.TRIANGLE_STRIP, gl.TRIANGLE_STRIP);
    mustBeEQ('TRIANGLES', exports.BeginMode.TRIANGLES, gl.TRIANGLES);
    // BlendingFactorDest
    mustBeEQ('ZERO', exports.BlendingFactorDest.ZERO, gl.ZERO);
    mustBeEQ('ONE', exports.BlendingFactorDest.ONE, gl.ONE);
    mustBeEQ('SRC_COLOR', exports.BlendingFactorDest.SRC_COLOR, gl.SRC_COLOR);
    mustBeEQ('ONE_MINUS_SRC_COLOR', exports.BlendingFactorDest.ONE_MINUS_SRC_COLOR, gl.ONE_MINUS_SRC_COLOR);
    mustBeEQ('SRC_ALPHA', exports.BlendingFactorDest.SRC_ALPHA, gl.SRC_ALPHA);
    mustBeEQ('ONE_MINUS_SRC_ALPHA', exports.BlendingFactorDest.ONE_MINUS_SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    mustBeEQ('DST_ALPHA', exports.BlendingFactorDest.DST_ALPHA, gl.DST_ALPHA);
    mustBeEQ('ONE_MINUS_DST_ALPHA', exports.BlendingFactorDest.ONE_MINUS_DST_ALPHA, gl.ONE_MINUS_DST_ALPHA);
    // BlendingFactorSrc
    mustBeEQ('ZERO', exports.BlendingFactorSrc.ZERO, gl.ZERO);
    mustBeEQ('ONE', exports.BlendingFactorSrc.ONE, gl.ONE);
    mustBeEQ('DST_COLOR', exports.BlendingFactorSrc.DST_COLOR, gl.DST_COLOR);
    mustBeEQ('ONE_MINUS_DST_COLOR', exports.BlendingFactorSrc.ONE_MINUS_DST_COLOR, gl.ONE_MINUS_DST_COLOR);
    mustBeEQ('SRC_ALPHA_SATURATE', exports.BlendingFactorSrc.SRC_ALPHA_SATURATE, gl.SRC_ALPHA_SATURATE);
    mustBeEQ('SRC_ALPHA', exports.BlendingFactorSrc.SRC_ALPHA, gl.SRC_ALPHA);
    mustBeEQ('ONE_MINUS_SRC_ALPHA', exports.BlendingFactorSrc.ONE_MINUS_SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    mustBeEQ('DST_ALPHA', exports.BlendingFactorSrc.DST_ALPHA, gl.DST_ALPHA);
    mustBeEQ('ONE_MINUS_DST_ALPHA', exports.BlendingFactorSrc.ONE_MINUS_DST_ALPHA, gl.ONE_MINUS_DST_ALPHA);
    // BufferObjects
    mustBeEQ('ARRAY_BUFFER', BufferObjects.ARRAY_BUFFER, gl.ARRAY_BUFFER);
    mustBeEQ('ARRAY_BUFFER_BINDING', BufferObjects.ARRAY_BUFFER_BINDING, gl.ARRAY_BUFFER_BINDING);
    mustBeEQ('ELEMENT_ARRAY_BUFFER', BufferObjects.ELEMENT_ARRAY_BUFFER, gl.ELEMENT_ARRAY_BUFFER);
    mustBeEQ('ELEMENT_ARRAY_BUFFER_BINDING', BufferObjects.ELEMENT_ARRAY_BUFFER_BINDING, gl.ELEMENT_ARRAY_BUFFER_BINDING);
    // Capability
    mustBeEQ('CULL_FACE', exports.Capability.CULL_FACE, gl.CULL_FACE);
    mustBeEQ('BLEND', exports.Capability.BLEND, gl.BLEND);
    mustBeEQ('DITHER', exports.Capability.DITHER, gl.DITHER);
    mustBeEQ('STENCIL_TEST', exports.Capability.STENCIL_TEST, gl.STENCIL_TEST);
    mustBeEQ('DEPTH_TEST', exports.Capability.DEPTH_TEST, gl.DEPTH_TEST);
    mustBeEQ('SCISSOR_TEST', exports.Capability.SCISSOR_TEST, gl.SCISSOR_TEST);
    mustBeEQ('POLYGON_OFFSET_FILL', exports.Capability.POLYGON_OFFSET_FILL, gl.POLYGON_OFFSET_FILL);
    mustBeEQ('SAMPLE_ALPHA_TO_COVERAGE', exports.Capability.SAMPLE_ALPHA_TO_COVERAGE, gl.SAMPLE_ALPHA_TO_COVERAGE);
    mustBeEQ('SAMPLE_COVERAGE', exports.Capability.SAMPLE_COVERAGE, gl.SAMPLE_COVERAGE);
    // ClearBufferMask
    mustBeEQ('COLOR_BUFFER_BIT', exports.ClearBufferMask.COLOR_BUFFER_BIT, gl.COLOR_BUFFER_BIT);
    mustBeEQ('DEPTH_BUFFER_BIT', exports.ClearBufferMask.DEPTH_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);
    mustBeEQ('STENCIL_BUFFER_BIT', exports.ClearBufferMask.STENCIL_BUFFER_BIT, gl.STENCIL_BUFFER_BIT);
    // DepthFunction
    mustBeEQ('ALWAYS', exports.DepthFunction.ALWAYS, gl.ALWAYS);
    mustBeEQ('EQUAL', exports.DepthFunction.EQUAL, gl.EQUAL);
    mustBeEQ('GEQUAL', exports.DepthFunction.GEQUAL, gl.GEQUAL);
    mustBeEQ('GREATER', exports.DepthFunction.GREATER, gl.GREATER);
    mustBeEQ('LEQUAL', exports.DepthFunction.LEQUAL, gl.LEQUAL);
    mustBeEQ('LESS', exports.DepthFunction.LESS, gl.LESS);
    mustBeEQ('NEVER', exports.DepthFunction.NEVER, gl.NEVER);
    mustBeEQ('NOTEQUAL', exports.DepthFunction.NOTEQUAL, gl.NOTEQUAL);
    // PixelFormat
    mustBeEQ('DEPTH_COMPONENT', exports.PixelFormat.DEPTH_COMPONENT, gl.DEPTH_COMPONENT);
    mustBeEQ('ALPHA', exports.PixelFormat.ALPHA, gl.ALPHA);
    mustBeEQ('RGB', exports.PixelFormat.RGB, gl.RGB);
    mustBeEQ('RGBA', exports.PixelFormat.RGBA, gl.RGBA);
    mustBeEQ('LUMINANCE', exports.PixelFormat.LUMINANCE, gl.LUMINANCE);
    mustBeEQ('LUMINANCE_ALPHA', exports.PixelFormat.LUMINANCE_ALPHA, gl.LUMINANCE_ALPHA);
    // PixelType
    mustBeEQ('UNSIGNED_BYTE', exports.PixelType.UNSIGNED_BYTE, gl.UNSIGNED_BYTE);
    mustBeEQ('UNSIGNED_SHORT_4_4_4_4', exports.PixelType.UNSIGNED_SHORT_4_4_4_4, gl.UNSIGNED_SHORT_4_4_4_4);
    mustBeEQ('UNSIGNED_SHORT_5_5_5_1', exports.PixelType.UNSIGNED_SHORT_5_5_5_1, gl.UNSIGNED_SHORT_5_5_5_1);
    mustBeEQ('UNSIGNED_SHORT_5_6_5', exports.PixelType.UNSIGNED_SHORT_5_6_5, gl.UNSIGNED_SHORT_5_6_5);
    // Usage
    mustBeEQ('STREAM_DRAW', exports.Usage.STREAM_DRAW, gl.STREAM_DRAW);
    mustBeEQ('STATIC_DRAW', exports.Usage.STATIC_DRAW, gl.STATIC_DRAW);
    mustBeEQ('DYNAMIC_DRAW', exports.Usage.DYNAMIC_DRAW, gl.DYNAMIC_DRAW);
    return gl;
}

/**
 * Returns the WebGLRenderingContext given a canvas.
 * canvas
 * attributes
 * If the canvas is undefined then an undefined value is returned for the context.
 */
function initWebGL(canvas, attributes) {
    // We'll be hyper-functional. An undefined canvas begets and undefined context.
    // Clients must check their context output or canvas input.
    if (isDefined(canvas)) {
        var context;
        try {
            // Try to grab the standard context. If it fails, fallback to experimental.
            context = (canvas.getContext('webgl', attributes) || canvas.getContext('experimental-webgl', attributes));
        }
        catch (e) {
            // Do nothing.
        }
        if (context) {
            return context;
        }
        else {
            throw new Error("Unable to initialize WebGL. Your browser may not support it.");
        }
    }
    else {
        // An undefined canvas results in an undefined context.
        return void 0;
    }
}

/**
 * Displays details about the WegGL version to the console.
 */
var VersionLogger = (function (_super) {
    __extends(VersionLogger, _super);
    function VersionLogger(contextManager) {
        var _this = _super.call(this) || this;
        _this.contextManager = contextManager;
        _this.setLoggingName("VersionLogger");
        return _this;
    }
    VersionLogger.prototype.destructor = function (levelUp) {
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    VersionLogger.prototype.contextFree = function () {
        // Do nothing.
    };
    VersionLogger.prototype.contextGain = function () {
        var gl = this.contextManager.gl;
        console.log(gl.getParameter(gl.VERSION));
    };
    VersionLogger.prototype.contextLost = function () {
        // Do nothing.
    };
    return VersionLogger;
}(ShareableBase));

// import { mustBeGE } from '../checks/mustBeGE';
// import { mustBeLE } from '../checks/mustBeLE';
/**
 * A wrapper around an HTMLCanvasElement providing access to the WebGLRenderingContext
 * and notifications of context loss and restore. An instance of the Engine will usually
 * be a required parameter for any consumer of WebGL resources.
 *
 *
 *     export const e1 = EIGHT.Geometric3.e1;
 *     export const e2 = EIGHT.Geometric3.e2;
 *     export const e3 = EIGHT.Geometric3.e3;
 *
 *     const engine = new EIGHT.Engine('canvas3D')
 *       .size(500, 500)
 *       .clearColor(0.1, 0.1, 0.1, 1.0)
 *       .enable(EIGHT.Capability.DEPTH_TEST)
 *
 *     const scene = new EIGHT.Scene(engine)
 *
 *     const ambients: EIGHT.Facet[] = []
 *
 *     const camera = new EIGHT.PerspectiveCamera()
 *     camera.eye = e2 + 3 * e3
 *     ambients.push(camera)
 *
 *     const dirLight = new EIGHT.DirectionalLight()
 *     ambients.push(dirLight)
 *
 *     const trackball = new EIGHT.TrackballControls(camera)
 *     trackball.subscribe(engine.canvas)
 *
 *     const box = new EIGHT.Box(engine)
 *     box.color = EIGHT.Color.green
 *     scene.add(box)
 *
 *     const animate = function(timestamp: number) {
 *       engine.clear()
 *
 *       trackball.update()
 *
 *       dirLight.direction = camera.look - camera.eye
 *
 *       box.attitude.rotorFromAxisAngle(e2, timestamp * 0.001)
 *
 *       scene.render(ambients)
 *
 *       requestAnimationFrame(animate)
 *     }
 *
 *     requestAnimationFrame(animate)
 */
var Engine = (function (_super) {
    __extends(Engine, _super);
    /**
     * @param canvas
     * @param attributes Allows the context to be configured.
     * @param doc The document object model that contains the canvas identifier.
     */
    function Engine(canvas, attributes, doc) {
        if (attributes === void 0) { attributes = {}; }
        if (doc === void 0) { doc = window.document; }
        var _this = _super.call(this) || this;
        // Remark: We only hold weak references to users so that the lifetime of resource
        // objects is not affected by the fact that they are listening for gl events.
        // Users should automatically add themselves upon construction and remove upon release.
        _this._users = [];
        /**
         * Actions that are executed when a WebGLRenderingContext is gained.
         */
        _this._commands = new ShareableArray([]);
        /**
         * The cache of Geometry.
         */
        _this.geometries = {};
        /**
         * The cache of Material.
         */
        _this.materials = {};
        _this.setLoggingName('Engine');
        _this._attributes = attributes;
        if (attributes.webglLogging) {
            _this._commands.pushWeakRef(new VersionLogger(_this));
        }
        _this._webGLContextLost = function (event) {
            if (isDefined(_this._gl)) {
                event.preventDefault();
                _this._gl = void 0;
                _this._users.forEach(function (user) {
                    user.contextLost();
                });
            }
        };
        _this._webGLContextRestored = function (event) {
            if (isDefined(_this._gl)) {
                event.preventDefault();
                _this._gl = initWebGL(_this._gl.canvas, attributes);
                _this._users.forEach(function (user) {
                    user.contextGain();
                });
            }
        };
        if (canvas) {
            _this.start(canvas, doc);
        }
        return _this;
    }
    /**
     *
     */
    Engine.prototype.resurrector = function (levelUp) {
        _super.prototype.resurrector.call(this, levelUp + 1);
        this.setLoggingName('Engine');
        this._commands = new ShareableArray([]);
    };
    /**
     *
     */
    Engine.prototype.destructor = function (levelUp) {
        this.stop();
        while (this._users.length > 0) {
            this._users.pop();
        }
        this._commands.release();
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    /**
     *
     */
    Engine.prototype.addContextListener = function (user) {
        mustBeNonNullObject('user', user);
        var index = this._users.indexOf(user);
        if (index < 0) {
            this._users.push(user);
        }
        else {
            console.warn("user already exists for addContextListener");
        }
    };
    Object.defineProperty(Engine.prototype, "canvas", {
        /**
         * The canvas element associated with the WebGLRenderingContext.
         */
        get: function () {
            if (this._gl) {
                return this._gl.canvas;
            }
            else {
                return void 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Engine.prototype, "drawingBufferHeight", {
        get: function () {
            if (this._gl) {
                return this._gl.drawingBufferHeight;
            }
            else {
                return void 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Engine.prototype, "drawingBufferWidth", {
        get: function () {
            if (this._gl) {
                return this._gl.drawingBufferWidth;
            }
            else {
                return void 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Engine.prototype.blendFunc = function (sfactor, dfactor) {
        var gl = this._gl;
        if (gl) {
            gl.blendFunc(sfactor, dfactor);
        }
        return this;
    };
    /**
     * <p>
     * Sets the graphics buffers to values preselected by clearColor, clearDepth or clearStencil.
     * </p>
     */
    Engine.prototype.clear = function (mask) {
        if (mask === void 0) { mask = exports.ClearBufferMask.COLOR_BUFFER_BIT | exports.ClearBufferMask.DEPTH_BUFFER_BIT; }
        var gl = this._gl;
        if (gl) {
            gl.clear(mask);
        }
        return this;
    };
    /**
     * Specifies color values to use by the <code>clear</code> method to clear the color buffer.
     */
    Engine.prototype.clearColor = function (red, green, blue, alpha) {
        this._commands.pushWeakRef(new WebGLClearColor(this, red, green, blue, alpha));
        var gl = this._gl;
        if (gl) {
            gl.clearColor(red, green, blue, alpha);
        }
        return this;
    };
    /**
     * Specifies the clear value for the depth buffer.
     * This specifies what depth value to use when calling the clear() method.
     * The value is clamped between 0 and 1.
     *
     * @param depth Specifies the depth value used when the depth buffer is cleared.
     * The default value is 1.
     */
    Engine.prototype.clearDepth = function (depth) {
        var gl = this._gl;
        if (gl) {
            gl.clearDepth(depth);
        }
        return this;
    };
    /**
     * @param s Specifies the index used when the stencil buffer is cleared.
     * The default value is 0.
     */
    Engine.prototype.clearStencil = function (s) {
        var gl = this._gl;
        if (gl) {
            gl.clearStencil(s);
        }
        return this;
    };
    Engine.prototype.depthFunc = function (func) {
        var gl = this._gl;
        if (gl) {
            gl.depthFunc(func);
        }
        return this;
    };
    Engine.prototype.depthMask = function (flag) {
        var gl = this._gl;
        if (gl) {
            gl.depthMask(flag);
        }
        return this;
    };
    /**
     * Disables the specified WebGL capability.
     */
    Engine.prototype.disable = function (capability) {
        this._commands.pushWeakRef(new WebGLDisable(this, capability));
        if (this._gl) {
            this._gl.disable(capability);
        }
        return this;
    };
    /**
     * Enables the specified WebGL capability.
     */
    Engine.prototype.enable = function (capability) {
        this._commands.pushWeakRef(new WebGLEnable(this, capability));
        if (this._gl) {
            this._gl.enable(capability);
        }
        return this;
    };
    Object.defineProperty(Engine.prototype, "gl", {
        /**
         * The underlying WebGL rendering context.
         */
        get: function () {
            if (this._gl) {
                return this._gl;
            }
            else {
                return void 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     *
     */
    Engine.prototype.readPixels = function (x, y, width, height, format, type, pixels) {
        if (this._gl) {
            this._gl.readPixels(x, y, width, height, format, type, pixels);
        }
    };
    /**
     * @param user
     */
    Engine.prototype.removeContextListener = function (user) {
        mustBeNonNullObject('user', user);
        var index = this._users.indexOf(user);
        if (index >= 0) {
            this._users.splice(index, 1);
        }
    };
    /**
     * A convenience method for setting the width and height properties of the
     * underlying canvas and for setting the viewport to the drawing buffer height and width.
     */
    Engine.prototype.size = function (width, height) {
        this.canvas.width = mustBeNumber('width', width);
        this.canvas.height = mustBeNumber('height', height);
        return this.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    };
    /**
     * The viewport width and height are clamped to a range that is
     * implementation dependent.
     *
     * @returns e.g. Int32Array[16384, 16384]
     */
    Engine.prototype.getMaxViewportDims = function () {
        var gl = this._gl;
        if (gl) {
            return gl.getParameter(gl.MAX_VIEWPORT_DIMS);
        }
        else {
            return void 0;
        }
    };
    /**
     * Returns the current viewport settings.
     *
     * @returns e.g. Int32Array[x, y, width, height]
     */
    Engine.prototype.getViewport = function () {
        var gl = this._gl;
        if (gl) {
            return gl.getParameter(gl.VIEWPORT);
        }
        else {
            return void 0;
        }
    };
    /**
     * Defines what part of the canvas will be used in rendering the drawing buffer.
     *
     * @param x
     * @param y
     * @param width
     * @param height
     */
    Engine.prototype.viewport = function (x, y, width, height) {
        var gl = this._gl;
        if (gl) {
            gl.viewport(x, y, width, height);
        }
        return this;
    };
    /**
     * Initializes the <code>WebGLRenderingContext</code> for the specified <code>HTMLCanvasElement</code>.
     *
     * @param canvas The HTML canvas element or canvas element identifier.
     * @param doc The document object model that contains the canvas identifier.
     */
    Engine.prototype.start = function (canvas, doc) {
        if (doc === void 0) { doc = window.document; }
        if (typeof canvas === 'string') {
            var canvasElement = doc.getElementById(canvas);
            if (canvasElement) {
                return this.start(canvasElement, doc);
            }
            else {
                throw new Error("canvas argument must be a canvas element id or an HTMLCanvasElement.");
            }
        }
        else if (canvas instanceof HTMLCanvasElement) {
            if (isDefined(this._gl)) {
                // We'll just be idempotent and ignore the call because we've already been started.
                // To use the canvas might conflict with one we have dynamically created.
                console.warn(this.getLoggingName() + " Ignoring start() because already started.");
                return this;
            }
            else {
                this._gl = checkEnums(initWebGL(canvas, this._attributes));
                this.emitStartEvent();
                canvas.addEventListener('webglcontextlost', this._webGLContextLost, false);
                canvas.addEventListener('webglcontextrestored', this._webGLContextRestored, false);
            }
            return this;
        }
        else {
            if (isDefined(canvas)) {
                this._gl = checkEnums(canvas);
            }
            return this;
        }
    };
    /**
     *
     */
    Engine.prototype.stop = function () {
        if (isDefined(this._gl)) {
            this._gl.canvas.removeEventListener('webglcontextrestored', this._webGLContextRestored, false);
            this._gl.canvas.removeEventListener('webglcontextlost', this._webGLContextLost, false);
            if (this._gl) {
                this.emitStopEvent();
                this._gl = void 0;
            }
        }
        return this;
    };
    Engine.prototype.emitStartEvent = function () {
        var _this = this;
        this._users.forEach(function (user) {
            _this.emitContextGain(user);
        });
        this._commands.forEach(function (command) {
            _this.emitContextGain(command);
        });
    };
    Engine.prototype.emitContextGain = function (consumer) {
        if (this._gl.isContextLost()) {
            consumer.contextLost();
        }
        else {
            consumer.contextGain();
        }
    };
    Engine.prototype.emitStopEvent = function () {
        var _this = this;
        this._users.forEach(function (user) {
            _this.emitContextFree(user);
        });
        this._commands.forEach(function (command) {
            _this.emitContextFree(command);
        });
    };
    Engine.prototype.emitContextFree = function (consumer) {
        if (this._gl.isContextLost()) {
            consumer.contextLost();
        }
        else {
            consumer.contextFree();
        }
    };
    /**
     * @param consumer
     */
    Engine.prototype.synchronize = function (consumer) {
        if (this._gl) {
            this.emitContextGain(consumer);
        }
        else {
            // FIXME: Broken symmetry?
        }
        return this;
    };
    /**
     *
     */
    Engine.prototype.getCacheGeometry = function (geometryKey) {
        mustBeNonNullObject('geometryKey', geometryKey);
        mustBeString('geometryKey.kind', geometryKey.kind);
        var key = JSON.stringify(geometryKey);
        var geometry = this.geometries[key];
        if (geometry && geometry.addRef) {
            geometry.addRef();
        }
        return geometry;
    };
    /**
     *
     */
    Engine.prototype.putCacheGeometry = function (geometryKey, geometry) {
        mustBeNonNullObject('geometryKey', geometryKey);
        mustBeNonNullObject('geometry', geometry);
        mustBeString('geometryKey.kind', geometryKey.kind);
        var key = JSON.stringify(geometryKey);
        this.geometries[key] = geometry;
    };
    /**
     *
     */
    Engine.prototype.getCacheMaterial = function (materialKey) {
        mustBeNonNullObject('materialKey', materialKey);
        mustBeString('materialKey.kind', materialKey.kind);
        var key = JSON.stringify(materialKey);
        var material = this.materials[key];
        if (material && material.addRef) {
            material.addRef();
        }
        return material;
    };
    /**
     *
     */
    Engine.prototype.putCacheMaterial = function (materialKey, material) {
        mustBeNonNullObject('materialKey', materialKey);
        mustBeNonNullObject('material', material);
        mustBeString('materialKey.kind', materialKey.kind);
        var key = JSON.stringify(materialKey);
        this.materials[key] = material;
    };
    return Engine;
}(ShareableBase));

function makeWebGLProgram(ctx, vertexShaderSrc, fragmentShaderSrc, attribs) {
    // create our shaders
    var vs = makeWebGLShader(ctx, vertexShaderSrc, ctx.VERTEX_SHADER);
    var fs = makeWebGLShader(ctx, fragmentShaderSrc, ctx.FRAGMENT_SHADER);
    // Create the program object.
    var program = ctx.createProgram();
    // Attach our two shaders to the program.
    ctx.attachShader(program, vs);
    ctx.attachShader(program, fs);
    // Bind attributes allows us to specify the index that an attribute should be bound to.
    for (var index = 0; index < attribs.length; ++index) {
        ctx.bindAttribLocation(program, index, attribs[index]);
    }
    // Link the program.
    ctx.linkProgram(program);
    // Check the link status
    var linked = ctx.getProgramParameter(program, ctx.LINK_STATUS);
    if (linked || ctx.isContextLost()) {
        return program;
    }
    else {
        var message = ctx.getProgramInfoLog(program);
        ctx.detachShader(program, vs);
        ctx.deleteShader(vs);
        ctx.detachShader(program, fs);
        ctx.deleteShader(fs);
        ctx.deleteProgram(program);
        throw new Error("Error linking program: " + message);
    }
}

/**
 *
 */
var ShaderMaterial = (function (_super) {
    __extends(ShaderMaterial, _super);
    /**
     * @param vertexShaderSrc The vertex shader source code.
     * @param fragmentShaderSrc The fragment shader source code.
     * @param attribs The attribute ordering.
     * @param engine The <code>Engine</code> to subscribe to or <code>null</code> for deferred subscription.
     */
    function ShaderMaterial(vertexShaderSrc, fragmentShaderSrc, attribs, contextManager, levelUp) {
        if (levelUp === void 0) { levelUp = 0; }
        var _this = _super.call(this, contextManager) || this;
        /**
         *
         */
        _this._attributesByName = {};
        _this._attributesByIndex = [];
        /**
         *
         */
        _this._uniforms = {};
        _this.setLoggingName('ShaderMaterial');
        if (isDefined(vertexShaderSrc) && !isNull(vertexShaderSrc)) {
            _this._vertexShaderSrc = mustBeString('vertexShaderSrc', vertexShaderSrc);
        }
        if (isDefined(fragmentShaderSrc) && !isNull(fragmentShaderSrc)) {
            _this._fragmentShaderSrc = mustBeString('fragmentShaderSrc', fragmentShaderSrc);
        }
        _this._attribs = mustBeArray('attribs', attribs);
        if (levelUp === 0) {
            _this.synchUp();
        }
        return _this;
    }
    /**
     *
     */
    ShaderMaterial.prototype.resurrector = function (levelUp) {
        _super.prototype.resurrector.call(this, levelUp + 1);
        this.setLoggingName('ShaderMaterial');
        if (levelUp === 0) {
            this.synchUp();
        }
    };
    /**
     *
     */
    ShaderMaterial.prototype.destructor = function (levelUp) {
        if (levelUp === 0) {
            this.cleanUp();
        }
        mustBeUndefined(this.getLoggingName(), this._program);
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    /**
     *
     */
    ShaderMaterial.prototype.contextGain = function () {
        var gl = this.contextManager.gl;
        if (!this._program && isString(this._vertexShaderSrc) && isString(this._fragmentShaderSrc)) {
            this._program = makeWebGLProgram(gl, this._vertexShaderSrc, this._fragmentShaderSrc, this._attribs);
            this._attributesByName = {};
            this._attributesByIndex = [];
            this._uniforms = {};
            var aLen = gl.getProgramParameter(this._program, gl.ACTIVE_ATTRIBUTES);
            for (var a = 0; a < aLen; a++) {
                var attribInfo = gl.getActiveAttrib(this._program, a);
                var attrib = new Attrib(this.contextManager, attribInfo);
                this._attributesByName[attribInfo.name] = attrib;
                this._attributesByIndex.push(attrib);
            }
            var uLen = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);
            for (var u = 0; u < uLen; u++) {
                var uniformInfo = gl.getActiveUniform(this._program, u);
                this._uniforms[uniformInfo.name] = new Uniform(uniformInfo);
            }
            // TODO: This would be more efficient over the array.
            for (var aName in this._attributesByName) {
                if (this._attributesByName.hasOwnProperty(aName)) {
                    this._attributesByName[aName].contextGain(gl, this._program);
                }
            }
            for (var uName in this._uniforms) {
                if (this._uniforms.hasOwnProperty(uName)) {
                    this._uniforms[uName].contextGain(gl, this._program);
                }
            }
        }
        _super.prototype.contextGain.call(this);
    };
    /**
     *
     */
    ShaderMaterial.prototype.contextLost = function () {
        this._program = void 0;
        for (var aName in this._attributesByName) {
            // TODO: This would be better over the array.
            if (this._attributesByName.hasOwnProperty(aName)) {
                this._attributesByName[aName].contextLost();
            }
        }
        for (var uName in this._uniforms) {
            if (this._uniforms.hasOwnProperty(uName)) {
                this._uniforms[uName].contextLost();
            }
        }
        _super.prototype.contextLost.call(this);
    };
    /**
     *
     */
    ShaderMaterial.prototype.contextFree = function () {
        if (this._program) {
            var gl = this.contextManager.gl;
            if (gl) {
                if (!gl.isContextLost()) {
                    gl.deleteProgram(this._program);
                }
                else {
                    // WebGL has lost the context, effectively cleaning up everything.
                }
            }
            else {
                console.warn("memory leak: WebGLProgram has not been deleted because WebGLRenderingContext is not available anymore.");
            }
            this._program = void 0;
        }
        // TODO
        for (var aName in this._attributesByName) {
            if (this._attributesByName.hasOwnProperty(aName)) {
                this._attributesByName[aName].contextFree();
            }
        }
        for (var uName in this._uniforms) {
            if (this._uniforms.hasOwnProperty(uName)) {
                this._uniforms[uName].contextFree();
            }
        }
        _super.prototype.contextFree.call(this);
    };
    Object.defineProperty(ShaderMaterial.prototype, "vertexShaderSrc", {
        /**
         *
         */
        get: function () {
            return this._vertexShaderSrc;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShaderMaterial.prototype, "fragmentShaderSrc", {
        /**
         *
         */
        get: function () {
            return this._fragmentShaderSrc;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShaderMaterial.prototype, "attributeNames", {
        /**
         *
         */
        get: function () {
            // I wonder if it might be better to use the array and preserve order. 
            var attributes = this._attributesByName;
            if (attributes) {
                return Object.keys(attributes);
            }
            else {
                return void 0;
            }
        },
        set: function (unused) {
            throw new Error(readOnly('attributeNames').message);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Convenience method for dereferencing the name to an attribute location, followed by enabling the attribute.
     */
    ShaderMaterial.prototype.enableAttrib = function (indexOrName) {
        if (typeof indexOrName === 'number') {
            if (this.gl) {
                this.gl.enableVertexAttribArray(indexOrName);
            }
        }
        else if (typeof indexOrName === 'string') {
            var attribLoc = this._attributesByName[indexOrName];
            if (attribLoc) {
                attribLoc.enable();
            }
        }
        else {
            throw new TypeError("indexOrName must have type number or string.");
        }
    };
    /**
     *
     */
    ShaderMaterial.prototype.enableAttribs = function () {
        var attribLocations = this._attributesByName;
        if (attribLocations) {
            // TODO: Store loactions as a plain array in order to avoid temporaries (aNames)
            var aNames = Object.keys(attribLocations);
            for (var i = 0, iLength = aNames.length; i < iLength; i++) {
                attribLocations[aNames[i]].enable();
            }
        }
    };
    /**
     *
     */
    ShaderMaterial.prototype.disableAttrib = function (indexOrName) {
        if (typeof indexOrName === 'number') {
            if (this.gl) {
                this.gl.disableVertexAttribArray(indexOrName);
            }
        }
        else if (typeof indexOrName === 'string') {
            var attribLoc = this._attributesByName[indexOrName];
            if (attribLoc) {
                attribLoc.disable();
            }
        }
        else {
            throw new TypeError("indexOrName must have type number or string.");
        }
    };
    /**
     *
     */
    ShaderMaterial.prototype.disableAttribs = function () {
        var attribLocations = this._attributesByName;
        if (attribLocations) {
            // TODO: Store loactions as a plain array in order to avoid temporaries (aNames)
            var aNames = Object.keys(attribLocations);
            for (var i = 0, iLength = aNames.length; i < iLength; i++) {
                attribLocations[aNames[i]].disable();
            }
        }
    };
    ShaderMaterial.prototype.attrib = function (name, value, size, normalized, stride, offset) {
        if (normalized === void 0) { normalized = false; }
        if (stride === void 0) { stride = 0; }
        if (offset === void 0) { offset = 0; }
        var attrib = this.getAttrib(name);
        if (attrib) {
            value.bind();
            attrib.enable();
            attrib.config(size, exports.DataType.FLOAT, normalized, stride, offset);
        }
        return this;
    };
    ShaderMaterial.prototype.getAttrib = function (indexOrName) {
        if (typeof indexOrName === 'number') {
            // FIXME
            return this._attributesByIndex[indexOrName];
        }
        else if (typeof indexOrName === 'string') {
            return this._attributesByName[indexOrName];
        }
        else {
            throw new TypeError("indexOrName must be a number or a string");
        }
    };
    /**
     * Returns the location (index) of the attribute with the specified name.
     * Returns <code>-1</code> if the name does not correspond to an attribute.
     */
    ShaderMaterial.prototype.getAttribLocation = function (name) {
        var attribLoc = this._attributesByName[name];
        if (attribLoc) {
            return attribLoc.index;
        }
        else {
            return -1;
        }
    };
    /**
     * Returns a <code>Uniform</code> object corresponding to the <code>uniform</code>
     * parameter of the same name in the shader code. If a uniform parameter of the specified name
     * does not exist, this method returns undefined (void 0).
     */
    ShaderMaterial.prototype.getUniform = function (name) {
        var uniforms = this._uniforms;
        if (uniforms[name]) {
            return uniforms[name];
        }
        else {
            return void 0;
        }
    };
    /**
     * <p>
     * Determines whether a <code>uniform</code> with the specified <code>name</code> exists in the <code>WebGLProgram</code>.
     * </p>
     */
    ShaderMaterial.prototype.hasUniform = function (name) {
        mustBeString('name', name);
        return isDefined(this._uniforms[name]);
    };
    ShaderMaterial.prototype.activeTexture = function (texture) {
        if (this.gl) {
            this.gl.activeTexture(texture);
        }
    };
    ShaderMaterial.prototype.uniform1i = function (name, x) {
        var uniformLoc = this.getUniform(name);
        if (uniformLoc) {
            uniformLoc.uniform1i(x);
        }
    };
    ShaderMaterial.prototype.uniform1f = function (name, x) {
        var uniformLoc = this.getUniform(name);
        if (uniformLoc) {
            uniformLoc.uniform1f(x);
        }
    };
    ShaderMaterial.prototype.uniform2f = function (name, x, y) {
        var uniformLoc = this._uniforms[name];
        if (uniformLoc) {
            uniformLoc.uniform2f(x, y);
        }
    };
    ShaderMaterial.prototype.uniform3f = function (name, x, y, z) {
        var uniformLoc = this._uniforms[name];
        if (uniformLoc) {
            uniformLoc.uniform3f(x, y, z);
        }
    };
    ShaderMaterial.prototype.uniform4f = function (name, x, y, z, w) {
        var uniformLoc = this._uniforms[name];
        if (uniformLoc) {
            uniformLoc.uniform4f(x, y, z, w);
        }
    };
    ShaderMaterial.prototype.uniform = function (name, value) {
        var uniformLoc = this._uniforms[name];
        if (uniformLoc) {
            if (typeof value === 'number') {
                uniformLoc.uniform1f(value);
            }
            else if (value) {
                switch (value.length) {
                    case 1: {
                        uniformLoc.uniform1f(value[0]);
                        break;
                    }
                    case 2: {
                        uniformLoc.uniform2f(value[0], value[1]);
                        break;
                    }
                    case 3: {
                        uniformLoc.uniform3f(value[0], value[1], value[2]);
                        break;
                    }
                    case 4: {
                        uniformLoc.uniform4f(value[0], value[1], value[2], value[3]);
                        break;
                    }
                }
            }
        }
        return this;
    };
    /**
     *
     */
    ShaderMaterial.prototype.use = function () {
        var gl = this.gl;
        if (gl) {
            gl.useProgram(this._program);
        }
        else {
            console.warn(this.getLoggingName() + ".use() missing WebGL rendering context.");
        }
        return this;
    };
    ShaderMaterial.prototype.matrix2fv = function (name, matrix, transpose) {
        if (transpose === void 0) { transpose = false; }
        var uniformLoc = this._uniforms[name];
        if (uniformLoc) {
            uniformLoc.matrix2fv(transpose, matrix);
        }
        return this;
    };
    ShaderMaterial.prototype.matrix3fv = function (name, matrix, transpose) {
        if (transpose === void 0) { transpose = false; }
        var uniformLoc = this._uniforms[name];
        if (uniformLoc) {
            uniformLoc.matrix3fv(transpose, matrix);
        }
        return this;
    };
    ShaderMaterial.prototype.matrix4fv = function (name, matrix, transpose) {
        if (transpose === void 0) { transpose = false; }
        var uniformLoc = this._uniforms[name];
        if (uniformLoc) {
            uniformLoc.matrix4fv(transpose, matrix);
        }
        return this;
    };
    ShaderMaterial.prototype.vector2fv = function (name, data) {
        var uniformLoc = this._uniforms[name];
        if (uniformLoc) {
            uniformLoc.uniform2fv(data);
        }
    };
    ShaderMaterial.prototype.vector3fv = function (name, data) {
        var uniformLoc = this._uniforms[name];
        if (uniformLoc) {
            uniformLoc.uniform3fv(data);
        }
    };
    ShaderMaterial.prototype.vector4fv = function (name, data) {
        var uniformLoc = this._uniforms[name];
        if (uniformLoc) {
            uniformLoc.uniform4fv(data);
        }
    };
    /**
     * @param mode Specifies the type of the primitive being rendered.
     * @param first Specifies the starting index in the array of vector points.
     * @param count The number of points to be rendered.
     */
    ShaderMaterial.prototype.drawArrays = function (mode, first, count) {
        var gl = this.gl;
        if (gl) {
            gl.drawArrays(mode, first, count);
        }
        return this;
    };
    /**
     * @param mode Specifies the type of the primitive being rendered.
     * @param count The number of elements to be rendered.
     * @param type The type of the values in the element array buffer.
     * @param offset Specifies an offset into the element array buffer.
     */
    ShaderMaterial.prototype.drawElements = function (mode, count, type, offset) {
        var gl = this.gl;
        if (gl) {
            gl.drawElements(mode, count, type, offset);
        }
        return this;
    };
    return ShaderMaterial;
}(ShareableContextConsumer));

function getHTMLElementById(elementId, dom) {
    var element = dom.getElementById(mustBeString('elementId', elementId));
    if (element) {
        return element;
    }
    else {
        throw new Error("'" + elementId + "' is not a valid element identifier.");
    }
}
function vertexShaderSrc(vsId, dom) {
    mustBeString('vsId', vsId);
    mustBeObject('dom', dom);
    return getHTMLElementById(vsId, dom).textContent;
}
function fragmentShaderSrc(fsId, dom) {
    mustBeString('fsId', fsId);
    mustBeObject('dom', dom);
    return getHTMLElementById(fsId, dom).textContent;
}
function assign(elementId, dom, result) {
    var htmlElement = dom.getElementById(elementId);
    if (htmlElement instanceof HTMLScriptElement) {
        var script = htmlElement;
        if (isString(script.type)) {
            if (script.type.indexOf('vertex') >= 0) {
                result[0] = elementId;
            }
            else if (script.type.indexOf('fragment') >= 0) {
                result[1] = elementId;
            }
            else {
                // Do nothing
            }
        }
        if (isString(script.textContent)) {
            if (script.textContent.indexOf('gl_Position') >= 0) {
                result[0] = elementId;
            }
            else if (script.textContent.indexOf('gl_FragColor') >= 0) {
                result[1] = elementId;
            }
            else {
                // Do nothing
            }
        }
    }
}
function detectShaderType(scriptIds, dom) {
    mustBeArray('scriptIds', scriptIds);
    mustSatisfy('scriptIds', scriptIds.length === 2, function () { return 'have two script element identifiers.'; });
    var result = [scriptIds[0], scriptIds[1]];
    assign(scriptIds[0], dom, result);
    assign(scriptIds[1], dom, result);
    return result;
}
/**
 * A shareable WebGL program based upon shader source code in HTML script elements.
 *
 * This class provides a convenient way of creating custom GLSL programs.
 * The scripts are lazily loaded so that the constructor may be called before
 * the DOM has finished loading.
 */
var HTMLScriptsMaterial = (function (_super) {
    __extends(HTMLScriptsMaterial, _super);
    /**
     * @param contextManager
     * @param scriptIds The element identifiers for the vertex and fragment shader respectively.
     * @param attribs An array of strings containing the order of attributes.
     * @param dom The document object model that owns the script elements.
     * @param levelUp
     */
    function HTMLScriptsMaterial(contextManager, scriptIds, attribs, dom, levelUp) {
        if (attribs === void 0) { attribs = []; }
        if (dom === void 0) { dom = window.document; }
        if (levelUp === void 0) { levelUp = 0; }
        var _this = _super.call(this, vertexShaderSrc(detectShaderType(scriptIds, dom)[0], dom), fragmentShaderSrc(detectShaderType(scriptIds, dom)[1], dom), attribs, contextManager, levelUp + 1) || this;
        _this.setLoggingName('HTMLScriptsMaterial');
        if (levelUp === 0) {
            _this.synchUp();
        }
        return _this;
    }
    /**
     *
     */
    HTMLScriptsMaterial.prototype.resurrector = function (levelUp) {
        _super.prototype.resurrector.call(this, levelUp + 1);
        this.setLoggingName('HTMLScriptsMaterial');
        if (levelUp === 0) {
            this.synchUp();
        }
    };
    /**
     *
     */
    HTMLScriptsMaterial.prototype.destructor = function (levelUp) {
        if (levelUp === 0) {
            this.cleanUp();
        }
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    return HTMLScriptsMaterial;
}(ShaderMaterial));

var NumberShareableMap = (function (_super) {
    __extends(NumberShareableMap, _super);
    function NumberShareableMap() {
        var _this = _super.call(this) || this;
        _this._elements = {};
        _this.setLoggingName('NumberShareableMap');
        return _this;
    }
    NumberShareableMap.prototype.destructor = function (levelUp) {
        this.forEach(function (key, value) {
            if (value) {
                value.release();
            }
        });
        this._elements = void 0;
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    NumberShareableMap.prototype.exists = function (key) {
        var element = this._elements[key];
        return element ? true : false;
    };
    NumberShareableMap.prototype.get = function (key) {
        var element = this.getWeakRef(key);
        if (element) {
            element.addRef();
        }
        return element;
    };
    NumberShareableMap.prototype.getWeakRef = function (index) {
        return this._elements[index];
    };
    NumberShareableMap.prototype.put = function (key, value) {
        if (value) {
            value.addRef();
        }
        this.putWeakRef(key, value);
    };
    NumberShareableMap.prototype.putWeakRef = function (key, value) {
        var elements = this._elements;
        var existing = elements[key];
        if (existing) {
            existing.release();
        }
        elements[key] = value;
    };
    NumberShareableMap.prototype.forEach = function (callback) {
        var keys = this.keys;
        for (var i = 0, iLength = keys.length; i < iLength; i++) {
            var key = keys[i];
            var value = this._elements[key];
            callback(key, value);
        }
    };
    Object.defineProperty(NumberShareableMap.prototype, "keys", {
        get: function () {
            // FIXME: cache? Maybe, clients may use this to iterate. forEach is too slow.
            return Object.keys(this._elements).map(function (keyString) { return parseFloat(keyString); });
        },
        enumerable: true,
        configurable: true
    });
    NumberShareableMap.prototype.remove = function (key) {
        // Strong or Weak doesn't matter because the value is `undefined`.
        this.put(key, void 0);
        delete this._elements[key];
    };
    return NumberShareableMap;
}(ShareableBase));

/**
 *
 */
var StringShareableMap = (function (_super) {
    __extends(StringShareableMap, _super);
    /**
     * A map of string to V extends Shareable.
     */
    function StringShareableMap() {
        var _this = _super.call(this) || this;
        _this.elements = {};
        _this.setLoggingName('StringShareableMap');
        return _this;
    }
    StringShareableMap.prototype.destructor = function (levelUp) {
        var _this = this;
        this.forEach(function (key) {
            _this.putWeakRef(key, void 0);
        });
        _super.prototype.destructor.call(this, levelUp + 1);
    };
    /**
     * Determines whether the key exists in the map with a defined value.
     */
    StringShareableMap.prototype.exists = function (key) {
        var element = this.elements[key];
        return element ? true : false;
    };
    StringShareableMap.prototype.get = function (key) {
        var element = this.elements[key];
        if (element) {
            if (element.addRef) {
                element.addRef();
            }
            return element;
        }
        else {
            return void 0;
        }
    };
    StringShareableMap.prototype.getWeakRef = function (key) {
        return this.elements[key];
    };
    StringShareableMap.prototype.put = function (key, value) {
        if (value && value.addRef) {
            value.addRef();
        }
        this.putWeakRef(key, value);
    };
    StringShareableMap.prototype.putWeakRef = function (key, value) {
        var elements = this.elements;
        var existing = elements[key];
        if (existing) {
            if (existing.release) {
                existing.release();
            }
        }
        elements[key] = value;
    };
    StringShareableMap.prototype.forEach = function (callback) {
        var keys = this.keys;
        for (var i = 0, iLength = keys.length; i < iLength; i++) {
            var key = keys[i];
            callback(key, this.elements[key]);
        }
    };
    Object.defineProperty(StringShareableMap.prototype, "keys", {
        get: function () {
            return Object.keys(this.elements);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StringShareableMap.prototype, "values", {
        get: function () {
            var values = [];
            var keys = this.keys;
            for (var i = 0, iLength = keys.length; i < iLength; i++) {
                var key = keys[i];
                values.push(this.elements[key]);
            }
            return values;
        },
        enumerable: true,
        configurable: true
    });
    StringShareableMap.prototype.remove = function (key) {
        var value = this.elements[key];
        delete this.elements[key];
        return value;
    };
    return StringShareableMap;
}(ShareableBase));

function isFunction(x) {
    return (typeof x === 'function');
}

function beFunction() {
    return "be a function";
}
function mustBeFunction(name, value, contextBuilder) {
    mustSatisfy(name, isFunction(value), beFunction, contextBuilder);
    return value;
}

/**
 * A utility for loading Texture resources from a URL.
 *
 *     const loader = new EIGHT.TextureLoader(engine)
 *     loader.loadImageTexture('img/textures/solar-system/2k_earth_daymap.jpg', function(texture) {
 *       texture.minFilter = EIGHT.TextureMinFilter.NEAREST;
 *       const geometry = new EIGHT.SphereGeometry(engine, {azimuthSegments: 64, elevationSegments: 32})
 *       const material = new EIGHT.HTMLScriptsMaterial(engine, ['vs', 'fs'])
 *       sphere = new EIGHT.Mesh(geometry, material, engine)
 *       geometry.release()
 *       material.release()
 *       sphere.texture = texture
 *       texture.release()
 *       scene.add(sphere)
 *     })
 */
var TextureLoader = (function () {
    /**
     * @param contextManager
     */
    function TextureLoader(contextManager) {
        this.contextManager = contextManager;
        mustBeNonNullObject('contextManager', contextManager);
    }
    /**
     * @param url The Uniform Resource Locator of the image.
     * @param onLoad
     * @param onError
     */
    TextureLoader.prototype.loadImageTexture = function (url, onLoad, onError, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        mustBeString('url', url);
        mustBeFunction('onLoad', onLoad);
        var image = new Image();
        image.onload = function () {
            var texture = new ImageTexture(image, exports.TextureTarget.TEXTURE_2D, _this.contextManager);
            texture.bind();
            texture.upload();
            texture.unbind();
            onLoad(texture);
        };
        image.onerror = function () {
            if (isFunction(onError)) {
                onError();
            }
        };
        // How to issue a CORS request for an image coming from another domain.
        // The image is fetched from the server without any credentials, i.e., cookies.
        if (isDefined(options.crossOrigin)) {
            image.crossOrigin = mustBeString('crossOrigin', options.crossOrigin);
        }
        image.src = url;
    };
    return TextureLoader;
}());

// commands

exports.WebGLBlendFunc = WebGLBlendFunc;
exports.WebGLClearColor = WebGLClearColor;
exports.WebGLDisable = WebGLDisable;
exports.WebGLEnable = WebGLEnable;
exports.Attrib = Attrib;
exports.GeometryArrays = GeometryArrays;
exports.GeometryElements = GeometryElements;
exports.GraphicsProgramSymbols = GraphicsProgramSymbols;
exports.ImageTexture = ImageTexture;
exports.Scene = Scene;
exports.Shader = Shader;
exports.Texture = Texture;
exports.Uniform = Uniform;
exports.Engine = Engine;
exports.VertexBuffer = VertexBuffer;
exports.IndexBuffer = IndexBuffer;
exports.vertexArraysFromPrimitive = vertexArraysFromPrimitive;
exports.HTMLScriptsMaterial = HTMLScriptsMaterial;
exports.ShaderMaterial = ShaderMaterial;
exports.ShareableArray = ShareableArray;
exports.NumberShareableMap = NumberShareableMap;
exports.refChange = refChange;
exports.ShareableBase = ShareableBase;
exports.StringShareableMap = StringShareableMap;
exports.TextureLoader = TextureLoader;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
