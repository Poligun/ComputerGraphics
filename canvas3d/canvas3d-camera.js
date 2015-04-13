Canvas3d.Camera = function(ratio, horizontalFOV) {
    this.cameraLocation = new Canvas3d.Vector4(0, 0, 0, 1);
    this.lookAtPosition = new Canvas3d.Vector4(0, 0, -1, 1);
    this.upDirection = new Canvas3d.Vector4(0, 1, 0, 0);

    this.lookAt(this.lookAtPosition, this.cameraLocation, this.upDirection);
    horizontalFOV = horizontalFOV || 90;
    this.perspective((horizontalFOV * Math.PI / 180) / ratio, ratio, 1, 100);
    this.update();
};

Canvas3d.Camera.prototype.lookAt = function(point, cameraLocation, upDirection) {
    var zAxis = cameraLocation.copy().subtract(point).normalize();
    var xAxis = upDirection.copy().cross3(zAxis).normalize();
    var yAxis = zAxis.copy().cross3(xAxis).normalize();
    var translationMatrix = new Canvas3d.Matrix(4, 4, false);

    translationMatrix.values = xAxis.values.concat(yAxis.values).concat(zAxis.values).concat([0, 0, 0, 1]);

    this.viewMatrix = translationMatrix.multiply(Canvas3d.Matrix.translation(-point.getX(), -point.getY(), -point.getZ()));
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.zAxis = zAxis;
};

Canvas3d.Camera.prototype.move = function(cameraX, cameraY, cameraZ) {
    var shifting = Canvas3d.Matrix.scaling(cameraX, cameraX, cameraX).multiply(this.xAxis).add(
                   Canvas3d.Matrix.scaling(cameraY, cameraY, cameraY).multiply(this.yAxis)).add(
                   Canvas3d.Matrix.scaling(cameraZ, cameraZ, cameraZ).multiply(this.zAxis));
    this.lookAtPosition.add(shifting);
    this.cameraLocation.add(shifting);
    this.lookAt(this.lookAtPosition, this.cameraLocation, this.upDirection);
    this.update();
};

Canvas3d.Camera.prototype.rotate = function(xAngle, yAngle, zAngle) {
    var rotation = Canvas3d.Matrix.rotation('x', xAngle).multiply(
                   Canvas3d.Matrix.rotation('y', yAngle)).multiply(
                   Canvas3d.Matrix.rotation('z', zAngle));
    var lookAtDirection = this.lookAtPosition.copy().subtract(this.cameraLocation);
    this.lookAtPosition = lookAtDirection.multipliedBy(rotation).add(this.cameraLocation);
    this.upDirection.multipliedBy(rotation);
    this.lookAt(this.lookAtPosition, this.cameraLocation, this.upDirection);
    this.update();
};

Canvas3d.Camera.prototype.perspective = function(fovy, ratio, znear, zfar) {
    var fovx = fovy * ratio;
    var perspectiveMatrix = new Canvas3d.Matrix(4, 4, false);

    perspectiveMatrix.values = [1 / Math.tan(fovx / 2), 0, 0, 0, 0, 1 / Math.atan(fovy / 2), 0, 0];
    if (zfar === undefined)
        perspectiveMatrix.values = perspectiveMatrix.values.concat(
            [0, 0, -1, -2, 0, 0, -1, 0]);
    else
        perspectiveMatrix.values = perspectiveMatrix.values.concat(
            [0, 0, (znear + zfar) / (znear - zfar), 2 * znear * zfar / (znear - zfar), 0, 0, -1, 0]);
    this.perspectiveMatrix = perspectiveMatrix;
};

Canvas3d.Camera.prototype.update = function() {
    this.transformMatrix = this.perspectiveMatrix.copy().multiply(this.viewMatrix);
};

Canvas3d.Camera.prototype.transformVertex = function(vertex) {
    return vertex.multipliedBy(this.transformMatrix).dividedByW();
};
