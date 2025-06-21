# Quaternion 3D to 2D Projection Demo

Demonstrating quaternion mathematics, 3D rotations, and orthographic projection from 3D to 2D space. I have modified my code so that it can read from an input file and created two versions for this purpose.

# Version 1

This version consists mainly of old code with a slightly modified `script.js` for reading input files and a modified `index.html` for new buttons.

## 🚀 How to Run

- Please open `index.html` using 'Go Live' from your console.

## 📁 Project Structure

```
quaternion-visualization/
├── index.html      # Main HTML structure
├── styles.css      # All styling and layout
├── script.js       # JavaScript functionality
└── README.md       # This documentation
```

# Version 2

This version consists only of `index_2.html`, which contains minimalistic code demonstrating how to continuously use input file information for object movement.

## 🚀 How to Run

- You can directly double-click this file in the folder.

## 🧮 Mathematical Foundation

### Quaternions

A quaternion is a mathematical system extending complex numbers, represented as:

```
q = w + xi + yj + zk
```

Where:
- **w**: Real (scalar) component
- **x, y, z**: Imaginary (vector) components
- **i, j, k**: Fundamental quaternion units

#### Quaternion Properties

- **Unit Quaternion**: |q| = √(w² + x² + y² + z²) = 1
- **Conjugate**: q* = w - xi - yj - zk
- **Inverse**: q⁻¹ = q*/|q|²

### Rotation Representation

#### Axis-Angle to Quaternion

For rotation by angle θ around axis (ax, ay, az):

```
w = cos(θ/2)
x = ax × sin(θ/2)
y = ay × sin(θ/2)
z = az × sin(θ/2)
```

#### Quaternion to Rotation Matrix

Given quaternion q = (w, x, y, z), the rotation matrix R is:

```
R = [1-2(y²+z²)   2(xy-wz)   2(xz+wy)]
    [2(xy+wz)   1-2(x²+z²)   2(yz-wx)]
    [2(xz-wy)   2(yz+wx)   1-2(x²+y²)]
```

### 3D Transformations

#### Point Rotation Using Quaternions

To rotate point P by quaternion q:
1. Represent P as a pure quaternion: p = 0 + Pxi + Pyj + Pzk
2. Compute: p' = q × p × q*
3. Extract the rotated point from p'

#### Matrix-Based Rotation (Used in Demo)

```javascript
// Apply rotation matrix to point
P' = R × P
where P = [x, y, z]ᵀ
```

### 3D to 2D Projection

#### Orthographic Projection

Simple projection onto the XY-plane (ignoring Z):

```
P₂D = [Px, Py]
```

#### Perspective Projection (Used for 3D Visualization)

```
scale = viewDistance / (viewDistance + z × depthFactor)
P₂D = [x × scale, y × scale]
```

### Mathematical Operations in Code

#### Quaternion Normalization

```javascript
magnitude = √(w² + x² + y² + z²)
qₙ = [w/magnitude, x/magnitude, y/magnitude, z/magnitude]
```

#### Rotation Matrix Construction

```javascript
// From quaternion components
R₀₀ = 1 - 2(y² + z²)
R₀₁ = 2(xy - wz)
R₀₂ = 2(xz + wy)
// ... (continue for all 9 elements)
```
