// Type definitions for webgl-core 1.0.0
// Project: https://github.com/geometryzen/webgl-core
// Definitions by: David Geo Holmes david.geo.holmes@gmail.com https://www.stemcstudio.com
//
// This file was created manually in order to support the webgl-core library.
//

/**
 * The draw mode determines how the WebGL pipeline consumes and processes the vertices.
 */
export enum BeginMode {
    /**
     * Each vertex is drawn as an isolated pixel or group of pixes based upon gl_PointSize.
     */
    POINTS,
    /**
     * Vertices are consumed in pairs creating connected line segments.
     */
    LINES,
    /**
     * Connects each vertex to the next by a line segment.
     */
    LINE_STRIP,
    /**
     * Vertices are consumed in groups of three to form triangles.
     */
    TRIANGLES,
    /**
     * After the first triangle, each subsequent point make a new triangle
     * using the previous two points.
     */
    TRIANGLE_STRIP
}

export enum BlendingFactorDest {
    ZERO = 0,
    ONE = 1,
    SRC_COLOR = 0x0300,
    ONE_MINUS_SRC_COLOR = 0x0301,
    SRC_ALPHA = 0x0302,
    ONE_MINUS_SRC_ALPHA = 0x0303,
    DST_ALPHA = 0x0304,
    ONE_MINUS_DST_ALPHA = 0x0305
}

export enum BlendingFactorSrc {
    ZERO = 0,
    ONE = 1,
    DST_COLOR = 0x0306,
    ONE_MINUS_DST_COLOR = 0x0307,
    SRC_ALPHA_SATURATE = 0x0308,
    SRC_ALPHA = 0x0302,
    ONE_MINUS_SRC_ALPHA = 0x0303,
    DST_ALPHA = 0x0304,
    ONE_MINUS_DST_ALPHA = 0x0305
}

/**
 * A capability that may be enabled or disabled for a WebGLRenderingContext.
 */
export enum Capability {

    /**
     * Let polygons be culled.
     */
    CULL_FACE,

    /**
     * Blend computed fragment color values with color buffer values.
     */
    BLEND,
    DITHER,
    STENCIL_TEST,
    /**
     * Enable updates of the depth buffer.
     */
    DEPTH_TEST,

    /**
     * Abandon fragments outside a scissor rectangle.
     */
    SCISSOR_TEST,

    /**
     * Add an offset to the depth values of a polygon's fragments.
     */
    POLYGON_OFFSET_FILL,
    SAMPLE_ALPHA_TO_COVERAGE,
    SAMPLE_COVERAGE
}

export enum ClearBufferMask {
    DEPTH_BUFFER_BIT,
    STENCIL_BUFFER_BIT,
    COLOR_BUFFER_BIT
}

export enum DataType {
    BYTE,
    UNSIGNED_BYTE,
    SHORT,
    UNSIGNED_SHORT,
    INT,
    UNSIGNED_INT,
    FLOAT
}

/**
 * An enumeration specifying the depth comparison function, which sets the conditions
 * under which the pixel will be drawn. The default value is LESS.
 */
export enum DepthFunction {

    /**
     * never pass
     */
    NEVER = 0x0200,

    /**
     * pass if the incoming value is less than the depth buffer value
     */
    LESS = 0x0201,

    /**
     * pass if the incoming value equals the the depth buffer value
     */
    EQUAL = 0x0202,

    /**
     * pass if the incoming value is less than or equal to the depth buffer value
     */
    LEQUAL = 0x0203,

    /**
     * pass if the incoming value is greater than the depth buffer value
     */
    GREATER = 0x0204,

    /**
     * pass if the incoming value is not equal to the depth buffer value
     */
    NOTEQUAL = 0x0205,

    /**
     * pass if the incoming value is greater than or equal to the depth buffer value
     */
    GEQUAL = 0x0206,

    /**
     * always pass
     */
    ALWAYS = 0x0207
}

export enum PixelFormat {
    DEPTH_COMPONENT = 0x1902,
    ALPHA = 0x1906,
    RGB = 0x1907,
    RGBA = 0x1908,
    LUMINANCE = 0x1909,
    LUMINANCE_ALPHA = 0x190A
}

