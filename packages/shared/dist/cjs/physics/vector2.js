"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVector = addVector;
exports.scaleVector = scaleVector;
exports.vectorsAreEqual = vectorsAreEqual;
exports.lerpVector = lerpVector;
function addVector(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}
function scaleVector(v, scalar) {
    return { x: v.x * scalar, y: v.y * scalar };
}
function vectorsAreEqual(a, b, epsilon = 1e-6) {
    return Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon;
}
function lerpVector(a, b, t) {
    return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
    };
}
