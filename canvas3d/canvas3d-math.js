Canvas3d.Precision = {'Tolerance': 0.01};

Canvas3d.Matrix = function(rows, columns, initialize) {
    this.rows = rows;
    this.columns = columns;
    if (initialize === undefined || initialize) {
        this.values = [];
        for (var i = rows * columns; i > 0; i--)
            this.values.push(0);
    }
};

Canvas3d.Matrix.prototype.copy = function() {
    var copy = new Canvas3d.Matrix(this.rows, this.columns, false);
    copy.values = this.values.slice();
    return copy;
};

Canvas3d.Matrix.prototype.add = function(that) {
    for (var i = this.values.length - 1; i >= 0; i--)
        this.values[i] += that.values[i];
    return this;
};

Canvas3d.Matrix.prototype.subtract = function(that) {
    for (var i = this.values.length - 1; i >= 0; i--)
        this.values[i] -= that.values[i];
    return this;
};


Canvas3d.Matrix.prototype.multiply = function(that) {
    var result = new Canvas3d.Matrix(this.rows, that.columns);
    for (var i = 0; i < this.rows; i++)
        for (var j = 0; j < that.columns; j++)
            for (var k = 0; k < this.columns; k++)
                result.values[result.columns * i + j] +=
                    this.values[this.columns * i + k] *
                    that.values[that.columns * k + j];

    this.columns = that.columns;
    this.values = result.values;
    return this;
};

Canvas3d.Matrix.identity = function(dimension) {
    var result = new Canvas3d.Matrix(dimension, dimension);
    for (var i = 0; i < dimension; i++)
            result.values[dimension * i + i] = 1;
    return result;
};

Canvas3d.Matrix.translation = function(x, y, z) {
    var result = Canvas3d.Matrix.identity(4);
    for (var i = 0; i < 3; i++)
        result.values[4 * i + 3] = arguments[i];
    return result;
};

Canvas3d.Matrix.scaling = function(x, y, z) {
    var result = Canvas3d.Matrix.identity(4);
    for (var i = 0; i < 3; i++)
        result.values[4 * i + i] = arguments[i];
    return result;
};

Canvas3d.Matrix.rotationIndices = {
    'x': [[1, 1], [1, 2], [2, 1], [2, 2]],
    'y': [[0, 0], [2, 0], [0, 2], [2, 2]],
    'z': [[0, 0], [0, 1], [1, 0], [1, 1]]
};

Canvas3d.Matrix.rotation = function(axis, angle) {
    var result = Canvas3d.Matrix.identity(4);
    var values = [Math.cos(angle), -Math.sin(angle), Math.sin(angle), Math.cos(angle)];
    for (var i in values) {
        var row = Canvas3d.Matrix.rotationIndices[axis][i][0];
        var column = Canvas3d.Matrix.rotationIndices[axis][i][1];
        result.values[4 * row + column] = values[i];
    }
    return result;
};

Canvas3d.Vector4 = function(x, y, z, w) {
    Canvas3d.Matrix.call(this, 4, 1, false);
    this.values = [x, y, z, w];
};

Canvas3d.Vector4.prototype = new Canvas3d.Matrix();

Canvas3d.Vector4.prototype.getX = function() { return this.values[0]; }
Canvas3d.Vector4.prototype.getY = function() { return this.values[1]; }
Canvas3d.Vector4.prototype.getZ = function() { return this.values[2]; }
Canvas3d.Vector4.prototype.getW = function() { return this.values[3]; }

Canvas3d.Vector4.prototype.copy = function() {
    return new Canvas3d.Vector4(this.values[0], this.values[1], this.values[2], this.values[3]);
};

Canvas3d.Vector4.prototype.multipliedBy = function(matrix) {
    var result = [0, 0, 0, 0];
    for (var i = 0; i < 4; i++)
        for (var j = 0; j < 4; j++)
            result[i] += matrix.values[i * 4 + j] * this.values[j];
    this.values = result;
    return this;
};

Canvas3d.Vector4.prototype.length = function() {
    return Math.sqrt(Math.pow(this.values[0], 2) + Math.pow(this.values[1], 2) + Math.pow(this.values[2], 2) + Math.pow(this.values[3], 2));
};

Canvas3d.Vector4.prototype.time = function(factor) {
    for (var i = 0; i < 4; i++)
        this.values[i] *= factor;
    return this;
};

Canvas3d.Vector4.prototype.cross3 = function(that) {
    var x = this.values[1] * that.values[2] - this.values[2] * that.values[1];
    var y = this.values[2] * that.values[0] - this.values[0] * that.values[2];
    var z = this.values[0] * that.values[1] - this.values[1] * that.values[0];
    this.values = [x, y, z, 0];
    return this;
};