export enum PixelType {
    UNSIGNED_BYTE = 0x1401,
    UNSIGNED_SHORT_4_4_4_4 = 0x8033,
    UNSIGNED_SHORT_5_5_5_1 = 0x8034,
    UNSIGNED_SHORT_5_6_5 = 0x8363
}

export enum TextureMagFilter {
    NEAREST = 0x2600,
    LINEAR = 0x2601
}

export enum TextureMinFilter {
    NEAREST = 0x2600,
    LINEAR = 0x2601,
    NEAREST_MIPMAP_NEAREST = 0x2700,
    LINEAR_MIPMAP_NEAREST = 0x2701,
    NEAREST_MIPMAP_LINEAR = 0x2702,
    LINEAR_MIPMAP_LINEAR = 0x2703
}

export enum TextureTarget {
    TEXTURE_2D = 0x0DE1,
    TEXTURE = 0x1702
}

export enum TextureWrapMode {
    REPEAT = 0x2901,
    CLAMP_TO_EDGE = 0x812F,
    MIRRORED_REPEAT = 0x8370
}

export enum Usage {
    /**
     * Contents of the buffer are likely to not be used often.
     * Contents are written to the buffer, but not read.
     */
    STREAM_DRAW = 0x88E0,
    /**
     * Contents of the buffer are likely to be used often and not change often.
     * Contents are written to the buffer, but not read.
     */
    STATIC_DRAW = 0x88E4,
    /**
     * Contents of the buffer are likely to be used often and change often.
     * Contents are written to the buffer, but not read.
     */
    DYNAMIC_DRAW = 0x88E8
}

/**
 * Enables clients of Shareable instances to declare their references.
 */
export interface Shareable {

    /**
     * Notifies this instance that something is referencing it.
     */
    addRef?(): number;

    /**
     * Notifies this instance that something is dereferencing it.
     */
    release?(): number;
}

/**
 * Convenience base class for classes requiring reference counting.
 */
export class ShareableBase implements Shareable {
    /**
     *
     */
    constructor();
    /**
     * Notifies this instance that something is referencing it.
     */
    addRef(): number;
    /**
     *
     */
    protected destructor(levelUp: number): void;
    /**
     *
     */
    getLoggingName(): string;
    /**
     *
     */
    isZombie(): boolean;
    /**
     * Notifies this instance that something is dereferencing it.
     */
    release(): number;
    /**
     *
     */
    protected resurrector(levelUp: number): void;
    /**
     *
     */
    protected setLoggingName(name: string): void;
}

export class ShareableArray<T extends Shareable> extends ShareableBase {
    length: number;
    /**
     * Collection class for maintaining an array of types derived from Shareable.
     * Provides a safer way to maintain reference counts than a native array.
     */
    constructor(elements: T[]);
    forEach(callback: (value: T, index: number) => void): void;
    get(index: number): T;
    /**
     * Gets the element at the specified index without incrementing the reference count.
     * Use this method when you don't intend to hold onto the returned value.
     */
    getWeakRef(index: number): T;
    indexOf(searchElement: T, fromIndex?: number): number;
    pop(): T;
    push(element: T): number;
    /**
     * Pushes an element onto the tail of the list without incrementing the element reference count.
     */
    pushWeakRef(element: T): number;
    shift(): T;
    slice(begin?: number, end?: number): ShareableArray<T>;
    splice(index: number, deleteCount: number): ShareableArray<T>;
}

export class NumberShareableMap<V extends Shareable> extends ShareableBase {
    keys: number[];
    constructor()
    exists(key: number): boolean;
    get(key: number): V;
    getWeakRef(key: number): V;
    put(key: number, value: V): void;
    putWeakRef(key: number, value: V): void;
    forEach(callback: (key: number, value: V) => void): void;
    remove(key: number): void;
}

export class StringShareableMap<V extends Shareable> extends ShareableBase {
    keys: string[];
    constructor()
    exists(key: string): boolean;
    forEach(callback: (key: string, value: V) => void): void;
    get(key: string): V;
    getWeakref(key: string): V;
    put(key: string, value: V): void;
    putWeakRef(key: string, value: V): void;
    remove(key: string): void;
}

/**
 * 
 */
