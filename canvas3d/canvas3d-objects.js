Canvas3d.Axes = function(length) {
    if (length === undefined)
        length = 90;
    this.vertices = [
        new Canvas3d.Vector4(0, 0, 0, 1),
        new Canvas3d.Vector4(length, 0, 0, 1),
        new Canvas3d.Vector4(0, length, 0, 1),
        new Canvas3d.Vector4(0, 0, -length, 1)
    ];
    this.edges = [[0, 1], [0, 2], [0, 3]];
};

Canvas3d.Axes.prototype = new Canvas3d.Object();
Canvas3d.Axes.prototype.constructor = Canvas3d.Axes;

Canvas3d.Square = function(length) {
    Canvas3d.Object.call(this);

    length = length / 2;
    this.vertices = [
        new Canvas3d.Vector4(-length, -length, 0, 1),
        new Canvas3d.Vector4( length, -length, 0, 1),
        new Canvas3d.Vector4(-length,  length, 0, 1),
        new Canvas3d.Vector4( length,  length, 0, 1),
    ];
    this.edges = [[0, 1], [1, 3], [3, 2], [2, 0]];
};

Canvas3d.Square.prototype = new Canvas3d.Object();
Canvas3d.Square.prototype.constructor = Canvas3d.Square;

Canvas3d.Cube = function(length) {
    Canvas3d.Object.call(this);

    length = length / 2;
    this.vertices = [
        new Canvas3d.Vector4(-length, -length, -length, 1),
        new Canvas3d.Vector4( length, -length, -length, 1),
        new Canvas3d.Vector4(-length,  length, -length, 1),
        new Canvas3d.Vector4( length,  length, -length, 1),
        new Canvas3d.Vector4(-length, -length,  length, 1),
        new Canvas3d.Vector4( length, -length,  length, 1),
        new Canvas3d.Vector4(-length,  length,  length, 1),
        new Canvas3d.Vector4( length,  length,  length, 1),
    ];
    this.edges = [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [2, 6], [1, 5], [3, 7]];
}

Canvas3d.Cube.prototype = new Canvas3d.Object();
Canvas3d.Cube.prototype.constructor = Canvas3d.Cube;

Canvas3d.Circle = function(radius, precision, showCenter) {
    Canvas3d.Object.call(this);

    precision = precision || 10;

    var theta = Math.PI * 2 / precision;

    for (var i = 0; i < precision; i++) {
        this.vertices.push(new Canvas3d.Vector4(radius * Math.cos(i * theta), radius * Math.sin(i * theta), 0, 1));
        this.edges.push([i, (i + 1) % precision]);
    }

    if (showCenter) {
        this.vertices.push(new Canvas3d.Vector4(0, 0, 0, 1));
        for (var i = 0; i < precision; i++) {
            this.edges.push([i, this.vertices.length - 1]);
        }
    }
};

Canvas3d.Circle.prototype = new Canvas3d.Object();
Canvas3d.Circle.prototype.constructor = Canvas3d.Circle;

Canvas3d.Cylinder = function(radius, length, precision, showCenter) {
    Canvas3d.Object.call(this);

    length = length / 2;

    var circle = new Canvas3d.Circle(radius, precision, showCenter);
    circle.rotateInDegree('x', -90);

    circle.translate(0, length, 0);
    this.edges = circle.edgesWithOffset(0);
    this.vertices = circle.transformVertices();

    circle.resetTranslation();
    circle.translate(0, -length, 0);
    this.edges = this.edges.concat(circle.edgesWithOffset(circle.vertices.length));
    this.vertices = this.vertices.concat(circle.transformVertices());

    for (var i = 0; i < circle.vertices.length; i++)
        this.edges.push([i, i + circle.vertices.length]);
};

Canvas3d.Cylinder.prototype = new Canvas3d.Object();
Canvas3d.Cylinder.prototype.constructor = Canvas3d.Cylinder;


Canvas3d.Sphere = function(radius, verticalPrecison, horizontalPrecision, showCenter) {
    Canvas3d.Object.call(this);

    horizontalPrecision = horizontalPrecision || 10;
    verticalPrecison = verticalPrecison || 10;

    var delta = Math.PI / verticalPrecison;
    for (var i = 0; i <= verticalPrecison; i++) {
        var h = radius * Math.cos(i * delta + Math.PI);
        var r = Math.sqrt(Math.pow(radius, 2) - Math.pow(h, 2));
        var circle = new Canvas3d.Circle(r, horizontalPrecision, showCenter);

        circle.rotateInDegree('x', -90);
        circle.translate(0, h, 0);

        this.edges = this.edges.concat(circle.edgesWithOffset(this.vertices.length));
        this.vertices = this.vertices.concat(circle.transformVertices());
    }

    for (var i = verticalPrecison - 1; i >= 0; i--)
        for (var j = 0; j < horizontalPrecision; j++)
            this.edges.push([i * horizontalPrecision + j, (i + 1) * horizontalPrecision + j]);
};

