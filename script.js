// Canvas setup
const canvas3d = document.getElementById('canvas3d');
const ctx3d = canvas3d.getContext('2d');
const canvas2d = document.getElementById('canvas2d');
const ctx2d = canvas2d.getContext('2d');

// Control elements
const controls = {
    w: { slider: document.getElementById('w-slider'), input: document.getElementById('w-input') },
    x: { slider: document.getElementById('x-slider'), input: document.getElementById('x-input') },
    y: { slider: document.getElementById('y-slider'), input: document.getElementById('y-input') },
    z: { slider: document.getElementById('z-slider'), input: document.getElementById('z-input') }
};

// State
let quaternion = { w: 1, x: 0, y: 0, z: 0 };
let position3d = { x: 0, y: 0, z: 0 }; // Fixed position for the cube center
let isAutoRotating = false;
let trails3d = [];
let trails2d = [];
let animationId;

// Quaternion math functions
function normalizeQuaternion(q) {
    const magnitude = Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z);
    if (magnitude === 0) return { w: 1, x: 0, y: 0, z: 0 };
    return {
        w: q.w / magnitude,
        x: q.x / magnitude,
        y: q.y / magnitude,
        z: q.z / magnitude
    };
}

function quaternionToMatrix(q) {
    const { w, x, y, z } = q;
    return [
        [1 - 2*(y*y + z*z), 2*(x*y - w*z), 2*(x*z + w*y)],
        [2*(x*y + w*z), 1 - 2*(x*x + z*z), 2*(y*z - w*x)],
        [2*(x*z - w*y), 2*(y*z + w*x), 1 - 2*(x*x + y*y)]
    ];
}

function applyQuaternionRotation(q, point) {
    const matrix = quaternionToMatrix(q);
    return {
        x: matrix[0][0] * point.x + matrix[0][1] * point.y + matrix[0][2] * point.z,
        y: matrix[1][0] * point.x + matrix[1][1] * point.y + matrix[1][2] * point.z,
        z: matrix[2][0] * point.x + matrix[2][1] * point.y + matrix[2][2] * point.z
    };
}

// 3D to 2D projection
function project3dTo2d(point3d) {
    // Simple orthographic projection (X-Y plane)
    return {
        x: point3d.x,
        y: point3d.y
    };
}

// 3D Projection functions
function project3dPoint(point, viewDistance = 400) {
    // Perspective projection
    const scale = viewDistance / (viewDistance + point.z * 100);
    return {
        x: point.x * scale * 100,
        y: point.y * scale * 100,
        z: point.z
    };
}