export interface EngineAttributes extends WebGLContextAttributes {
    /**
     * Determines whether the Engine logs the version of WebGL to the console.
     */
    webglLogging?: boolean;
}

/**
 * A wrapper around an HTMLCanvasElement that provides WebGLRenderingContext initialization
 * and context lost management. An instance of this class is provided to objects created
 * WebGL resources.
 */
export class Engine extends ShareableBase {

    /**
     * The canvas containing associated with the underlying WebGLRenderingContext.
     */
    canvas: HTMLCanvasElement;

    /**
     * 
     */
    drawingBufferHeight: number;

    /**
     * 
     */
    drawingBufferWidth: number;

    /**
     * The underlying WebGLRenderingContext.
     */
    gl: WebGLRenderingContext;

    /**
     * Constructs an Engine.
     * If the canvas argument is provided then the Engine will be started automatically.
     */
    constructor(canvas?: string | HTMLCanvasElement | WebGLRenderingContext, attributes?: EngineAttributes, doc?: Document);

    /**
     * Called when the last reference to this Engine has been released.
     */
    protected destructor(levelUp: number): void;

    /**
     *
     */
    addContextListener(user: ContextConsumer): void;

    /**
     * Sets the parameters for blending.
     */
    blendFunc(sfactor: BlendingFactorSrc, dfactor: BlendingFactorDest): Engine;

    /**
     * Clears buffers to preset values.
     * The preset values can be set by clearColor(), clearDepth() or clearStencil().
     * The mask defaults to ClearBufferMask.COLOR_BUFFER_BIT | ClearBufferMask.DEPTH_BUFFER_BIT
     */
    clear(mask?: ClearBufferMask): Engine;

    /**
     * Specifies color values used by the clear method to clear the color buffer.
     * The values are clamped between 0 and 1.
     * The default value for red, green, and blue is 0. The default value for alpha is 1.
     */
    clearColor(red: number, green: number, blue: number, alpha: number): Engine;

    /**
     * Specifies the depth value used by the clear method to clear the depth buffer.
     * The value is clamped between 0 and 1.
     * The default value is 1.
     */
    clearDepth(depth: number): Engine;

    /**
     * Specifies the stencil index used by the clear method to clear the stencil buffer.
     * The default value is 0.
     */
    clearStencil(s: number): Engine;

    /**
     * Specifies a function that compares the incoming pixel depth to the current depth buffer value.
     */
    depthFunc(func: DepthFunction): Engine;

    /**
     * Converts from device (canvas) coordinates to image cube coordinates (-1 <= x, y, z <= +1).
     * deviceX: The x-coordinate of the device event.
     * deviceY: The y-coordinate of the device event.
     * imageZ: The optional value to use as the resulting depth coordinate.
     */
    // deviceToImageCoords(deviceX: number, deviceY: number, imageZ?: number): VectorE3;

    /**
     * Turns off the specified WebGL capability for this context.
     */
    disable(capability: Capability): Engine;

    /**
     * Turns on the specified WebGL capability for this context.
     */
    enable(capability: Capability): Engine;

    /**
     * Returns the implementation dependent viewport maximum dimensions.
     * e.g. Int32Array[maxWidth, maxHeight]
     */
    getMaxViewportDims(): Int32Array;

    /**
     * Returns the current viewport parameters.
     * e.g. Int32Array[x, y, width, height]
     */
    getViewport(): Int32Array;

    /**
     * 
     */
    readPixels(x: number, y: number, width: number, height: number, format: PixelFormat, type: PixelType, pixels: ArrayBufferView): void;

    /**
     *
     */
    removeContextListener(user: ContextConsumer): void;

    /**
     * A convenience method for setting the width and height properties of the
     * underlying canvas and for setting the viewport to the drawing buffer height and width.
     */
    size(width: number, height: number): Engine;

    /**
     * Initializes the WebGL context for the specified canvas or canvas element identifier.
     */
    start(canvas: HTMLCanvasElement | string, doc?: Document): Engine;

    /**
     * Terminates the WebGLRenderingContext for the underlying canvas.
     */
    stop(): Engine;

    /**
     *
     */
    synchronize(user: ContextConsumer): Engine;

    /**
     * Defines what part of the canvas will be used in rendering the drawing buffer.
     * x
     * y
     * width
     * height
     */
    viewport(x: number, y: number, width: number, height: number): Engine;
}