Canvas3d.Sphere.prototype = new Canvas3d.Object();
Canvas3d.Sphere.prototype.constructor = Canvas3d.Sphere;

Canvas3d.GeoSphere = function(radius, circlePrecision, numberOfCircles, showCenter) {
    Canvas3d.Object.call(this);

    var alpha = 60 * Math.PI / 180;
    var l = Math.sqrt(2 * radius * radius * (1 -  Math.cos(alpha)));
    var h = l * Math.sin(Math.PI / 3);
    var tan = Math.sqrt((9 * radius * radius - 4 * h * h) / (h * h));
    var zValue = h / Math.sqrt(1 + Math.pow(tan, 2));
    var yValue = zValue * tan;

    var startingX = 0, staringY = l / 2;
    var startingZ = Math.sqrt(radius * radius - l * l / 4);
    var center = new Canvas3d.Vector4(0, 0, 0, 1);
    var startingA = new Canvas3d.Vector4(startingX, staringY, startingZ, 1);
    var startingB = new Canvas3d.Vector4(startingX, -staringY, startingZ, 1);

    this.vertices = [startingA, startingB];
    this.edges = [[0, 1]];
    this.addRecur(5, 0, 1, center, yValue, zValue);

    if (showCenter) {

    for (var i = 0; i < this.vertices.length; i++)
        this.edges.push([i, this.vertices.length]);
        this.vertices.push(center);   
    }
};

Canvas3d.GeoSphere.prototype = new Canvas3d.Object();
Canvas3d.GeoSphere.prototype.constructor = Canvas3d.GeoSphere;

Canvas3d.GeoSphere.prototype.addRecur = function(level, aIndex, bIndex, center, yValue, zValue) {
    if (level == 0) return;

    var vertexA = this.vertices[aIndex];
    var vertexB = this.vertices[bIndex];
    var vertexC1 = this.getNextPoint(vertexA, vertexB, center, yValue, zValue);
    var vertexC2 = this.getNextPoint(vertexB, vertexA, center, yValue, zValue);
    var c1Index = this.vertices.length;
    var c2Index = c1Index + 1;

    this.vertices.push(vertexC1);
    this.vertices.push(vertexC2);
    this.edges = this.edges.concat([[aIndex, c1Index], [bIndex, c1Index], [aIndex, c2Index], [bIndex, c2Index]]);

    this.addRecur(level - 1, aIndex, c1Index, center, yValue, zValue);
    this.addRecur(level - 1, bIndex, c1Index, center, yValue, zValue);
    this.addRecur(level - 1, aIndex, c2Index, center, yValue, zValue);
    this.addRecur(level - 1, bIndex, c2Index, center, yValue, zValue);
};

Canvas3d.GeoSphere.prototype.getNextPoint = function(vertexA, vertexB, center, yValue, zValue) {
    var midPoint = vertexA.copy().add(vertexB).time(0.5);
    var xAxis = vertexB.copy().subtract(vertexA).normalize();
    var yAxis = vertexA.copy().subtract(center).cross3(xAxis).normalize();
    var zAxis = midPoint.copy().subtract(center).normalize();
    var direction = new Canvas3d.Vector4(0, yValue, -zValue, 0);
    return midPoint.copy().add(yAxis.time(yValue)).add(zAxis.time(-zValue));
    /*
    return new Canvas3d.Vector4(xAxis.dot(direction) + midPoint.getX(),
                                yAxis.dot(direction) + midPoint.getY(),
                                zAxis.dot(direction) + midPoint.getZ(), 1);
*/
}

Canvas3d.Ring = function(radius1, radius2, precision, connected) {
    Canvas3d.Object.call(this);

    var circle1 = new Canvas3d.Circle(radius1, precision);
    var circle2 = new Canvas3d.Circle(radius2, precision);

    connected = (connected === undefined) ? false : connected;

    this.edges = circle1.edgesWithOffset(0).concat(circle2.edgesWithOffset(circle1.vertices.length));
    this.vertices = circle1.vertices.concat(circle2.vertices);

    if (connected) {
        for (var i = 0; i < circle1.vertices.length; i++)
            this.edges.push([i, i + circle1.vertices.length]);
    }
}