function draw3DCube(ctx, centerX, centerY, quaternion, position, size = 50) {
    // Define cube vertices (centered at origin)
    const vertices = [
        {x: -0.5, y: -0.5, z: -0.5}, {x: 0.5, y: -0.5, z: -0.5}, {x: 0.5, y: 0.5, z: -0.5}, {x: -0.5, y: 0.5, z: -0.5}, // back face
        {x: -0.5, y: -0.5, z: 0.5},  {x: 0.5, y: -0.5, z: 0.5},  {x: 0.5, y: 0.5, z: 0.5},  {x: -0.5, y: 0.5, z: 0.5}   // front face
    ];
    
    // Apply quaternion rotation to each vertex (around origin)
    const rotatedVertices = vertices.map(v => applyQuaternionRotation(quaternion, v));
    
    // Translate vertices to cube position
    const translatedVertices = rotatedVertices.map(v => ({
        x: v.x + position.x,
        y: v.y + position.y,
        z: v.z + position.z
    }));
    
    // Project to 2D with perspective
    const projectedVertices = translatedVertices.map(v => project3dPoint(v));
    
    // Define cube faces (indices into vertices array)
    const faces = [
        [0, 1, 2, 3], // back face
        [4, 7, 6, 5], // front face
        [0, 4, 5, 1], // bottom face
        [2, 6, 7, 3], // top face
        [0, 3, 7, 4], // left face
        [1, 5, 6, 2]  // right face
    ];
    
    // Calculate face centers for z-sorting
    const facesWithDepth = faces.map((face, idx) => {
        const faceCenter = face.reduce((sum, vertexIdx) => ({
            x: sum.x + translatedVertices[vertexIdx].x,
            y: sum.y + translatedVertices[vertexIdx].y,
            z: sum.z + translatedVertices[vertexIdx].z
        }), {x: 0, y: 0, z: 0});
        faceCenter.x /= face.length;
        faceCenter.y /= face.length;
        faceCenter.z /= face.length;
        
        return { face, depth: faceCenter.z, index: idx };
    });
    
    // Sort faces by depth (back to front)
    facesWithDepth.sort((a, b) => a.depth - b.depth);
    
    // Face colors
    const faceColors = [
        '#004488', '#0088ff', '#440088', '#8800ff', '#884400', '#ff8800'
    ];
    
    // Draw faces
    facesWithDepth.forEach(({face, index}) => {
        ctx.fillStyle = faceColors[index];
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        face.forEach((vertexIdx, i) => {
            const vertex = projectedVertices[vertexIdx];
            const x = centerX + vertex.x;
            const y = centerY - vertex.y;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    });
    
    // Draw wireframe edges for better visibility
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.8;
    
    const edges = [
        [0,1], [1,2], [2,3], [3,0], // back face edges
        [4,5], [5,6], [6,7], [7,4], // front face edges
        [0,4], [1,5], [2,6], [3,7]  // connecting edges
    ];
    
    edges.forEach(([start, end]) => {
        const startVertex = projectedVertices[start];
        const endVertex = projectedVertices[end];
        
        ctx.beginPath();
        ctx.moveTo(centerX + startVertex.x, centerY - startVertex.y);
        ctx.lineTo(centerX + endVertex.x, centerY - endVertex.y);
        ctx.stroke();
    });
    
    ctx.globalAlpha = 1;
}

// Drawing functions
function draw3dScene() {
    ctx3d.clearRect(0, 0, canvas3d.width, canvas3d.height);
    
    const centerX = canvas3d.width / 2;
    const centerY = canvas3d.height / 2;
    const scale = 80;
    
    // Draw 3D grid (perspective grid)
    ctx3d.strokeStyle = '#333';
    ctx3d.lineWidth = 1;
    
    // Draw grid lines with perspective
    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            const gridPoint1 = project3dPoint({x: i * 0.5, y: j * 0.5, z: -1});
            const gridPoint2 = project3dPoint({x: i * 0.5, y: j * 0.5, z: 1});
            
            ctx3d.globalAlpha = 0.3;
            ctx3d.beginPath();
            ctx3d.moveTo(centerX + gridPoint1.x, centerY - gridPoint1.y);
            ctx3d.lineTo(centerX + gridPoint2.x, centerY - gridPoint2.y);
            ctx3d.stroke();
            ctx3d.globalAlpha = 1;
        }
    }
    
    // Draw 3D axes
    const axisLength = 1.2;
    const origin = {x: 0, y: 0, z: 0};
    const xAxis = project3dPoint({x: axisLength, y: 0, z: 0});
    const yAxis = project3dPoint({x: 0, y: axisLength, z: 0});
    const zAxis = project3dPoint({x: 0, y: 0, z: axisLength});
    
    // X axis (red)
    ctx3d.strokeStyle = '#ff4444';
    ctx3d.lineWidth = 3;
    ctx3d.beginPath();
    ctx3d.moveTo(centerX, centerY);
    ctx3d.lineTo(centerX + xAxis.x, centerY - xAxis.y);
    ctx3d.stroke();
    
    // Y axis (green)
    ctx3d.strokeStyle = '#44ff44';
    ctx3d.beginPath();
    ctx3d.moveTo(centerX, centerY);
    ctx3d.lineTo(centerX + yAxis.x, centerY - yAxis.y);
    ctx3d.stroke();
    
    // Z axis (blue)
    ctx3d.strokeStyle = '#4444ff';
    ctx3d.beginPath();
    ctx3d.moveTo(centerX, centerY);
    ctx3d.lineTo(centerX + zAxis.x, centerY - zAxis.y);
    ctx3d.stroke();
    
    // Draw 3D trails - now tracking a corner of the rotated cube
    ctx3d.strokeStyle = '#00ff88';
    ctx3d.lineWidth = 2;
    ctx3d.globalAlpha = 0.4;
    for (let i = 1; i < trails3d.length; i++) {
        const prev = project3dPoint(trails3d[i - 1]);
        const curr = project3dPoint(trails3d[i]);
        ctx3d.beginPath();
        ctx3d.moveTo(centerX + prev.x, centerY - prev.y);
        ctx3d.lineTo(centerX + curr.x, centerY - curr.y);
        ctx3d.stroke();
    }
    ctx3d.globalAlpha = 1;
    
    // Draw the 3D cube
    draw3DCube(ctx3d, centerX, centerY, quaternion, position3d);
}

