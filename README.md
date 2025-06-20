# Quaternion 3D to 2D Projection Demo

Demonstrating quaternion mathematics, 3D rotations, and orthographic projection from 3D to 2D space.

## 🚀 How to Run

- Simply double-click `index.html` to open in your default browser


## 📁 Project Structure
```
quaternion-demo/
├── index.html      # Main HTML structure
├── styles.css      # All styling and layout
├── script.js       # JavaScript functionality
└── README.md       # This documentation
```

## 🎮 How to Use

### Controls
- **W, X, Y, Z Sliders**: Adjust quaternion components individually
- **Auto Rotate**: Automatically animates the quaternion for smooth rotation
- **Reset**: Returns all values to identity quaternion (1, 0, 0, 0)
- **Clear Trails**: Removes the motion trails from both views
- **Auto-normalize**: Keeps quaternion normalized (unit quaternion)

### Interface
- **Left Panel**: Control quaternion values and view current state
- **3D View**: Shows the rotating cube in 3D space with perspective projection
- **2D View**: Shows the orthographic projection of a tracked cube corner

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
1. Represent P as pure quaternion: p = 0 + Pxi + Pyj + Pzk
2. Compute: p' = q × p × q*
3. Extract rotated point from p'

#### Matrix-Based Rotation (Used in Demo)
```javascript
// Apply rotation matrix to point
P' = R × P
where P = [x, y, z]ᵀ
```

### 3D to 2D Projection

#### Orthographic Projection
Simple projection onto XY-plane (ignoring Z):
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