Canvas3d.Ring.prototype = new Canvas3d.Object();
Canvas3d.Ring.prototype.constructor = Canvas3d.Ring;

Canvas3d.Tunnel = function(radius1, radius2, number, zAmount, randomShift, shiftAmount, precision) {
    Canvas3d.Object.call(this);

    this.randomShift = (randomShift === undefined) ? false : randomShift;
    shiftAmount = (shiftAmount === undefined) ? 0.3 : shiftAmount;
    this.zAmount = -zAmount;

    this.ring = new Canvas3d.Ring(radius1, radius2, (precision === undefined) ? 50 : precision, true);

    this.randomAmount = function() { return Math.random() * shiftAmount * 2 - shiftAmount; }

    this.centers = [];
    this.centers[-1] = new Canvas3d.Vector4(0, 0, 0, 1);
    this.extend(1, false);
    this.extend(Math.max(1, number - 1));
};

Canvas3d.Tunnel.prototype = new Canvas3d.Object();
Canvas3d.Tunnel.prototype.constructor = Canvas3d.Tunnel;

Canvas3d.Tunnel.prototype.extend = function(number, connectPrevious) {
    number = (number === undefined) ? 1 : number;
    connectPrevious = (connectPrevious === undefined) ? true : connectPrevious;

    for (var i = 0; i < number; i++) {
        var base = this.vertices.length - this.ring.vertices.length;
        var center = this.centers[this.centers.length - 1].copy();

        this.edges = this.edges.concat(this.ring.edgesWithOffset(this.vertices.length));
        this.vertices = this.vertices.concat(this.ring.transformVertices());

        var randomX = (this.randomShift) ? this.randomAmount() : 0;
        var randomY = (this.randomShift) ? this.randomAmount() : 0;

        this.ring.translate(randomX, randomY, this.zAmount);
        center.multipliedBy(Canvas3d.Matrix.translation(randomX, randomY, this.zAmount));
        this.centers.push(center);

        if (connectPrevious) {
            for (var j = 0; j < this.ring.vertices.length; j++) 
                this.edges.push([base + j, base + this.ring.vertices.length + j]);
        }
    }
};

Canvas3d.Line = function(length, precision) {
    Canvas3d.Object.call(this);

    var startingLoc = - length / 2;
    var delta = length / precision;

    this.vertices.push(new Canvas3d.Vector4(0, startingLoc, 0, 1));
    for (var i = 1; i <= precision; i++) {
        this.vertices.push(new Canvas3d.Vector4(0, startingLoc + i * delta, 0, 1));
        this.edges.push([i - 1, i]);
    }
};

Canvas3d.Line.prototype = new Canvas3d.Object();
Canvas3d.Line.prototype.constructor = Canvas3d.Line;

Canvas3d.Flag = function(width, height, horizontalPrecision, verticalPrecison) {
    Canvas3d.Object.call(this);

    var startingLoc = - width / 2;
    var delta = width / horizontalPrecision;
    var line = new Canvas3d.Line(height, verticalPrecison);

    line.translate(startingLoc, 0, 0);
    this.edges = this.edges.concat(line.edgesWithOffset(this.vertices.length));
    this.vertices = this.vertices.concat(line.transformVertices());

    for (var i = 1; i <= horizontalPrecision; i++) {
        line.translate(delta, 0, 0);
        this.edges = this.edges.concat(line.edgesWithOffset(this.vertices.length));
        this.vertices = this.vertices.concat(line.transformVertices());
        for (var j = 0; j < line.vertices.length; j++)
            this.edges.push([(i - 1) * line.vertices.length + j, i * line.vertices.length + j]);
    }

    this.width = width;
    this.height = height;
    this.horizontalPrecision = horizontalPrecision;
    this.verticalPrecison = verticalPrecison;
    this.numberOfVerticesPerColumn = line.vertices.length;
};

Canvas3d.Flag.prototype = new Canvas3d.Object();
Canvas3d.Flag.prototype.constructor = Canvas3d.Flag;

Canvas3d.Flag.prototype.noise = function(noiseFunction) {
    for (var i = 0; i <= this.horizontalPrecision; i++) {
        for (var j = 0; j <= this.verticalPrecison; j++) {
            var index = i * this.numberOfVerticesPerColumn + j;
            var x = -  this.width / 2 + i * (this.width  / this.horizontalPrecision);
            var y = - this.height / 2 + j * (this.height / this.verticalPrecison);
            this.vertices[index].values[2] = noiseFunction(x, y);
        }
    }
}