function draw2dScene() {
    ctx2d.clearRect(0, 0, canvas2d.width, canvas2d.height);
    
    const centerX = canvas2d.width / 2;
    const centerY = canvas2d.height / 2;
    const scale = 100;
    
    // Draw grid
    ctx2d.strokeStyle = '#333';
    ctx2d.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
        ctx2d.beginPath();
        ctx2d.moveTo(centerX + i * scale / 3, 0);
        ctx2d.lineTo(centerX + i * scale / 3, canvas2d.height);
        ctx2d.stroke();
        
        ctx2d.beginPath();
        ctx2d.moveTo(0, centerY + i * scale / 3);
        ctx2d.lineTo(canvas2d.width, centerY + i * scale / 3);
        ctx2d.stroke();
    }
    
    // Draw axes
    ctx2d.strokeStyle = '#666';
    ctx2d.lineWidth = 2;
    ctx2d.beginPath();
    ctx2d.moveTo(centerX, 0);
    ctx2d.lineTo(centerX, canvas2d.height);
    ctx2d.stroke();
    
    ctx2d.beginPath();
    ctx2d.moveTo(0, centerY);
    ctx2d.lineTo(canvas2d.width, centerY);
    ctx2d.stroke();
    
    // Draw trails
    ctx2d.strokeStyle = '#00ff88';
    ctx2d.lineWidth = 1;
    ctx2d.globalAlpha = 0.3;
    for (let i = 1; i < trails2d.length; i++) {
        const prev = trails2d[i - 1];
        const curr = trails2d[i];
        ctx2d.beginPath();
        ctx2d.moveTo(centerX + prev.x * scale, centerY - prev.y * scale);
        ctx2d.lineTo(centerX + curr.x * scale, centerY - curr.y * scale);
        ctx2d.stroke();
    }
    ctx2d.globalAlpha = 1;
    
    // Project 3D position to 2D - now shows the tracked corner position
    const pos2d = project3dTo2d(trails3d.length > 0 ? trails3d[trails3d.length - 1] : { x: 0.5, y: 0.5, z: 0.5 });
    
    // Draw 2D object
    ctx2d.fillStyle = '#00ff88';
    ctx2d.fillRect(centerX + pos2d.x * scale - 5, centerY - pos2d.y * scale - 5, 10, 10);
    
    // Draw object outline
    ctx2d.strokeStyle = '#ffffff';
    ctx2d.lineWidth = 2;
    ctx2d.strokeRect(centerX + pos2d.x * scale - 5, centerY - pos2d.y * scale - 5, 10, 10);
}

