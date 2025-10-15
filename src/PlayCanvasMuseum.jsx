import React, { useEffect, useRef, useState } from 'react';
import * as pc from 'playcanvas';

// family photo tabletop array
const familyPhotos = [
{
    src: 'images/family/roz_41.jpg',
    caption: '(L-R) Eugene Wyman, Roz Wyman, Oliver Wyman, Samantha Wyman, 2011'
},
{
    src: 'images/family/roz_1.jpg', 
    caption: 'B&W, Oscar Wiener (L) Sarah Wiener (R) in their pharmacy, 1950s'
},
{
    src: 'images/family/roz_2.jpg', 
    caption: 'B&W, Oscar Wiener (L) Sarah Wiener (R) in their pharmacy, 1931'
},
{
    src: 'images/family/roz_3.jpg', 
    caption: 'B&W, Roz Wiener in front of her mother.s Franklin D. Roosevelt poster that was hung up at the pharmacy, 1932'
},
{
    src: 'images/family/roz_20.jpg', 
    caption: "B&W, vintage print, Betty Wyman (L) Bob Wyman (center L), Roz Wyman (center R), Brad Wyman (R) visiting City Hall to support their mother's reelection, 1966"
},
{
    src: 'images/family/roz_42.jpg', 
    caption: 'Roz Wyman (L), Oliver Wyman (center), Eugene Wyman (R), 2012'
},
{
    src: 'images/family/roz_66.jpg', 
    caption: 'B&W, vintage print, (L-R) Betty Wyman, Roz wyman, Bob Wyman, Gene Wyman, 1962'
},
{
    src: 'images/family/roz_83.jpg', 
    caption: "(L-R) Brad Wyman, Eugene Wyman, Samantha Wyman, Roz Wyman, Oliver Wyman, Peggy Wyman, Bob Wyman, Samantha's boyfriend, holiday celebration, 2014"
},
{
    src: 'images/family/roz_84.jpg', 
    caption: "(L-R) Bob Wyman, Peggy Wyman, John  Deeb, Betty Wyman, Jean Firstenberg, Roz Wyman, Oliver Wyman, Eugene Wyman, Brad Wyman, 2015"
},
{
    src: 'images/family/roz_85.jpg', 
    caption: "(L-R) Oliver Wyman, Brad Wyman, Roz Wyman, Eugene Wyman, lunch celebrating the grandkids birthday, 2016"
},
{
    src: 'images/family/roz_88.jpg', 
    caption: "B&W, vintage print, (L-R), Betty Wyman, Gene Wyman, Roz Wyman, Brad Wyman, Bob Wyman, their dog Bingo, 1965"
},
{
    src: 'images/family/roz_99.jpg', 
    caption: "B&W, vintage print, (L-R) Oscar Wiener, Roz Wiener, Sarah Wiener, Brother George, celebrating the win of the 1953 election of Roz, 1953"
},
{
    src: 'images/family/roz_100.jpg', 
    caption: "Color, vintage print, (L-R) Bob Wyman, Brad Wyman, Roz Wyman, Edward Kennedy, Betty Wyman, having Edward over their home preparing Roz for her second run at office, 1970s"
},
{
    src: 'images/family/roz_97.jpg', 
    caption: "Color, vintage print, (L-R) Betty Wyman, Gene Wyman, Bob Wyman, Abba Eban, Roz Wyman, Brad Wyman, having Abba Eban over the home, 1970s"
},
{
    src: 'images/family/roz_131.jpg', 
    caption: "B&W, 8x10 inch, vintage print, (L-R) Gene Wyman, Roz Wyman, Betty Wyman, 1958"
},
{
    src: 'images/family/roz_149.jpg', 
    caption: "B&W, 8x10 inch, vintage print, (L-R) Robert Kennedy, Gene Wyman, Betty Wyman, Bob Wyman, Brad Wyman, 1965"
},
{
    src: 'images/family/roz_154.jpg', 
    caption: "B&W, 10x8inch, framed, vintage print, Gene Wyman (L), RRoz Wyman (R), at a convention, 1963"
},
{
    src: 'images/family/roz_159.jpg', 
    caption: "Color,  framed, vintage print, 8x10 inch, (L-R) Gene Wyman, J. Edgar Hoover, Roz Wyman,  Betty Wyman, Bob Wyman, Brad Wyman, June 10th, 1967"
},
{
    src: 'images/family/roz_183.jpg', 
    caption: 'scrapbook page, B&W, vintage print, "Roz with mom and dad" Top: 1953 Bottom: 1965'
},
{
    src: 'images/family/roz_185.jpg', 
    caption: "scrapbook page, B&W, vintage prints, Roz and Gene Wyman with Betty Wyman, Bob Wyman, Brad Wyman, 1965"
},
{
    src: 'images/family/roz_186.jpg', 
    caption: 'scrapbook page, Sepia, B&W, Top: "Bobby 1960"  featuring Betty Wyman Bottom: "Brad 1963"'
}
  // Add more photos as needed...
];

