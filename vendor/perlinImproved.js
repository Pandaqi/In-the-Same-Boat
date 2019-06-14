/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */

function Grad(x, y, z, w = 0) {
  this.x = x; this.y = y; this.z = z; this.w = w;
}

Grad.prototype.dot2 = function(x, y) {
  return this.x*x + this.y*y;
};

Grad.prototype.dot3 = function(x, y, z) {
  return this.x*x + this.y*y + this.z*z;
};

Grad.prototype.dot4 = function(x, y, z, w) {
  return this.x*x + this.y*y + this.z*z + this.w*w;
};


var grad3 = [new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),
             new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),
             new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];

var grad4 = [new Grad(1,1,1,0),new Grad(-1,1,1,0),new Grad(1,-1,1,0),new Grad(1,1,-1,0),
             new Grad(-1,-1,1,0),new Grad(1,-1,-1,0),new Grad(-1,1,-1,0),new Grad(-1,-1,-1,0),

             new Grad(1,1,0,1),new Grad(-1,1,0,1),new Grad(1,-1,0,1),new Grad(1,1,0,-1),
             new Grad(-1,-1,0,1),new Grad(1,-1,0,-1),new Grad(-1,1,0,-1),new Grad(-1,-1,0,-1),

             new Grad(1,0,1,1),new Grad(-1,0,1,1),new Grad(1,0,-1,1),new Grad(1,0,1,-1),
             new Grad(-1,0,-1,1),new Grad(1,0,-1,-1),new Grad(-1,0,1,-1),new Grad(-1,0,-1,-1),

             new Grad(0,1,1,1),new Grad(0,-1,1,1),new Grad(0,1,-1,1),new Grad(0,1,1,-1),
             new Grad(0,-1,-1,1),new Grad(0,1,-1,-1),new Grad(0,-1,1,-1),new Grad(0,-1,-1,-1)];