Canvas3d.Vector4.prototype.dot = function(that) {
    var result = 0;
    for (var i in this.values)
        result += this.values[i] * that.values[i];
    return result;
};

Canvas3d.Vector4.prototype.normalize = function() {
    var factor = 0;
    for (var i = 0; i < 4; i++)
        factor += Math.pow(this.values[i], 2);
    factor = Math.sqrt(factor);
    if (Math.abs(factor) > Canvas3d.Precision.Tolerance)
        for (var i = 0; i < 4; i++)
            this.values[i] /= factor;
    return this;
};

Canvas3d.Vector4.prototype.dividedByW = function() {
    var w = this.values[3];

    if (Math.abs(w - 1) <= Canvas3d.Precision.Tolerance)
        return this;
    if (Math.abs(w) > Canvas3d.Precision.Tolerance) {
        this.values[0] /= w;
        this.values[1] /= w;
        this.values[2] /= w;
    }
    return this;
};

Canvas3d.Math = {};

Canvas3d.Math.noise = function() {
   var abs = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = Math.abs(x[i]);
      return dst;
   };
   var add = function(x, y, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] + y[i];
      return dst;
   };
   var dot = function(x, y) {
      var z = 0;
      for (var i = 0 ; i < x.length ; i++)
         z += x[i] * y[i];
      return z;
   };
   var fade = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i]*x[i]*x[i]*(x[i]*(x[i]*6.0-15.0)+10.0);
      return dst;
   };
   var floor = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = Math.floor(x[i]);
      return dst;
   };
   var fract = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] - Math.floor(x[i]);
      return dst;
   };
   var gt0 = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] > 0 ? 1 : 0;
      return dst;
   };
   var lt0 = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] < 0 ? 1 : 0;
      return dst;
   };
   var mix = function(x, y, t, dst) {
      if (! Array.isArray(x))
         return x + (y - x) * t;
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] + (y[i] - x[i]) * t;
      return dst;
   };
   var mod289 = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] - Math.floor(x[i] * (1.0 / 289.0)) * 289.0;
      return dst;
   };
   var multiply = function(x, y, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] * y[i];
      return dst;
   };
   var multiplyScalar = function(x, s) {
      for (var i = 0 ; i < x.length ; i++)
         x[i] *= s;
      return x;
   };
   var permute = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         tmp0[i] = (x[i] * 34.0 + 1.0) * x[i];
      mod289(tmp0, dst);
      return dst;
   };
   var scale = function(x, s, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] * s;
      return dst;
   };
   var set3 = function(a, b, c, dst) {
      dst[0] = a;
      dst[1] = b;
      dst[2] = c;
      return dst;
   }
   var set4 = function(a, b, c, d, dst) {
      dst[0] = a;
      dst[1] = b;
      dst[2] = c;
      dst[3] = d;
      return dst;
   }
   var subtract = function(x, y, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] - y[i];
      return dst;
   };
   var taylorInvSqrt = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = 1.79284291400159 - 0.85373472095314 * x[i];
      return dst;
   };

   var HALF4 = [.5,.5,.5,.5];
   var ONE3  = [1,1,1];
   var f     = [0,0,0];
   var f0    = [0,0,0];
   var f1    = [0,0,0];
   var g0    = [0,0,0];
   var g1    = [0,0,0];
   var g2    = [0,0,0];
   var g3    = [0,0,0];
   var g4    = [0,0,0];
   var g5    = [0,0,0];
   var g6    = [0,0,0];
   var g7    = [0,0,0];
   var gx0   = [0,0,0,0];
   var gy0   = [0,0,0,0];
   var gx1   = [0,0,0,0];
   var gy1   = [0,0,0,0];
   var gz0   = [0,0,0,0];
   var gz1   = [0,0,0,0];
   var i0    = [0,0,0];
   var i1    = [0,0,0];
   var ix    = [0,0,0,0];
   var ixy   = [0,0,0,0];
   var ixy0  = [0,0,0,0];
   var ixy1  = [0,0,0,0];
   var iy    = [0,0,0,0];
   var iz0   = [0,0,0,0];
   var iz1   = [0,0,0,0];
   var norm0 = [0,0,0,0];
   var norm1 = [0,0,0,0];
   var nz    = [0,0,0,0];
   var nz0   = [0,0,0,0];
   var nz1   = [0,0,0,0];
   var tmp0  = [0,0,0,0];
   var tmp1  = [0,0,0,0];
   var tmp2  = [0,0,0,0];
   var sz0   = [0,0,0,0];
   var sz1   = [0,0,0,0];
   var t3    = [0,0,0];

   this.noise = function(P) {
      mod289(floor(P, t3), i0);
      mod289(add(i0, ONE3, t3), i1);
      fract(P, f0);
      subtract(f0, ONE3, f1);
      fade(f0, f);

      set4(i0[0], i1[0], i0[0], i1[0], ix );
      set4(i0[1], i0[1], i1[1], i1[1], iy );
      set4(i0[2], i0[2], i0[2], i0[2], iz0);
      set4(i1[2], i1[2], i1[2], i1[2], iz1);

      permute(add(permute(ix, tmp1), iy, tmp2), ixy);
      permute(add(ixy, iz0, tmp1), ixy0);
      permute(add(ixy, iz1, tmp1), ixy1);

      scale(ixy0, 1 / 7, gx0);
      scale(ixy1, 1 / 7, gx1);
      subtract(fract(scale(floor(gx0, tmp1), 1 / 7, tmp2), tmp0), HALF4, gy0);
      subtract(fract(scale(floor(gx1, tmp1), 1 / 7, tmp2), tmp0), HALF4, gy1);
      fract(gx0, gx0);
      fract(gx1, gx1);
      subtract(subtract(HALF4, abs(gx0, tmp1), tmp2), abs(gy0, tmp0), gz0);
      subtract(subtract(HALF4, abs(gx1, tmp1), tmp2), abs(gy1, tmp0), gz1);
      gt0(gz0, sz0);
      gt0(gz1, sz1);

      subtract(gx0, multiply(sz0, subtract(lt0(gx0, tmp1), HALF4, tmp2), tmp0), gx0);
      subtract(gy0, multiply(sz0, subtract(lt0(gy0, tmp1), HALF4, tmp2), tmp0), gy0);
      subtract(gx1, multiply(sz1, subtract(lt0(gx1, tmp1), HALF4, tmp2), tmp0), gx1);
      subtract(gy1, multiply(sz1, subtract(lt0(gy1, tmp1), HALF4, tmp2), tmp0), gy1);

      set3(gx0[0],gy0[0],gz0[0], g0);
      set3(gx0[1],gy0[1],gz0[1], g1);
      set3(gx0[2],gy0[2],gz0[2], g2);
      set3(gx0[3],gy0[3],gz0[3], g3);
      set3(gx1[0],gy1[0],gz1[0], g4);
      set3(gx1[1],gy1[1],gz1[1], g5);
      set3(gx1[2],gy1[2],gz1[2], g6);
      set3(gx1[3],gy1[3],gz1[3], g7);

      taylorInvSqrt(set4(dot(g0,g0), dot(g1,g1), dot(g2,g2), dot(g3,g3), tmp0), norm0);
      taylorInvSqrt(set4(dot(g4,g4), dot(g5,g5), dot(g6,g6), dot(g7,g7), tmp0), norm1);

      multiplyScalar(g0, norm0[0]);
      multiplyScalar(g1, norm0[1]);
      multiplyScalar(g2, norm0[2]);
      multiplyScalar(g3, norm0[3]);

      multiplyScalar(g4, norm1[0]);
      multiplyScalar(g5, norm1[1]);
      multiplyScalar(g6, norm1[2]);
      multiplyScalar(g7, norm1[3]);

      mix(set4(g0[0] * f0[0] + g0[1] * f0[1] + g0[2] * f0[2],
               g1[0] * f1[0] + g1[1] * f0[1] + g1[2] * f0[2],
               g2[0] * f0[0] + g2[1] * f1[1] + g2[2] * f0[2],
               g3[0] * f1[0] + g3[1] * f1[1] + g3[2] * f0[2], tmp1),

          set4(g4[0] * f0[0] + g4[1] * f0[1] + g4[2] * f1[2],
               g5[0] * f1[0] + g5[1] * f0[1] + g5[2] * f1[2],
               g6[0] * f0[0] + g6[1] * f1[1] + g6[2] * f1[2],
               g7[0] * f1[0] + g7[1] * f1[1] + g7[2] * f1[2], tmp2), f[2], nz);

      return 2.2 * mix(mix(nz[0],nz[2],f[1]), mix(nz[1],nz[3],f[1]), f[0]);
   };
};

Canvas3d.Math.noise();

Canvas3d.Math.turbulence = function(p, maxPower) {
    var pow = 1.0;
    var sum = 0.0;

    maxPower = (maxPower == undefined) ? 10 : maxPower;

    for (var i = 0; i < maxPower; i++) {
        sum += Math.abs(Canvas3d.Math.noise(p) * pow) / pow;
        pow *= 2.0;
    }

    return sum;
};