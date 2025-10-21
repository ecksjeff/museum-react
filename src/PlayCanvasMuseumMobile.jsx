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
];

function PlayCanvasMuseumMobile() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const isInitializing = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentViewpointIndex, setCurrentViewpointIndex] = useState(0);
  const [viewpoints] = useState([
    { name: "Personal", position: [-4, 1.5, 0], rotation: [0, 0, 0] },
    { name: "Family Table", position: [-3, 1.5, 0], rotation: [0, -90, 0] },
    { name: "Dodgers", position: [-7, 1.5, 1], rotation: [0, 180, 0] },
    { name: "Politics", position: [-4, 1.5, 0.20], rotation: [0, 90, 0] }
    ]);

    const setViewpoint = (viewpointIndex) => {
    if (appRef.current) {
        const camera = appRef.current.root.findByName('camera');
        if (camera) {
        const viewpoint = viewpoints[viewpointIndex];
        
        // Store the transition state
        if (!window.cameraTransition) {
            window.cameraTransition = {
            isTransitioning: false,
            startPosition: new pc.Vec3(),
            startRotation: new pc.Quat(),
            targetPosition: new pc.Vec3(),
            targetRotation: new pc.Quat(),
            startTime: 0,
            duration: 1500 // 1.5 second transition
            };
        }

        const transition = window.cameraTransition;
        transition.startPosition.copy(camera.getPosition());
        transition.startRotation.copy(camera.getRotation());
        transition.targetPosition.set(...viewpoint.position);
        
        // Convert euler angles to quaternion for target
        transition.targetRotation.setFromEulerAngles(...viewpoint.rotation);
        
        transition.startTime = Date.now();
        transition.isTransitioning = true;
        
        setCurrentViewpointIndex(viewpointIndex);
        }
    }
  };

  // --- Handle window resize ---
  useEffect(() => {
    const updateSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // --- Initialize PlayCanvas only once ---
  useEffect(() => {
    if (!canvasRef.current) return;
    if (canvasSize.width === 0 || canvasSize.height === 0) return;
    if (isInitializing.current || appRef.current) return;

    isInitializing.current = true;
    console.log('Initializing PlayCanvas Mobile with size:', canvasSize);

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    // Cap DPR at 2 for mobile to prevent performance issues
    const mobileDpr = Math.min(dpr, 2);
    canvas.width = canvasSize.width * mobileDpr;
    canvas.height = canvasSize.height * mobileDpr;

    const app = new pc.Application(canvas, {
    touch: new pc.TouchDevice(canvas),
    graphicsDeviceOptions: {
        alpha: false,
        antialias: false, // Disable for mobile performance
        powerPreference: 'high-performance'
    }
    });

    appRef.current = app;

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
    camera.setPosition(-4, 1.5, 0);
    camera.setEulerAngles(0, 0, 0);
    app.root.addChild(camera);

    app.scene.layers.getLayerByName("World").enabled = true;

    app.start();

    // // Add ambient light
    // const ambientLight = new pc.Entity('ambient-light');
    // ambientLight.addComponent('light', {
    //   type: 'ambient',
    //   color: new pc.Color(1, 1, 1),
    //   intensity: 0.8
    // });
    // app.root.addChild(ambientLight);

    console.log('Loading splat...');
    const splatUrl = "https://pub-b1b1a0b8a789411aa54abb9c340ba12e.r2.dev/splats/Splat5_V2.sog";

    const xhr = new XMLHttpRequest();
    xhr.open('GET', splatUrl, true);
    xhr.responseType = 'arraybuffer';

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setLoadProgress(percentComplete);
      } else {
        setLoadProgress(prev => Math.min(prev + 5, 90));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log('Download complete, processing...');
        setLoadProgress(95);
        
        const blob = new Blob([xhr.response]);
        const blobUrl = URL.createObjectURL(blob);
        
        const asset = new pc.Asset('museum-splat', 'gsplat', { 
          url: blobUrl,
          filename: 'Splat5_V2.sog'
        });

        asset.on('load', () => {
          console.log('Splat loaded!');
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
                });
              }
            }, 100);

            collisionEntity.setPosition(-8.5, 0, .5);
            collisionEntity.setLocalScale(0.8, 1, 0.8);
            collisionEntity.setEulerAngles(0, 90, 0);

            app.root.addChild(collisionEntity);
            window.collisionMesh = collisionEntity;
          });

          // === LOAD INTERACTIVE MESH ===
          console.log('Loading interactive mesh...');
          const interactiveUrl = "https://pub-b1b1a0b8a789411aa54abb9c340ba12e.r2.dev/meshes/roz-room.glb";
          const interactiveAsset = new pc.Asset('interactive-mesh', 'container', { url: interactiveUrl });

          interactiveAsset.on('load', () => {
            console.log('Interactive mesh loaded!');
            
            const interactiveEntity = interactiveAsset.resource.instantiateModelEntity();
            
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
            window.interactiveMesh = interactiveEntity;

            // Track touch for drag detection
            let isTouching = false;
            let touchStartPosition = { x: 0, y: 0 };
            let isDragging = false;

            canvas.addEventListener('touchstart', (event) => {
              const touch = event.touches[0];
              touchStartPosition = { x: touch.clientX, y: touch.clientY };
              isTouching = true;
              isDragging = false;
            });

            canvas.addEventListener('touchmove', (event) => {
              if (!isTouching) return;
              
              const touch = event.touches[0];
              const dragDistance = Math.sqrt(
                Math.pow(touch.clientX - touchStartPosition.x, 2) + 
                Math.pow(touch.clientY - touchStartPosition.y, 2)
              );
              
              if (dragDistance > 10) {
                isDragging = true;
              }
            });

            canvas.addEventListener('touchend', (event) => {
              if (!isTouching) return;
              
              // Only process tap if not dragging
              if (!isDragging && event.changedTouches.length > 0) {
                const touch = event.changedTouches[0];
                const camera = app.root.findByName('camera');
                if (!camera) return;

                const cameraComponent = camera.camera;
                const x = touch.clientX;
                const y = touch.clientY;

                const cameraPos = camera.getPosition();
                const farPoint = cameraComponent.screenToWorld(x, y, cameraComponent.farClip);
                const rayDirection = new pc.Vec3().sub2(farPoint, cameraPos).normalize();

                // Check for table tap
                if (interactiveEntity.model && interactiveEntity.model.meshInstances) {
                  let tappedTable = false;

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
                        tappedTable = true;
                      }
                    }
                  });

                  if (tappedTable) {
                    console.log('Table tapped!');
                    setIsInteractiveMode(true);
                  }
                }
              }

              isTouching = false;
              isDragging = false;
            });
          });

          interactiveAsset.on('error', (err) => console.error('Error loading interactive mesh:', err));
          app.assets.add(interactiveAsset);
          app.assets.load(interactiveAsset);

          collisionAsset.on('error', (err) => console.error('Error loading collision mesh:', err));
          app.assets.add(collisionAsset);
          app.assets.load(collisionAsset);

          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

          setIsLoaded(true);
          addTouchControls(app, camera, canvas);
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
  }, [canvasSize]);

  // --- Cleanup ---
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

  // --- Handle resize ---
  useEffect(() => {
    const handleResize = () => {
      if (appRef.current && canvasRef.current) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const canvas = canvasRef.current;

        const dpr = window.devicePixelRatio || 1;
        const mobileDpr = Math.min(dpr, 2);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.width = width * mobileDpr;
        canvas.height = height * mobileDpr;

        appRef.current.resizeCanvas(width, height);

        const cameraEntity = appRef.current.root.findByName('camera');
        if (cameraEntity && cameraEntity.camera) {
          cameraEntity.camera.aspectRatio = width / height;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#000', touchAction: 'none' }}>
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
          position: 'absolute', top: '10px', left: '10px',
          color: 'white', background: 'rgba(0, 0, 0, 0.7)',
          padding: '10px', borderRadius: '8px', fontSize: '12px', zIndex: 100, maxWidth: '200px'
        }}>
          <div><strong>Controls:</strong></div>
          <div>Swipe up/down - Move</div>
          <div>Swipe left/right - Turn</div>
          <div>Tap table to interact</div>
        </div>
      )}
        {isLoaded && (
        <div style={{
            position: 'fixed', // Changed from 'absolute' to 'fixed'
            bottom: '40px', // Increased from '20px' to avoid browser UI
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(0, 0, 0, 0.8)', // Slightly more opaque
            padding: '12px 18px',
            borderRadius: '12px',
            zIndex: 1000, // Increased z-index
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)' // Add shadow for visibility
        }}>
            <button
            onClick={() => setViewpoint((currentViewpointIndex - 1 + viewpoints.length) % viewpoints.length)}
            style={{
                padding: '10px 14px', // Slightly larger for easier tapping
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                minWidth: '44px', // iOS recommended tap target size
                minHeight: '44px'
            }}
            >
            ←
            </button>
            
            <div style={{
            color: 'white',
            fontSize: '15px',
            minWidth: '120px',
            textAlign: 'center',
            fontWeight: '500'
            }}>
            {viewpoints[currentViewpointIndex].name}
            </div>
            
            <button
            onClick={() => setViewpoint((currentViewpointIndex + 1) % viewpoints.length)}
            style={{
                padding: '10px 14px', // Slightly larger for easier tapping
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                minWidth: '44px', // iOS recommended tap target size
                minHeight: '44px'
            }}
            >
            →
            </button>
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

function addTouchControls(app, camera, canvas) {
  let touchStartPos = { x: 0, y: 0 };
  let isTouching = false;
  const MOVE_SPEED = 2.5;
  const TURN_SPEED = 0.8;
  
  // Smooth rotation tracking
  let angularVelocity = 0;
  let targetAngularVelocity = 0;

  canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    touchStartPos = { x: touch.clientX, y: touch.clientY };
    isTouching = true;
    targetAngularVelocity = 0;
  });

  canvas.addEventListener('touchmove', (e) => {
    if (!isTouching) return;
    e.preventDefault();

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartPos.x;
    const deltaY = touch.clientY - touchStartPos.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe - set rotation velocity
      targetAngularVelocity = deltaX * 0.2 * TURN_SPEED;
    } else {
      // Vertical swipe - move forward/back
      const moveAmount = -deltaY * 0.01 * MOVE_SPEED;
      const forward = camera.forward.clone().mulScalar(moveAmount);
      const currentPos = camera.getPosition().clone();
      const newPos = currentPos.add(forward);

      // Constrain within collision bounds
      if (window.collisionMesh && window.collisionMesh.model) {
        const aabb = window.collisionMesh.model.meshInstances[0]?.aabb;
        if (aabb && aabb.containsPoint(newPos)) {
          newPos.y = 1.5;
          camera.setPosition(newPos);
        }
      } else {
        // Fallback bounds
        newPos.x = Math.max(-8, Math.min(0, newPos.x));
        newPos.z = Math.max(-4, Math.min(4, newPos.z));
        newPos.y = 1.5;
        camera.setPosition(newPos);
      }
    }

    touchStartPos = { x: touch.clientX, y: touch.clientY };
  });

  canvas.addEventListener('touchend', () => {
    isTouching = false;
    targetAngularVelocity = 0;
  });

  // Update loop with camera transition support
  app.on('update', (dt) => {
    // Handle camera viewpoint transition with quaternions
    if (window.cameraTransition && window.cameraTransition.isTransitioning) {
      const transition = window.cameraTransition;
      const elapsed = Date.now() - transition.startTime;
      const progress = Math.min(elapsed / transition.duration, 1);
      
      // Ease in-out function for smoother motion
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // Interpolate position
      camera.setPosition(
        transition.startPosition.x + (transition.targetPosition.x - transition.startPosition.x) * easeProgress,
        transition.startPosition.y + (transition.targetPosition.y - transition.startPosition.y) * easeProgress,
        transition.startPosition.z + (transition.targetPosition.z - transition.startPosition.z) * easeProgress
      );

      // Slerp (spherical interpolation) for smooth rotation without gimbal lock
      const tempQuat = new pc.Quat();
      tempQuat.slerp(transition.startRotation, transition.targetRotation, easeProgress);
      camera.setRotation(tempQuat);
      
      // Update is complete
      if (progress >= 1) {
        transition.isTransitioning = false;
      }
      
      return; // Don't process touch movement during transition
    }

    // Smoothly interpolate angular velocity for touch controls
    const lerpFactor = Math.min(dt * 10, 1);
    angularVelocity += (targetAngularVelocity - angularVelocity) * lerpFactor;
    
    // Decay velocity when not touching
    if (!isTouching) {
      angularVelocity *= 0.85;
    }
    
    // Apply rotation using rotateLocal (quaternion-based, no gimbal lock)
    if (Math.abs(angularVelocity) > 0.001) {
      camera.rotateLocal(0, angularVelocity * dt * 60, 0);
    }
  });
}

// Interactive overlay component
function InteractiveOverlay({ visible, onClose }) {
  const [currentView, setCurrentView] = useState('selection');
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
          maxWidth: '400px',
          width: '85%',
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
          <h2 style={{ marginTop: 0, color: '#333', fontSize: '22px' }}>
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

export default PlayCanvasMuseumMobile;