function updateDisplay() {
    // Update quaternion display
    document.getElementById('quat-display').textContent = 
        `w: ${quaternion.w.toFixed(3)}, x: ${quaternion.x.toFixed(3)}, y: ${quaternion.y.toFixed(3)}, z: ${quaternion.z.toFixed(3)}`;
    
    // Update 3D position display - now shows the tracked corner
    const trackedCorner = trails3d.length > 0 ? trails3d[trails3d.length - 1] : { x: 0.5, y: 0.5, z: 0.5 };
    document.getElementById('pos3d').textContent = 
        `x: ${trackedCorner.x.toFixed(3)}, y: ${trackedCorner.y.toFixed(3)}, z: ${trackedCorner.z.toFixed(3)}`;
    
    // Update 2D position display
    const pos2d = project3dTo2d(trackedCorner);
    document.getElementById('pos2d').textContent = 
        `x: ${pos2d.x.toFixed(3)}, y: ${pos2d.y.toFixed(3)}`;
    
    // Update rotation matrix display
    const matrix = quaternionToMatrix(quaternion);
    document.getElementById('rotation-matrix').innerHTML = 
        matrix.map(row => `[${row.map(val => val.toFixed(2)).join(', ')}]`).join('<br>');
}

function updateQuaternion() {
    quaternion.w = parseFloat(controls.w.slider.value);
    quaternion.x = parseFloat(controls.x.slider.value);
    quaternion.y = parseFloat(controls.y.slider.value);
    quaternion.z = parseFloat(controls.z.slider.value);
    
    if (document.getElementById('normalize').checked) {
        quaternion = normalizeQuaternion(quaternion);
        
        // Update controls with normalized values
        controls.w.slider.value = quaternion.w;
        controls.w.input.value = quaternion.w;
        controls.x.slider.value = quaternion.x;
        controls.x.input.value = quaternion.x;
        controls.y.slider.value = quaternion.y;
        controls.y.input.value = quaternion.y;
        controls.z.slider.value = quaternion.z;
        controls.z.input.value = quaternion.z;
    }
    
    // Track a specific corner of the cube to show its path
    const trackedCorner = { x: 0.5, y: 0.5, z: 0.5 }; // One corner of the cube
    const rotatedCorner = applyQuaternionRotation(quaternion, trackedCorner);
    
    // Add to trails
    trails3d.push({ ...rotatedCorner });
    trails2d.push(project3dTo2d(rotatedCorner));
    
    // Limit trail length
    if (trails3d.length > 100) {
        trails3d.shift();
        trails2d.shift();
    }
    
    updateDisplay();
    draw3dScene();
    draw2dScene();
}

// Event listeners
Object.entries(controls).forEach(([key, control]) => {
    control.slider.addEventListener('input', (e) => {
        control.input.value = e.target.value;
        updateQuaternion();
    });
    
    control.input.addEventListener('input', (e) => {
        control.slider.value = e.target.value;
        updateQuaternion();
    });
});

// Animation functions
function autoRotate() {
    if (isAutoRotating) {
        isAutoRotating = false;
        cancelAnimationFrame(animationId);
        return;
    }
    
    isAutoRotating = true;
    let time = 0;
    
    function animate() {
        if (!isAutoRotating) return;
        
        time += 0.02;
        
        // Create smooth rotation
        controls.w.slider.value = Math.cos(time * 0.5);
        controls.x.slider.value = Math.sin(time * 0.3) * 0.5;
        controls.y.slider.value = Math.cos(time * 0.7) * 0.5;
        controls.z.slider.value = Math.sin(time * 0.4) * 0.3;
        
        // Update inputs
        Object.entries(controls).forEach(([key, control]) => {
            control.input.value = control.slider.value;
        });
        
        updateQuaternion();
        animationId = requestAnimationFrame(animate);
    }
    
    animate();
}

function reset() {
    isAutoRotating = false;
    cancelAnimationFrame(animationId);
    
    controls.w.slider.value = 1;
    controls.w.input.value = 1;
    controls.x.slider.value = 0;
    controls.x.input.value = 0;
    controls.y.slider.value = 0;
    controls.y.input.value = 0;
    controls.z.slider.value = 0;
    controls.z.input.value = 0;
    
    clearTrails();
    updateQuaternion();
}

function clearTrails() {
    trails3d = [];
    trails2d = [];
    draw3dScene();
    draw2dScene();
}

// Initialize
updateQuaternion();