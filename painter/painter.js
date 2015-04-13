initializePainter = function(canvas) {
    var painter = new Painter(canvas);
    /*
    points = [
        new Vector2(0, 0),
        new Vector2(100, 100),
        new Vector2(220, 70),
        new Vector2(220, 70),
        //new Vector2(400, 50),
    ];
    $.each(points, function() {
        this.x += 100;
        this.y += 100;
    });
    painter.interpolate(painter.bezier4(points[0], points[1], points[2], points[3]));
    */
    /*
    for (var i = 0; i < points.length - 1; i+= 2)
        painter.interpolate(painter.bezier(points[i], points[i + 1], points[i + 2]));
    */
    var points = [];
    var down = false;

    repaint = function() {
        painter.clear();
        for (var i = 1; i + 3 < points.length; i += 3)
            painter.interpolate(painter.bezier4(points[i], points[i + 1], points[i + 2], points[i + 3]));
        for (var i = 1; i < points.length; i += 3) {
            painter.drawRectPoint(points[i]);
        }
        painter.drawCirclePoint(points[points.length - 1]);
        if (down) {
            if (points.length >= 4) {
                painter.drawCirclePoint(points[points.length - 4]);
                painter.drawLine(points[points.length - 5], points[points.length - 4]);
            }
            painter.fillRectPoint(points[points.length - 2]);
            painter.drawCirclePoint(points[points.length - 3]);
            painter.drawLine(points[points.length - 3], points[points.length - 2]);
            painter.drawLine(points[points.length - 2], points[points.length - 1]);
        }
    };

    var offset = $(canvas).offset();
    $(canvas).mousedown(function(event) {
        if (down) return;
        down = true;

        var x = event.clientX - offset.left;
        var y = event.clientY - offset.top;

        points.push(new Vector2(x, y));
        points.push(new Vector2(x, y));
        points.push(new Vector2(x, y));

        repaint();
    });
    $(canvas).mousemove(function(event) {
        if (!down) return;

        var x = event.clientX - offset.left;
        var y = event.clientY - offset.top;
        var p1 = points[points.length - 3];
        var p = points[points.length - 2];
        var p2 = points[points.length - 1];

        p2.x = x;
        p2.y = y;
        p1.x = p.x + p.x - p2.x;
        p1.y = p.y + p.y - p2.y;

        repaint();
    });
    $(canvas).mouseup(function(event) {
        down = false;
    });
};

Vector2 = function(x, y) {
    this.x = x;
    this.y = y;
};

Vector2.prototype.add = function(that) {
    return new Vector2(this.x + that.x, this.y + that.y);
};

Vector2.prototype.multiply = function(that) {
    return new Vector2(this.x * that, this.y * that);
}

Painter = function(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
};

Painter.prototype.clear = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Painter.prototype.drawCirclePoint = function(point) {
    this.context.beginPath();
    this.context.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    this.context.fill();
};

Painter.prototype.drawRectPoint = function(point) {
    this.context.beginPath();
    this.context.rect(point.x - 3, point.y - 3, 6, 6);
    this.context.stroke();
};

Painter.prototype.fillRectPoint = function(point) {
    this.context.beginPath();
    this.context.rect(point.x - 3, point.y - 3, 6, 6);
    this.context.fill();
};

Painter.prototype.drawLine = function(point1, point2) {
    this.context.beginPath();
    this.context.moveTo(point1.x, point1.y);
    this.context.lineTo(point2.x, point2.y);
    this.context.stroke();
};

Painter.prototype.interpolate = function(interpolater, precision) {
    precision = precision || 0.01;
    this.context.beginPath();
    var p0 = interpolater(0);
    this.context.moveTo(p0.x, p0.y);
    for (var t = precision; t <= 1; t += precision) {
        var p = interpolater(t);
        this.context.lineTo(p.x, p.y);
    }
    this.context.stroke();
}

Painter.prototype.bezier3 = function(A, B, C) {
    return function(t) {
        return A.multiply(Math.pow(1 - t, 2)).add(B.multiply(2 * t * (1 - t))).add(C.multiply(t * t));
    };
};

Painter.prototype.bezier4 = function(A, B, C, D) {
    return function(t) {
        return A.multiply(Math.pow(1 - t, 3)).add(
               B.multiply(3 * t * Math.pow(1 - t, 2))).add(
               C.multiply(3 * t * t * (1 - t))).add(
               D.multiply(Math.pow(t, 3)));
    };
};