/**
 *
 */
export interface ContextConsumer extends Shareable {
    /**
     * Called to request the dependent to free any WebGL resources acquired and owned.
     * The dependent may assume that its cached context is still valid in order
     * to properly dispose of any cached resources. In the case of shared objects, this
     * method may be called multiple times for what is logically the same context. In such
     * cases the dependent must be idempotent and respond only to the first request.
     */
    contextFree?(): void;
    /**
     * Called to inform the dependent of a new WebGL rendering context.
     * The implementation should ignore the notification if it has already
     * received the same context.
     */
    contextGain?(): void;
    /**
     * Called to inform the dependent of a loss of WebGL rendering context.
     * The dependent must assume that any cached context is invalid.
     * The dependent must not try to use and cached context to free resources.
     * The dependent should reset its state to that for which there is no context.
     */
    contextLost?(): void;
}

/**
 * 
 */
export interface ContextManager extends Shareable {
        /*readonly*/ gl: WebGLRenderingContext;
    synchronize(consumer: ContextConsumer): void;
    addContextListener(consumer: ContextConsumer): void;
    removeContextListener(consumer: ContextConsumer): void;
}

export class ShareableContextConsumer extends ShareableBase implements ContextConsumer {
    cleanUp(): void;
    contextFree(): void;
    contextGain(): void;
    contextLost(): void;
    synchUp(): void;
}

/**
 * A wrapper around a WebGLBuffer with binding to ARRAY_BUFFER.
 */
export class VertexBuffer extends ShareableContextConsumer {
    constructor(contextManager: ContextManager, data: Float32Array, usage: Usage, levelUp?: number);
    protected destructor(levelUp: number): void;
    bind(): void;
    upload(): void;
    unbind(): void;
}

/**
 * A wrapper around a WebGLBuffer with binding to ELEMENT_ARRAY_BUFFER.
 */
export class IndexBuffer extends ShareableContextConsumer {
    constructor(contextManager: ContextManager, data: Uint16Array, usage: Usage, levelUp?: number);
    protected destructor(levelUp: number): void;
    bind(): void;
    upload(): void;
    unbind(): void;
}

/**
 * Utility class for managing a shader uniform variable.
 */
export class Uniform implements ContextProgramConsumer {
    constructor(info: WebGLActiveInfo);

    contextFree(): void;
    contextGain(gl: WebGLRenderingContext, program: WebGLProgram): void;
    contextLost(): void;

    /**
     * Sets the uniform location to the value of the specified matrix.
     */
    matrix2fv(transpose: boolean, value: Float32Array): void;

    /**
     * Sets the uniform location to the value of the specified matrix.
     */
    matrix3fv(transpose: boolean, value: Float32Array): void;

    /**
     * Sets the uniform location to the value of the specified matrix.
     */
    matrix4fv(transpose: boolean, value: Float32Array): void;

    toString(): string;

    uniform1f(x: number): void;
    uniform1fv(data: Float32Array): void;
    uniform2f(x: number, y: number): void;
    uniform2fv(data: Float32Array): void;
    uniform3f(x: number, y: number, z: number): void;
    uniform3fv(data: Float32Array): void;
    uniform4f(x: number, y: number, z: number, w: number): void;
    uniform4fv(data: Float32Array): void;
}

/**
 *
 */
export interface FacetVisitor {
    matrix2fv(name: string, mat2: Float32Array, transpose: boolean): void;
    matrix3fv(name: string, mat3: Float32Array, transpose: boolean): void;
    matrix4fv(name: string, mat4: Float32Array, transpose: boolean): void;
    uniform1f(name: string, x: number): void;
    uniform2f(name: string, x: number, y: number): void;
    uniform3f(name: string, x: number, y: number, z: number): void;
    uniform4f(name: string, x: number, y: number, z: number, w: number): void;
    vector2fv(name: string, vec2: Float32Array): void;
    vector3fv(name: string, vec3: Float32Array): void;
    vector4fv(name: string, vec4: Float32Array): void;
}