function PlayCanvasMuseum() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const isInitializing = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);  

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

    // Initialize lighting system properly
    app.scene.ambientLight = new pc.Color(0.2, 0.2, 0.2);
    app.scene.skyboxIntensity = 1;
    app.scene.exposure = 1;

    app.scene.clearColor = new pc.Color(0.95, 0.95, 0.95);

    const camera = new pc.Entity('camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.95, 0.95, 0.95),
      farClip: 1000,
      fov: 70
    });
    camera.setPosition(0, 1.5, 0);
    camera.lookAt(0, 0, 0);
    app.root.addChild(camera);

    // Initialize scene layers to prevent splitLights error
    app.scene.layers.getLayerByName("World").enabled = true;

    app.start();

    // Add ambient light AFTER starting the app
    const ambientLight = new pc.Entity('ambient-light');
    ambientLight.addComponent('light', {
      type: 'ambient',
      color: new pc.Color(1, 1, 1),
      intensity: 0.8
    });
    app.root.addChild(ambientLight);

    console.log('Loading splat...');
    const splatUrl = "https://pub-b1b1a0b8a789411aa54abb9c340ba12e.r2.dev/splats/Splat5_V2.sog";

    // Track download progress with XHR
    const xhr = new XMLHttpRequest();
    xhr.open('GET', splatUrl, true);
    xhr.responseType = 'arraybuffer';

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setLoadProgress(percentComplete);
        console.log('Download progress:', Math.round(percentComplete) + '%');
      } else {
        // If we can't track, show indeterminate progress
        setLoadProgress(prev => Math.min(prev + 5, 90));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log('Download complete, processing...');
        setLoadProgress(95);
        
        // Create blob URL from the downloaded data
        const blob = new Blob([xhr.response]);
        const blobUrl = URL.createObjectURL(blob);
        
        // Now load into PlayCanvas
        const asset = new pc.Asset('museum-splat', 'gsplat', { 
          url: blobUrl,
          filename: 'Splat5_V2.sog'  // Add this - tells PlayCanvas the format
        });

        asset.on('load', () => {
          console.log('Splat loaded! Adding to running scene...');
          setLoadProgress(100);
          
          const splatEntity = new pc.Entity('splat');
          splatEntity.addComponent('gsplat', { asset: asset.id });
          splatEntity.setPosition(0, 0, 0);
          splatEntity.setLocalScale(1.2, 1.2, 1.2);
          splatEntity.setEulerAngles(180, 0, 0);
          app.root.addChild(splatEntity);

          // === LOAD COLLISION MESH ===
          console.log('Loading collision mesh...');
          const collisionUrl = "https://pub-b1b1a0b8a789411aa54abb9c340ba12e.r2.dev/meshes/collision-cube.glb";
          const collisionAsset = new pc.Asset('collision-mesh', 'model', { url: collisionUrl });

          collisionAsset.on('load', () => {
            console.log('Collision mesh loaded!');
            
            const collisionEntity = new pc.Entity('collision-cube');
            collisionEntity.addComponent('model', {
              type: 'asset',
              asset: collisionAsset
            });

            collisionEntity.enabled = true;
            
            setTimeout(() => {
              if (collisionEntity.model?.meshInstances) {
                collisionEntity.model.meshInstances.forEach((mi) => {
                  mi.visible = false;
                  mi.cull = false; // DISABLE CULLING - render always
                  mi.castShadow = false;
                  mi.receiveShadow = false;
                  
                  const material = new pc.StandardMaterial();
                  material.emissive = new pc.Color(0, 1, 0); // Green
                  material.emissiveIntensity = 1.0;
                  material.opacity = 0.3; // 30% opacity (0.0 = invisible, 1.0 = solid)
                  material.blendType = pc.BLEND_NORMAL; // Enable transparency
                  material.useLighting = false;
                  material.depthWrite = false; // Important for transparency
                  material.cull = pc.CULLFACE_NONE;
                  material.update();
                  
                  mi.material = material;
                  
                  console.log('Material applied, AABB:', mi.aabb.getMin(), mi.aabb.getMax());
                });
              }
              
              console.log('Entity layers:', collisionEntity.model.layers);
            }, 100);

            collisionEntity.setPosition(-8.5, 0, .5);
            collisionEntity.setLocalScale(0.8, 1, 0.8);
            collisionEntity.setEulerAngles(0, 90, 0);

            app.root.addChild(collisionEntity);
            console.log('Collision entity position:', collisionEntity.getPosition());

            window.collisionMesh = collisionEntity;
          });

          // === LOAD INTERACTIVE MESH (with proper lighting) ===
          console.log('Loading interactive mesh...');
          const interactiveUrl = "https://pub-b1b1a0b8a789411aa54abb9c340ba12e.r2.dev/meshes/roz-room.glb";
          const interactiveAsset = new pc.Asset('interactive-mesh', 'container', { url: interactiveUrl });

          interactiveAsset.on('load', () => {
            console.log('Interactive mesh loaded!');
            
            // For container assets, instantiate the resource
            const interactiveEntity = interactiveAsset.resource.instantiateModelEntity();
            
            // Use your collision box positioning as starting point
            interactiveEntity.setPosition(1.35, 0, 0);
            interactiveEntity.setLocalScale(1, 1, 1);
            interactiveEntity.setEulerAngles(0, 270, 0);

            // Make the mesh invisible
            setTimeout(() => {
              if (interactiveEntity.model && interactiveEntity.model.meshInstances) {
                interactiveEntity.model.meshInstances.forEach((mi) => {
                  mi.visible = false;
                });
              }
            }, 100);

            app.root.addChild(interactiveEntity);
            console.log('Interactive mesh added at:', interactiveEntity.getPosition());
            
            // Log all the child objects so we can see what's labeled
            setTimeout(() => {
              console.log('=== Interactive mesh structure ===');
              
              // Check the parent entity
              if (interactiveEntity.model && interactiveEntity.model.meshInstances) {
                console.log(`Parent has ${interactiveEntity.model.meshInstances.length} mesh instances:`);
                interactiveEntity.model.meshInstances.forEach((mi, i) => {
                  console.log(`  [${i}] Node: ${mi.node.name}, Material: ${mi.material.name}`);
                });
              }
              
              // Check children
              interactiveEntity.children.forEach((child, index) => {
                console.log(`Child ${index}: ${child.name}`);
                
                if (child.model && child.model.meshInstances) {
                  console.log(`  Child has ${child.model.meshInstances.length} mesh instances:`);
                  child.model.meshInstances.forEach((mi, i) => {
                    console.log(`    [${i}] Node: ${mi.node.name}, Material: ${mi.material.name}`);
                  });
                }
              });
            }, 500);

            // Store reference for click detection
            window.interactiveMesh = interactiveEntity;

            // Track dragging to prevent accidental clicks on ANY interactive element
            let isDragging = false;
            let mouseDownPosition = { x: 0, y: 0 };

            canvas.addEventListener('mousedown', (event) => {
              mouseDownPosition = { x: event.clientX, y: event.clientY };
              isDragging = false;
            });

            // Set up click detection for tables using proper raycasting
            canvas.addEventListener('click', (event) => {
              // Prevent accidental clicks during camera drag
              if (isDragging) {
                isDragging = false;
                mouseDownPosition = { x: undefined, y: undefined };
                return;
              }

              const camera = app.root.findByName('camera');
              if (!camera) return;
              
              const cameraComponent = camera.camera;
              
              // Get click coordinates
              const x = event.clientX;
              const y = event.clientY;
              
              // Get camera position and create ray direction
              const cameraPos = camera.getPosition();
              const farPoint = cameraComponent.screenToWorld(x, y, cameraComponent.farClip);
              const rayDirection = new pc.Vec3().sub2(farPoint, cameraPos).normalize();
              
              // Check all mesh instances for intersection
              if (interactiveEntity.model && interactiveEntity.model.meshInstances) {
                let closestDistance = Infinity;
                let clickedTable = null;
                
                interactiveEntity.model.meshInstances.forEach((mi, index) => {
                  const materialName = mi.material.name;
                  
                  // Check if this is one of the table materials
                  if (materialName.includes('pasted__tableSG')) {
                    // Manual ray-AABB intersection test
                    const aabb = mi.aabb;
                    const min = aabb.getMin();
                    const max = aabb.getMax();
                    
                    let tmin = (min.x - cameraPos.x) / rayDirection.x;
                    let tmax = (max.x - cameraPos.x) / rayDirection.x;
                    if (tmin > tmax) [tmin, tmax] = [tmax, tmin];
                    
                    let tymin = (min.y - cameraPos.y) / rayDirection.y;
                    let tymax = (max.y - cameraPos.y) / rayDirection.y;
                    if (tymin > tymax) [tymin, tymax] = [tymax, tymin];
                    
                    if (tmin > tymax || tymin > tmax) return;
                    
                    tmin = Math.max(tmin, tymin);
                    tmax = Math.min(tmax, tymax);
                    
                    let tzmin = (min.z - cameraPos.z) / rayDirection.z;
                    let tzmax = (max.z - cameraPos.z) / rayDirection.z;
                    if (tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];
                    
                    if (tmin > tzmax || tzmin > tmax) return;
                    
                    tmin = Math.max(tmin, tzmin);
                    
                    if (tmin > 0 && tmin < closestDistance) {
                      closestDistance = tmin;
                      clickedTable = { name: materialName, index: index };
                    }
                  }
                });
                
                if (clickedTable) {
                  console.log(`Clicked ON table: ${clickedTable.name} (mesh instance ${clickedTable.index})`);
                  setIsInteractiveMode(true);
                }
              }
            });
            
            //hover
            canvas.addEventListener('mousemove', (event) => {
              if (mouseDownPosition.x !== undefined) {
                const dragDistance = Math.sqrt(
                  Math.pow(event.clientX - mouseDownPosition.x, 2) + 
                  Math.pow(event.clientY - mouseDownPosition.y, 2)
                );
                if (dragDistance > 5) {
                  isDragging = true;
                }
              }
            const camera = app.root.findByName('camera');
            if (!camera) return;
            
            const cameraComponent = camera.camera;
            
            // Get mouse coordinates
            const x = event.clientX;
            const y = event.clientY;
            
            // Get camera position and create ray direction
            const cameraPos = camera.getPosition();
            const farPoint = cameraComponent.screenToWorld(x, y, cameraComponent.farClip);
            const rayDirection = new pc.Vec3().sub2(farPoint, cameraPos).normalize();
            
            let hoveredTable = false;
            
            // Check all mesh instances for intersection (same logic as click)
            if (interactiveEntity.model && interactiveEntity.model.meshInstances) {
              interactiveEntity.model.meshInstances.forEach((mi) => {
                const materialName = mi.material.name;
                
                if (materialName.includes('pasted__tableSG')) {
                  const aabb = mi.aabb;
                  const min = aabb.getMin();
                  const max = aabb.getMax();
                  
                  let tmin = (min.x - cameraPos.x) / rayDirection.x;
                  let tmax = (max.x - cameraPos.x) / rayDirection.x;
                  if (tmin > tmax) [tmin, tmax] = [tmax, tmin];
                  
                  let tymin = (min.y - cameraPos.y) / rayDirection.y;
                  let tymax = (max.y - cameraPos.y) / rayDirection.y;
                  if (tymin > tymax) [tymin, tymax] = [tymax, tymin];
                  
                  if (tmin > tymax || tymin > tmax) return;
                  
                  tmin = Math.max(tmin, tymin);
                  tmax = Math.min(tmax, tymax);
                  
                  let tzmin = (min.z - cameraPos.z) / rayDirection.z;
                  let tzmax = (max.z - cameraPos.z) / rayDirection.z;
                  if (tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];
                  
                  if (tmin > tzmax || tzmin > tmax) return;
                  
                  tmin = Math.max(tmin, tzmin);
                  
                  if (tmin > 0) {
                    hoveredTable = true;
                  }
                }
              });
            }
            
            // Change cursor based on hover
            canvas.style.cursor = hoveredTable ? 'pointer' : 'grab';
          });

          });
          interactiveAsset.on('error', (err) => console.error('Error loading interactive mesh:', err));
          app.assets.add(interactiveAsset);
          app.assets.load(interactiveAsset);

          collisionAsset.on('error', (err) => console.error('Error loading collision mesh:', err));
          app.assets.add(collisionAsset);
          app.assets.load(collisionAsset);

          // Clean up blob URL
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

          setIsLoaded(true);
          addMouseLook(app, camera, canvas);
          addWASDMovement(app, camera);
        });

        asset.on('error', (err) => console.error('Error loading splat:', err));
        app.assets.add(asset);
        app.assets.load(asset);
      }
    };

    xhr.onerror = () => {
      console.error('Error downloading splat');
      setLoadProgress(0);
    };

    xhr.send();
  });

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
      {isInteractiveMode && (
        <InteractiveOverlay 
          visible={isInteractiveMode}
          onClose={() => setIsInteractiveMode(false)}
          familyPhotos={familyPhotos}
          currentPhotoIndex={currentPhotoIndex}
          setCurrentPhotoIndex={setCurrentPhotoIndex}
        />
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

  window.addEventListener('keydown', (e) => keys[e.code] = true);
  window.addEventListener('keyup', (e) => keys[e.code] = false);

  app.on('update', (dt) => {
    const currentPos = camera.getPosition().clone();
    const newPos = currentPos.clone();
    let moved = false;

    if (keys['KeyW'] || keys['ArrowUp']) {
      const forward = camera.forward.clone().mulScalar(moveSpeed * dt);
      newPos.add(forward);
      moved = true;
    }
    if (keys['KeyS'] || keys['ArrowDown']) {
      const forward = camera.forward.clone().mulScalar(moveSpeed * dt);
      newPos.sub(forward);
      moved = true;
    }
    if (keys['KeyA'] || keys['ArrowLeft']) {
      const right = camera.right.clone().mulScalar(moveSpeed * dt);
      newPos.sub(right);
      moved = true;
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
      const right = camera.right.clone().mulScalar(moveSpeed * dt);
      newPos.add(right);
      moved = true;
    }

    if (!moved) return;

    if (window.collisionMesh && window.collisionMesh.model) {
      const aabb = window.collisionMesh.model.meshInstances[0]?.aabb;
      
      if (aabb) {
        // Check if new position is inside bounds
        if (aabb.containsPoint(newPos)) {
          // Inside bounds, move freely
          newPos.y = 1.5;
          camera.setPosition(newPos);
        } else {
          // Outside bounds, try sliding along walls
          // Try moving only on X axis
          const slideX = new pc.Vec3(newPos.x, 1.5, currentPos.z);
          if (aabb.containsPoint(slideX)) {
            camera.setPosition(slideX);
            return;
          }
          
          // Try moving only on Z axis
          const slideZ = new pc.Vec3(currentPos.x, 1.5, newPos.z);
          if (aabb.containsPoint(slideZ)) {
            camera.setPosition(slideZ);
            return;
          }
          
          // Can't move in either direction, stay put
        }
      } else {
        // Fallback
        newPos.x = Math.max(-8, Math.min(0, newPos.x));
        newPos.z = Math.max(-4, Math.min(4, newPos.z));
        newPos.y = 1.5;
        camera.setPosition(newPos);
      }
    } else {
      // Fallback
      newPos.x = Math.max(-8, Math.min(0, newPos.x));
      newPos.z = Math.max(-4, Math.min(4, newPos.z));
      newPos.y = 1.5;
      camera.setPosition(newPos);
    }
  });
}

// Interactive overlay component
function InteractiveOverlay({ visible, onClose }) {
  const [currentView, setCurrentView] = useState('selection'); // 'selection', 'photos', 'video'
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!visible) return null;

  const openPhotoAlbum = () => setCurrentView('photos');
  const openDocumentary = () => setCurrentView('video');
  const backToSelection = () => setCurrentView('selection');

  const nextPhoto = () => {
    if (currentPhotoIndex < familyPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const previousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      {currentView === 'selection' && (
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          position: 'relative'
        }}>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '15px',
              right: '20px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ×
          </button>
          <h2 style={{ marginTop: 0, color: '#333', fontSize: '24px' }}>
            Roz Wyman Family Collection
          </h2>
          <p>Choose what you'd like to explore:</p>
          <button 
            onClick={openPhotoAlbum}
            style={{
              display: 'block',
              width: '100%',
              padding: '15px 20px',
              margin: '15px 0',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            View Family Photo Album
          </button>
          <button 
            onClick={openDocumentary}
            style={{
              display: 'block',
              width: '100%',
              padding: '15px 20px',
              margin: '15px 0',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Watch Family Documentary
          </button>
        </div>
      )}

      {currentView === 'photos' && (
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '20px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <button 
            onClick={backToSelection}
            style={{
              position: 'absolute',
              top: '15px',
              right: '20px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ×
          </button>
          <div style={{ textAlign: 'center' }}>
            <img 
              src={familyPhotos[currentPhotoIndex].src}
              alt="Family Photo"
              style={{
                maxWidth: '100%',
                maxHeight: '500px',
                objectFit: 'contain',
                borderRadius: '10px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}
            />
            <div style={{ margin: '10px 0', color: '#666' }}>
              <span>{currentPhotoIndex + 1} of {familyPhotos.length}</span>
              <p>{familyPhotos[currentPhotoIndex].caption}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <button 
                onClick={previousPhoto}
                disabled={currentPhotoIndex === 0}
                style={{
                  background: currentPhotoIndex === 0 ? '#ccc' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: currentPhotoIndex === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                ← Previous
              </button>
              <button 
                onClick={nextPhoto}
                disabled={currentPhotoIndex === familyPhotos.length - 1}
                style={{
                  background: currentPhotoIndex === familyPhotos.length - 1 ? '#ccc' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: currentPhotoIndex === familyPhotos.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'video' && (
        <div style={{
          background: 'black',
          borderRadius: '15px',
          padding: '20px',
          maxWidth: '900px',
          width: '90%',
          maxHeight: '90vh',
          position: 'relative'
        }}>
          <button 
            onClick={backToSelection}
            style={{
              position: 'absolute',
              top: '15px',
              right: '20px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              cursor: 'pointer',
              fontSize: '18px',
              zIndex: 1001
            }}
          >
            ×
          </button>
          <video 
            controls
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '70vh',
              borderRadius: '10px'
            }}
          >
            <source src="ROZ DOC.mp4" type="video/mp4" />
            <source src="ROZ DOC.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}

export default PlayCanvasMuseum;
