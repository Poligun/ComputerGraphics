Canvas3d = {};

Canvas3d.Object = function() {
    this.vertices = [];
    this.edges = [];
    this.resetTranslation();
    this.resetScaling();
    this.resetRotation();
    this.transformMatrix = Canvas3d.Matrix.identity(4);
};

Canvas3d.Object.prototype.translate = function(x, y, z) {
    this.translationMatrix = Canvas3d.Matrix.translation(x, y, z).multiply(this.translationMatrix);
};

Canvas3d.Object.prototype.scale = function(x, y, z) {
    if (arguments.length == 1)
        this.scalingMatrix = Canvas3d.Matrix.scaling(x, x, x).multiply(this.scalingMatrix);
    else
        this.scalingMatrix = Canvas3d.Matrix.scaling(x, y, z).multiply(this.scalingMatrix);
};

Canvas3d.Object.prototype.rotate = function(axis, angle) {
    this.rotationMatrix = Canvas3d.Matrix.rotation(axis, angle).multiply(this.rotationMatrix);
};

Canvas3d.Object.prototype.rotateInDegree = function(axis, degree) {
    this.rotate(axis, degree * Math.PI / 180);
};

Canvas3d.Object.prototype.resetTranslation = function() {
    this.translationMatrix = Canvas3d.Matrix.identity(4);   
};

Canvas3d.Object.prototype.resetScaling = function() {
    this.scalingMatrix = Canvas3d.Matrix.identity(4);
};

Canvas3d.Object.prototype.resetRotation = function() {
    this.rotationMatrix = Canvas3d.Matrix.identity(4);
};

Canvas3d.Object.prototype.prepare = function() {
    this.transformMatrix =
        this.translationMatrix.copy().multiply(this.rotationMatrix).multiply(this.scalingMatrix);
};

Canvas3d.Object.prototype.transformVertices = function() {
    var vertices = [];
    this.prepare();
    for (var i in this.vertices)
        vertices.push(this.vertices[i].copy().multipliedBy(this.transformMatrix));
    return vertices;
};

Canvas3d.Object.prototype.edgesWithOffset = function(offset) {
    var edges = []
    for (var i in this.edges)
        edges.push([this.edges[i][0] + offset, this.edges[i][1] + offset]);
    return edges;
};


Canvas3d.Viewport = function(width, height) {
    this.halfWidth = width / 2;
    this.halfHeight = height / 2;
    if (width > height) {
        this.xFactor = width / height;
        this.yFactor = 1;
    } else {
        this.xFactor = 1;
        this.yFactor = height / width;
    }
    this.xFactor = this.yFactor = 1;
};

Canvas3d.Viewport.prototype.transform = function(vertex) {
    return {
        'x': this.halfWidth + vertex.getX() / this.xFactor * this.halfWidth,
        'y': this.halfHeight - vertex.getY() / this.yFactor * this.halfHeight,
        'z': vertex.getZ()
    };
};

Canvas3d.Scene = function() {
    this.camera = null;
    this.objects = [];
    this.edges = [];
    this.numberOfVertices = 0;
};

Canvas3d.Scene.prototype = {

constructor: Canvas3d.Scene,

addObject: function(object) {
    this.objects.push(object);
    //this.edges = this.edges.concat(object.edgesWithOffset(this.numberOfVertices));
    //this.numberOfVertices += object.vertices.length;
},

render: function(drawFunction) {
    for (var i = 0; i < this.objects.length; i++) {
        var vertices = this.objects[i].transformVertices();
        var edges = this.objects[i].edges;

        for (var j = 0; j <vertices.length; j++)
            this.camera.transformVertex(vertices[j]);
        drawFunction(vertices, edges);
    }
}

};

