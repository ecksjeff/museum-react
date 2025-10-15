import React, { useEffect, useRef, useState } from 'react';
import * as pc from 'playcanvas';

function PlayCanvasMuseum() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const isInitializing = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // --- Handle window resize ---
  useEffect(() => {
    const updateSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateSize(); // set initial
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // --- Initialize PlayCanvas only once ---
  useEffect(() => {
    if (!canvasRef.current) return;
    if (canvasSize.width === 0 || canvasSize.height === 0) return;
    if (isInitializing.current || appRef.current) return;

    isInitializing.current = true;
    console.log('Initializing PlayCanvas once with size:', canvasSize);

    const canvas = canvasRef.current;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    const app = new pc.Application(canvas, {
      mouse: new pc.Mouse(canvas),
      keyboard: new pc.Keyboard(window)
    });

    appRef.current = app;

    app.scene.clearColor = new pc.Color(0.95, 0.95, 0.95);

    const camera = new pc.Entity('camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.95, 0.95, 0.95),
      farClip: 1000,
      fov: 70
    });
    camera.setPosition(0, 1.5, 0);
    camera.lookAt(0, 1.5, 5);
    app.root.addChild(camera);
    app.start();

    console.log('Loading splat...');
    const splatUrl = "https://pub-b1b1a0b8a789411aa54abb9c340ba12e.r2.dev/splats/Splat5_V2.sog";
    const asset = new pc.Asset('museum-splat', 'gsplat', { url: splatUrl });

    asset.on('load', () => {
      console.log('Splat loaded! Adding to running scene...');
      const splatEntity = new pc.Entity('splat');
      splatEntity.addComponent('gsplat', { asset: asset.id });
      splatEntity.setPosition(0, 0, 0);
      splatEntity.setLocalScale(1.2, 1.2, 1.2);
      splatEntity.setEulerAngles(180, 0, 0);
      app.root.addChild(splatEntity);

      setIsLoaded(true);
      addMouseLook(app, camera, canvas);
      addWASDMovement(app, camera);
    });

    asset.on('error', (err) => console.error('Error loading splat:', err));
    app.assets.add(asset);
    app.assets.load(asset);
  }, [canvasSize.width, canvasSize.height]);

  // --- Only clean up when the component unmounts ---
  useEffect(() => {
    return () => {
      console.log('Cleaning up PlayCanvas on unmount...');
      if (appRef.current) {
        appRef.current.destroy();
        appRef.current = null;
      }
      isInitializing.current = false;
    };
  }, []);


  useEffect(() => {
    const handleResize = () => {
      if (appRef.current && canvasRef.current) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const canvas = canvasRef.current;

        // Resize DOM canvas
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.width = width;
        canvas.height = height;

        // Resize PlayCanvas internal buffers
        appRef.current.resizeCanvas(width, height);

        // Fix camera aspect ratio
        const cameraEntity = appRef.current.root.findByName('camera');
        if (cameraEntity && cameraEntity.camera) {
          cameraEntity.camera.aspectRatio = width / height;
          cameraEntity.camera.calculateProjection();
        }
      }
    };

    // Run once immediately and on every resize
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#000' }}>
      {!isLoaded && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: '#fff', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', zIndex: 9999, color: 'grey'
        }}>
          <h2 style={{ marginBottom: '20px' }}>Loading Museum...</h2>
          <div style={{
            width: '300px', height: '20px', background: 'rgba(200,200,200,0.3)',
            borderRadius: '10px', overflow: 'hidden', border: '1px solid #ccc'
          }}>
            <div style={{
              width: `${loadProgress}%`, height: '100%',
              background: 'linear-gradient(90deg, #b9b9b9ff, #a7a7a7ff)',
              transition: 'width 0.3s ease'
            }}/>
          </div>
          <p style={{ marginTop: '10px', fontSize: '14px' }}>{Math.round(loadProgress)}%</p>
        </div>
      )}

      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {isLoaded && (
        <div style={{
          position: 'absolute', top: '20px', left: '20px',
          color: 'white', background: 'rgba(0, 0, 0, 0.7)',
          padding: '15px', borderRadius: '8px', fontSize: '14px', zIndex: 100
        }}>
          <div><strong>PlayCanvas Test</strong></div>
          <div>Click & drag to look around</div>
          <div>Status: ✓ Loaded</div>
        </div>
      )}
    </div>
  );
}

// Simple mouse look controls
function addMouseLook(app, camera, canvas) {
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  const rotation = { x: 0, y: 0 };

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.style.cursor = 'grabbing';
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastX;
    const deltaY = e.clientY - lastY;
    rotation.y += deltaX * 0.1;
    rotation.x -= deltaY * 0.1;
    rotation.x = Math.max(-85, Math.min(85, rotation.x));
    camera.setLocalEulerAngles(rotation.x, rotation.y, 0);
    lastX = e.clientX;
    lastY = e.clientY;
  });

  ['mouseup', 'mouseleave'].forEach(evt =>
    canvas.addEventListener(evt, () => {
      isDragging = false;
      canvas.style.cursor = 'grab';
    })
  );

  canvas.style.cursor = 'grab';
}

// WASD controls
function addWASDMovement(app, camera) {
  const keys = {};
  const moveSpeed = 3.0;

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  app.on('update', (dt) => {
    const pos = camera.getPosition().clone();

    if (keys['KeyW'] || keys['ArrowUp']) {
      const forward = camera.forward.clone().mulScalar(moveSpeed * dt);
      pos.add(forward);
    }
    if (keys['KeyS'] || keys['ArrowDown']) {
      const forward = camera.forward.clone().mulScalar(moveSpeed * dt);
      pos.sub(forward);
    }
    if (keys['KeyA'] || keys['ArrowLeft']) {
      const right = camera.right.clone().mulScalar(moveSpeed * dt);
      pos.sub(right);
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
      const right = camera.right.clone().mulScalar(moveSpeed * dt);
      pos.add(right);
    }

    // Keep camera within bounds (adjust these to match your room)
    pos.x = Math.max(-8, Math.min(0, pos.x));
    pos.z = Math.max(-4, Math.min(4, pos.z));
    pos.y = 1.5; // Keep at standing height

    camera.setPosition(pos);
  });
}

export default PlayCanvasMuseum;