export interface Material extends Facet, FacetVisitor, ContextConsumer {
    vertexShaderSrc: string;
    fragmentShaderSrc: string;
    attrib(name: string, value: VertexBuffer, size: number, normalized?: boolean, stride?: number, offset?: number): Material;
    getAttrib(indexOrName: number | string): Attrib;
    getAttribLocation(name: string): number;
    enableAttrib(indexOrName: number | string): void;
    disableAttrib(indexOrName: number | string): void;
    /**
     * mode Specifies the type of the primitive being rendered.
     * first Specifies the starting index in the array of vector points.
     * count The number of points to be rendered.
     */
    drawArrays(mode: BeginMode, first: number, count: number): Material;
    /**
     * mode Specifies the type of the primitive being rendered.
     * count The number of elements to be rendered.
     * type The type of the values in the element array buffer.
     * offset Specifies an offset into the element array buffer.
     */
    drawElements(mode: BeginMode, count: number, type: DataType, offset: number): Material;
    getUniform(name: string): Uniform;
    matrix2fv(name: string, elements: Float32Array, transpose?: boolean): Material;
    matrix3fv(name: string, elements: Float32Array, transpose?: boolean): Material;
    matrix4fv(name: string, elements: Float32Array, transpose?: boolean): Material;
    uniform(name: string, value: number | number[]): Material;
    use(): Material;
}

/**
 * An array of attribute values associated with meta data describing how to interpret the values.
 * {values: number[]; size: number;}
 */
export interface Attribute {

    /**
     * The attribute values.
     */
    values: number[];

    /**
     * The number of values that are associated with a given vertex.
     */
    size: number;
}

/**
 *
 */
export interface Primitive {
    /**
     *
     */
    mode: BeginMode;

    /**
     *
     */
    indices?: number[];

    /**
     *
     */
    attributes: { [name: string]: Attribute };
}

/**
 * 
 */
export function vertexArraysFromPrimitive(primitive: Primitive, order?: string[]): VertexArrays;

/**
 *
 */
export interface ContextProgramConsumer {
    contextFree(): void;
    contextGain(gl: WebGLRenderingContext, program: WebGLProgram): void;
    contextLost(): void;
}

/**
 * Manages the lifecycle of an attribute used in a vertex shader.
 */
export class Attrib implements ContextProgramConsumer {
    index: number;
    contextFree(): void;
    contextGain(gl: WebGLRenderingContext, program: WebGLProgram): void;
    contextLost(): void;
    config(size: number, type: DataType, normalized?: boolean, stride?: number, offset?: number): void;
    enable(): void;
    disable(): void;
}

/**
 * A wrapper around a WebGLTexture and containing a loaded HTMLImageElement.
 */
export class Texture extends ShareableContextConsumer {
    minFilter: TextureMinFilter;
    magFilter: TextureMagFilter;
    wrapS: TextureWrapMode;
    wrapT: TextureWrapMode;
    constructor(target: TextureTarget, contextManager: ContextManager, levelUp?: number);
    protected destructor(levelUp: number): void;

    /**
     *
     */
    bind(): void;

    /**
     *
     */
    unbind(): void;

    /**
     *
     */
    upload(): void;
}

export class ImageTexture extends Texture {
        /**
         * The intrinsic height of the image in CSS pixels, if it is available, otherwise zero.
         */
        /*readonly*/ naturalHeight: number;
        /**
         * The intrinsic width of the image in CSS pixels, if it is available, otherwise zero.
         */
        /*readonly*/ naturalWidth: number;
    /**
     * 
     */
    constructor(image: HTMLImageElement, target: TextureTarget, contextManager: ContextManager, levelUp?: number);
    protected destructor(levelUp: number): void;

    /**
     *
     */
    upload(): void;
}

interface TextureLoaderOptions {
    crossOrigin?: string;
}

export class TextureLoader {
    constructor(contextManager: ContextManager);
    loadImageTexture(url: string, onLoad: (texture: ImageTexture) => any, onError?: () => any, options?: TextureLoaderOptions): void;
}

/**
 * 
 */
export interface Lockable {
    /**
     * Determines whether this `Lockable` is locked.
     * If the `Lockable` is in the unlocked state then it is mutable.
     * If the `Lockable` is in the locked state then it is immutable.
     */
    isLocked(): boolean;
    /**
     * Locks this `Lockable` (preventing any further mutation),
     * and returns a token that may be used to unlock it.
     */
    lock(): number;
    /**
     * Unlocks this `Lockable` (allowing mutation),
     * using a token that was obtained from a preceding lock method call.
     */
    unlock(token: number): void;
}