Canvas3d.Canvas3d = function(canvas) {
    this.canvas = canvas;
    this.scene = new Canvas3d.Scene();
    this.context = canvas.getContext('2d');
    this.viewport = new Canvas3d.Viewport(canvas.width, canvas.height);
    this.fovx = 60;
    this.scene.camera = new Canvas3d.Camera(canvas.width / canvas.height, this.fovx);

    this.context.fillStyle = this.context.strokeStyle = 'white';
    canvas.style.backgroundColor = 'black';

    this.context.textBaseline = 'top';
    this.context.font = '16px bold helvetica';

    this.callbacks = [];
};

Canvas3d.Canvas3d.prototype = {

constructor: Canvas3d.Canvas3d,

addObject: function(object, initializer, callback) {
    if (typeof(initializer) == 'function')
        initializer(object);

    this.scene.addObject(object);

    if (typeof(callback) == 'function') {
        this.callbacks.push(function(timePast) {
            callback(timePast, object);
        });
    }
},

loadObject: function(url, initializer, callback) {
    var self = this;
    $.getJSON(url).done(function(data) {
        var object = new Canvas3d.Object();
        object.edges = data.edges;
        for (var i = 0; i < data.vertices.length; i++) {
            var vertex = data.vertices[i];
            object.vertices.push(new Canvas3d.Vector4(vertex[0], vertex[1], vertex[2], 1));
        }
        self.addObject.call(self, object, initializer, callback);
    });
},

drawLine: function(context, x1, y1, x2, y2) {
    context.beginPath();
    context.moveTo(x1 + 0.5, y1 + 0.5);
    context.lineTo(x2 + 0.5, y2 + 0.5);
    context.stroke();
},

drawText: function(context, text, x, y) {
    context.fillText(text, x + 0.5, y + 0.5);
},

draw: function() {
    var context = this.context;
    var viewport = this.viewport;

    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    context.beginPath();
    this.scene.render(function(vertices, edges) {
        var points = [];

        for (var i = 0; i < vertices.length; i++)
            points.push(viewport.transform(vertices[i]));

        for (var i = 0; i < edges.length; i++) {
            var point1 = points[edges[i][0]];
            var point2 = points[edges[i][1]];

            if ((point1.z < -3 || point1.z > 1) ||
                (point2.z < -3 || point2.z > 1)) continue;

            context.moveTo(point1.x + 0.5, point1.y + 0.5);
            context.lineTo(point2.x + 0.5, point2.y + 0.5);
        }
    });
    context.stroke();
},

start: function(callback) {
    var timeStamp = (new Date()).getTime();
    var startTime = timeStamp / 1000;
    var self = this;

    if (typeof(callback) == 'function')
        this.callbacks.push(callback);

    function repeat() {
        var currentTime = (new Date()).getTime();
        var timePast = currentTime / 1000 - startTime;
        for (var i = 0; i < self.callbacks.length; i++)
            self.callbacks[i](currentTime - timeStamp);
        self.draw();
        self.drawText(self.context, 'FPS: ' + 1000 / (currentTime - timeStamp), 0, 0);
        self.drawText(self.context, 'FOVx: ' + self.fovx, 0, 20);
        if (self.scene.camera !== undefined) {
            self.drawText(self.context, 'Camera: ' + self.scene.camera.cameraLocation.getX().toPrecision(4) +
                ', ' + self.scene.camera.cameraLocation.getY().toPrecision(4) + ', ' + self.scene.camera.cameraLocation.getZ().toPrecision(4), 0, 40);

            self.drawText(self.context, 'LookAt: ' + self.scene.camera.lookAtPosition.getX().toPrecision(4) +
                ', ' + self.scene.camera.lookAtPosition.getY().toPrecision(4) + ', ' + self.scene.camera.lookAtPosition.getZ().toPrecision(4), 0, 60);
        }
        self.drawText(self.context, 'W,S,A,D to move', 0, 80);
        self.drawText(self.context, 'Arrows to turn', 0, 100);
        timeStamp = currentTime;
        setTimeout(repeat, 1000 / 100);
    }

    repeat();
},

};
