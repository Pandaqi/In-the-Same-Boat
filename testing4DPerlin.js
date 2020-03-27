// Find unit grid cell containing point
var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z), W = Math.floor(w);
// Get relative xyzw coordinates of point within that cell
x = x - X; y = y - Y; z = z - Z; w = w - W;
// Wrap the integer cells at 255 (smaller integer period can be introduced here)
X = X & 255; Y = Y & 255; Z = Z & 255; w = W & 255;

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
// first the d axis, the result of that interpolated against c, 
// the result of THAT interpolated against b, 
// and finally those results interpolated against a
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