/**
 * A provider of a collection of 'uniform' variables for use in a WebGL program.
 */
export interface Facet {
    setUniforms(visitor: FacetVisitor): void;
}

/**
 * A collection of primitives, one for each canvas.
 */
export interface IGraphicsBuffers extends ContextConsumer {
    /**
     *
     */
    draw(program: Material): void;
}

/**
 *
 */
export interface AttribMetaInfo {
    /**
     * The type keyword as it appears in the GLSL shader program.
     */
    glslType: string;
}

/**
 *
 */
export interface UniformMetaInfo {
    /**
     * Specifies an optional override of the name used as a key.
     */
    name?: string;
    /**
     * The type keyword as it appears in the GLSL shader program.
     */
    glslType: string;
}

/**
 * Record reference count changes and debug reference counts.
 *
 * Instrumenting reference counting:
 *   constructor():
 *     refChange(uuid, 'YourClassName',+1);
 *   addRef():
 *     refChange(uuid, 'YourClassName',+1);
 *   release():
 *     refChange(uuid, 'YourClassName',-1);
 *
 * Debugging reference counts:
 *   Start tracking reference counts:
 *     refChange('start'[, 'where']);
 *     The system will record reference count changes.
 *   Stop tracking reference counts:
 *     refChange('stop'[, 'where']);
 *     The system will compute the total outstanding number of reference counts.
 *   Dump tracking reference counts:
 *     refChange('dump'[, 'where']);
 *     The system will log net reference count changes to the console.
 *   Don't track reference counts (default):
 *     refChange('reset'[, 'where']);
 *     The system will clear statistics and enter will not record changes.
 *   Trace reference counts for a particular class:
 *     refChange('trace', 'YourClassName');
 *     The system will report reference count changes on the specified class.
 *
 * Returns the number of outstanding reference counts for the 'stop' command.
 */
export function refChange(uuid: string, name?: string, change?: number): number;

/**
 * Canonical variable names, which also act as semantic identifiers for name overrides.
 * These names must be stable to avoid breaking custom vertex and fragment shaders.
 */
export class GraphicsProgramSymbols {
    /**
     * 'aColor'
     */
    static ATTRIBUTE_COLOR: string;
    /**
     * 'aGeometryIndex'
     */
    static ATTRIBUTE_GEOMETRY_INDEX: string;
    /**
     * 'aNormal'
     */
    static ATTRIBUTE_NORMAL: string;
    /**
     * 'aPosition'
     */
    static ATTRIBUTE_POSITION: string;
    /**
     * 'aTextureCoords'
     */
    static ATTRIBUTE_COORDS: string;

    static UNIFORM_AMBIENT_LIGHT: string;
    static UNIFORM_COLOR: string;
    static UNIFORM_DIRECTIONAL_LIGHT_COLOR: string;
    static UNIFORM_DIRECTIONAL_LIGHT_DIRECTION: string;
    static UNIFORM_OPACITY: string;
    static UNIFORM_POINT_LIGHT_COLOR: string;
    static UNIFORM_POINT_LIGHT_POSITION: string;
    static UNIFORM_PROJECTION_MATRIX: string;
    static UNIFORM_REFLECTION_ONE_MATRIX: string;
    static UNIFORM_REFLECTION_TWO_MATRIX: string;
    static UNIFORM_MODEL_MATRIX: string;
    static UNIFORM_NORMAL_MATRIX: string;
    static UNIFORM_VIEW_MATRIX: string;
    /**
     * 'vColor'
     */
    static VARYING_COLOR: string;
    /**
     * 'vCoords'
     */
    static VARYING_COORDS: string;
    /**
     * 'vLight'
     */
    static VARYING_LIGHT: string;
}

/**
 * The interface contract for an object that may exist in a Scene.
 */
export interface Renderable extends ContextConsumer {
    /**
     * An optional name allowing the object to be found by name.
     */
    name?: string;

    /**
     * Determines when this object will be renderered relative to other objects.
     * Transparent objects are rendered after non-transparent objects.
     */
    transparent?: boolean;