var p = [151,160,137,91,90,15,
131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
// To remove the need for index wrapping, double the permutation table length
var perm = new Array(512);
var gradP = new Array(512);

//noise.seed(0);

// ##### Perlin noise stuff

function fade(t) {
  return t*t*t*(t*(t*6-15)+10);
}

function lerp(a, b, t) {
  return (1-t)*a + t*b;
}

module.exports = {
  // This isn't a very good seeding function, but it works ok. It supports 2^16
  // different seed values. Write something better if you need more seeds.
  seed: function(seed) {
    if(seed > 0 && seed < 1) {
      // Scale the seed out
      seed *= 65536;
    }

    seed = Math.floor(seed);
    if(seed < 256) {
      seed |= seed << 8;
    }

    for(var i = 0; i < 256; i++) {
      var v;
      if (i & 1) {
        v = p[i] ^ (seed & 255);
      } else {
        v = p[i] ^ ((seed>>8) & 255);
      }

      perm[i] = perm[i + 256] = v;
      gradP[i] = gradP[i + 256] = grad4[v % 32] //= grad3[v % 12];
    }
  },

  // 2D Perlin Noise
  perlin2: function(x, y) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y);
    // Get relative xy coordinates of point within that cell
    x = x - X; y = y - Y;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255; Y = Y & 255;

    // Calculate noise contributions from each of the four corners
    var n00 = gradP[X+perm[Y]].dot2(x, y);
    var n01 = gradP[X+perm[Y+1]].dot2(x, y-1);
    var n10 = gradP[X+1+perm[Y]].dot2(x-1, y);
    var n11 = gradP[X+1+perm[Y+1]].dot2(x-1, y-1);

    // Compute the fade curve value for x
    var u = fade(x);

    // Interpolate the four results
    return lerp(
        lerp(n00, n10, u),
        lerp(n01, n11, u),
       fade(y));
  },

  // 3D Perlin Noise
  perlin3: function(x, y, z) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
    // Get relative xyz coordinates of point within that cell
    x = x - X; y = y - Y; z = z - Z;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255; Y = Y & 255; Z = Z & 255;

    // Calculate noise contributions from each of the eight corners
    var n000 = gradP[X+  perm[Y+  perm[Z  ]]].dot3(x,   y,     z);
    var n001 = gradP[X+  perm[Y+  perm[Z+1]]].dot3(x,   y,   z-1);
    var n010 = gradP[X+  perm[Y+1+perm[Z  ]]].dot3(x,   y-1,   z);
    var n011 = gradP[X+  perm[Y+1+perm[Z+1]]].dot3(x,   y-1, z-1);
    var n100 = gradP[X+1+perm[Y+  perm[Z  ]]].dot3(x-1,   y,   z);
    var n101 = gradP[X+1+perm[Y+  perm[Z+1]]].dot3(x-1,   y, z-1);
    var n110 = gradP[X+1+perm[Y+1+perm[Z  ]]].dot3(x-1, y-1,   z);
    var n111 = gradP[X+1+perm[Y+1+perm[Z+1]]].dot3(x-1, y-1, z-1);

    // Compute the fade curve value for x, y, z
    var u = fade(x);
    var v = fade(y);
    var w = fade(z);

    // Interpolate
    return lerp(
        lerp(
          lerp(n000, n100, u),
          lerp(n001, n101, u), w),
        lerp(
          lerp(n010, n110, u),
          lerp(n011, n111, u), w),
       v);
  },

  // 4d perlin noise
  perlin4: function(  x,  y,  z,  w ) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z), W = Math.floor(w);
    // Get relative xyzw coordinates of point within that cell
    x = x - X; y = y - Y; z = z - Z; w = w - W;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255; Y = Y & 255; Z = Z & 255; W = W & 255;

    // Calculate noise contributions from each of the SIXTEEN corners
    // (Just follow the patterns; every unique combination must appear exactly once)
    var n0000 = gradP[X+  perm[Y+  perm[Z+  perm[W  ]]]].dot4(x,     y,     z,     w);
    var n0001 = gradP[X+  perm[Y+  perm[Z+  perm[W+1]]]].dot4(x,     y,     z,     w-1);
    var n0010 = gradP[X+  perm[Y+  perm[Z+1+perm[W  ]]]].dot4(x,     y,     z-1,   w);
    var n0011 = gradP[X+  perm[Y+  perm[Z+1+perm[W+1]]]].dot4(x,     y,     z-1,   w-1);
    var n0100 = gradP[X+  perm[Y+1+perm[Z+  perm[W  ]]]].dot4(x,     y-1,   z,     w);
    var n0101 = gradP[X+  perm[Y+1+perm[Z+  perm[W+1]]]].dot4(x,     y-1,   z,     w-1);
    var n0110 = gradP[X+  perm[Y+1+perm[Z+1+perm[W  ]]]].dot4(x,     y-1,   z-1,   w);
    var n0111 = gradP[X+  perm[Y+1+perm[Z+1+perm[W+1]]]].dot4(x,     y-1,   z-1,   w-1);
    var n1000 = gradP[X+1+perm[Y+  perm[Z+  perm[W  ]]]].dot4(x-1,   y,     z,     w);
    var n1001 = gradP[X+1+perm[Y+  perm[Z+  perm[W+1]]]].dot4(x-1,   y,     z,     w-1);
    var n1010 = gradP[X+1+perm[Y+  perm[Z+1+perm[W  ]]]].dot4(x-1,   y,     z-1,   w);
    var n1011 = gradP[X+1+perm[Y+  perm[Z+1+perm[W+1]]]].dot4(x-1,   y,     z-1,   w-1);
    var n1100 = gradP[X+1+perm[Y+1+perm[Z+  perm[W  ]]]].dot4(x-1,   y-1,   z,     w);
    var n1101 = gradP[X+1+perm[Y+1+perm[Z+  perm[W+1]]]].dot4(x-1,   y-1,   z,     w-1);
    var n1110 = gradP[X+1+perm[Y+1+perm[Z+1+perm[W  ]]]].dot4(x-1,   y-1,   z-1,   w);
    var n1111 = gradP[X+1+perm[Y+1+perm[Z+1+perm[W+1]]]].dot4(x-1,   y-1,   z-1,   w-1);

    // Compute the fade curve value for x, y, z, w
    var a = fade(x);
    var b = fade(y);
    var c = fade(z);
    var d = fade(w);

    // Interpolate between all these points
    // Essentially, we interpolate one axis at a time: 
    // first the d axis, the result of that interpolated against c, the result of THAT interpolated against b, and finally those results interpolated against a
    return lerp(
            lerp(
                lerp(
                    lerp(n0000, n0001, d),
                    lerp(n0010, n0011, d),
                    c),

                lerp(
                    lerp(n0100, n0101, d),
                    lerp(n0110, n0111, d),
                    c),
                
                b), 

            lerp(
                lerp(
                    lerp(n1000, n1001, d),
                    lerp(n1010, n1011, d),
                    c),
                
                lerp(
                    lerp(n1100, n1101, d),
                    lerp(n1110, n1111, d),
                    c),

                b),

            a)
    }
}