    /**
     * Renders this object to the WebGL pipeline.
     */
    render(ambients: Facet[]): void;
}

/**
 * A collection of Renderable objects providing a convenient way to render multiple objects to the WebGL pipeline.
 */
export class Scene extends ShareableContextConsumer implements Renderable {
    /**
     * Constructs a Scene instance.
     * contextManager: Usually an instance of Engine.
     */
    constructor(contextManager: ContextManager);
    /**
     * Adds the specified drawable object to this Scene.
     */
    add(drawable: Renderable): void;
    contains(drawable: Renderable): boolean;
    contextFree(): void;
    contextGain(): void;
    contextLost(): void;
    protected destructor(levelUp: number): void;
    /**
     * @deprecated. Please use the render method instead.
     */
    draw(ambients: Facet[]): void;
    find(match: (drawable: Renderable) => boolean): ShareableArray<Renderable>;
    findByName(name: string): ShareableArray<Renderable>;
    findOne(match: (drawable: Renderable) => boolean): Renderable;
    findOneByName(name: string): Renderable;
    /**
     * Removes the specified drawable from this Scene.
     */
    remove(drawable: Renderable): void;
    /**
     * Traverses the collection of AbstractDrawable objects, calling render(ambients) on each one.
     * The rendering takes place in two stages.
     * In the first stage, non-transparent objects are drawn.
     * In the second stage, transparent objects are drawn.
     *
     * ambients: Provide GLSL uniform values for all objects. 
     */
    render(ambients: Facet[]): void;
}

/**
 * 
 */
export class PerspectiveTransform implements Facet {
    /**
     * The field of view is the angle in the camera horizontal plane that the viewport subtends at the camera.
     * The field of view is measured in radians.
     */
    fov: number;
    /**
     * The aspect ratio of the viewport, i.e., width / height.
     */
    aspect: number;
    /**
     * The distance to the near plane of the viewport.
     */
    near: number;
    /**
     * The distance to the far plane of the viewport.
     */
    far: number;
    /**
     * 
     */
    constructor(fov?: number, aspect?: number, near?: number, far?: number);

    /**
     * 
     */
    imageToCameraCoords(x: number, y: number, z: number): number[];

    /**
     * 
     */
    setUniforms(visitor: FacetVisitor): void;
}

export interface VertexAttribPointer {
    /**
     * The name of the vertex attribute.
     */
    name: string;
    /**
     * The number of values per vertex for this attribute.
     */
    size: number;
    /**
     * Determines what range to use when normalizing values.
     */
    normalized: boolean;
    /**
     * The offset of the values in bytes.
     */
    offset: number;
}

export interface VertexArrays {
    mode: BeginMode;
    indices?: number[];
    attributes: number[];
    stride: number;
    pointers: VertexAttribPointer[];
}

/**
 * Encapsulates one or more buffers and a call to drawArrays or drawElements.
 */
export interface Geometry extends ContextConsumer {
    /**
     * Binds the attributes of the material to the buffers in this Geometry.
     */
    bind(material: Material): void;
    /**
     * Unbinds the attributes of the material from the buffers in this Geometry.
     */
    unbind(material: Material): void;
    /**
     * Invokes the appropriate drawArrays or drawElements call to send data to the Graphics Pipeline.
     */
    draw(): void;
}

/**
 * A Geometry for supporting drawArrays.
 */
export class GeometryArrays extends ShareableContextConsumer implements Geometry {
    constructor(contextManager: ContextManager, primitive: Primitive, options?: { order?: string[]; }, levelUp?: number);
    protected destructor(levelUp: number): void;
    bind(material: Material): GeometryArrays;
    unbind(material: Material): GeometryArrays;
    draw(): GeometryArrays;
    protected setScale(x: number, y: number, z: number): void;
}

/**
 * A Geometry for supporting drawElements.
 */
export class GeometryElements extends ShareableContextConsumer implements Geometry {
    constructor(contextManager: ContextManager, primitive: Primitive, options?: { order?: string[]; }, levelUp?: number);
    protected destructor(levelUp: number): void;
    bind(material: Material): GeometryElements;
    unbind(material: Material): GeometryElements;
    draw(): GeometryElements;
    protected setScale(x: number, y: number, z: number): void;
}

/**
 * Merges a list of Primitive(s) into a single Primitive to minimize WebGL calls.
 * (Experimental)
 */
export function reduce(primitives: Primitive[]): Primitive;

/**
 * Determines how a Geometry will be rendered.
 */
export enum GeometryMode {
    /**
     * 
     */
    POINT = 0,
    /**
     * 
     */
    WIRE = 1,
    /**
     * 
     */
    MESH = 2
}

/**
 *
 */
export class ShaderMaterial extends ShareableContextConsumer implements Material {
        /*readonly*/ attributeNames: string[];
        /*readonly*/ fragmentShaderSrc: string;
        /*readonly*/ vertexShaderSrc: string;
    constructor(vertexShaderSrc: string, fragmentShaderSrc: string, attribs: string[], contextManager: ContextManager);
    contextFree(): void;
    contextGain(): void;
    contextLost(): void;
    protected destructor(levelUp: number): void;
    attrib(name: string, value: VertexBuffer, size: number, normalized?: boolean, stride?: number, offset?: number): Material;
    disableAttrib(indexOrName: number | string): void;
    disableAttribs(): void;
    drawArrays(mode: BeginMode, first: number, count: number): Material;
    drawElements(mode: BeginMode, count: number, type: DataType, offset: number): Material;
    enableAttrib(indexOrName: number | string): void;
    enableAttribs(): void;
    getAttrib(indexOrName: number | string): Attrib;
    getAttribLocation(name: string): number;
    getUniform(name: string): Uniform;
    hasUniform(name: string): boolean;
    matrix2fv(name: string, mat2: Float32Array, transpose?: boolean): Material;
    matrix3fv(name: string, mat3: Float32Array, transpose?: boolean): Material;
    matrix4fv(name: string, mat4: Float32Array, transpose?: boolean): Material;
    setUniforms(visitor: FacetVisitor): void;
    uniform1f(name: string, x: number): void;
    uniform2f(name: string, x: number, y: number): void;
    uniform3f(name: string, x: number, y: number, z: number): void;
    uniform4f(name: string, x: number, y: number, z: number, w: number): void;
    uniform(name: string, value: number | number[]): Material;
    use(): Material;
    vector2fv(name: string, vec2: Float32Array): void;
    vector3fv(name: string, vec3: Float32Array): void;
    vector4fv(name: string, vec4: Float32Array): void;
}

/**
 * A material based upon scripts in a DOM.
 */
export class HTMLScriptsMaterial extends ShaderMaterial {
    /**
     *
     */
    constructor(contextManager: ContextManager, scriptIds: string[], attribs?: string[], dom?: Document, levelUp?: number);
    /**
     *
     * @param levelUp
     */
    protected destructor(levelUp: number): void;
}

/**
 * `blendFunc(sfactor: number, dfactor: number): void`
 */
export class WebGLBlendFunc extends ShareableBase {
    sfactor: BlendingFactorSrc;
    dfactor: BlendingFactorDest;
    constructor(sfactor: BlendingFactorSrc, dfactor: BlendingFactorDest);

    /**
     *
     */
    contextFree(): void;

    /**
     *
     */
    contextGain(): void;

    /**
     *
     */
    contextLost(): void;
}

/**
 *
 */
export class WebGLClearColor extends ShareableBase {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(contextManager: ContextManager, r?: number, g?: number, b?: number, a?: number);
    /**
     *
     */
    contextFree(): void;
    /**
     *
     */
    contextGain(): void;
    /**
     *
     */
    contextLost(): void;
}

/**
 * `disable(capability: number): void`
 */
export class WebGLDisable extends ShareableBase {
    /**
     *
     */
    constructor(contextManager: ContextManager, capability: Capability);
    /**
     *
     */
    contextFree(): void;
    /**
     *
     */
    contextGain(): void;
    /**
     *
     */
    contextLost(): void;
}

/**
 * `enable(capability: number): void`
 */
export class WebGLEnable extends ShareableBase {
    /**
     *
     */
    constructor(contextManager: ContextManager, capability: Capability);
    /**
     *
     */
    contextFree(): void;
    /**
     *
     */
    contextGain(): void;
    /**
     *
     */
    contextLost(): void;
}
