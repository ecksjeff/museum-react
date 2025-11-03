import React, { useEffect, useRef, useState } from 'react';
import * as pc from 'playcanvas';
import { familyPhotos, documentaryVideo } from './familyPhotosData';

function PlayCanvasMuseum() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const isInitializing = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [currentViewpointIndex, setCurrentViewpointIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState({});
  const [wallInteractionMode, setWallInteractionMode] = useState(null);
  const [viewpoints] = useState([
    { name: "Personal", position: [-2, 1.5, 5.75], rotation: [0, 90, 0] },
    { name: "Family Table", position: [0, 1.5, 2.5], rotation: [-25, 0, 0] },
    { name: "Dodgers", position: [3, 1.5, 9], rotation: [10, -90, 0] },
    { name: "Politics", position: [0.20, 1.5, 7], rotation: [7, 180, 0] }
  ]);
  const [lookAtPoints] = useState([
    { name: "Personal Wall", position: new pc.Vec3(-6.5, 2.5, 5.75) },
    { name: "Family Table", position: new pc.Vec3(0, 1, 1) },
    { name: "Dodgers Wall", position: new pc.Vec3(7, 2.5, 9) },
    { name: "Politics Wall", position: new pc.Vec3(0, 2.5, 12) }
  ]);

  const [wallDefinitions] = useState({
    'Personal Wall': {
      normal: new pc.Vec3(1, 0, 0),
      center: new pc.Vec3(-6.5, 2.5, 5.75),
      width: 5.5,
      height: 3,
      zoomDistance: 1.5
    },
    'Dodgers Wall': {
      normal: new pc.Vec3(-1, 0, 0),
      center: new pc.Vec3(7, 2.5, 9),
      width: 4,
      height: 3,
      zoomDistance: 1.5
    },
    'Politics Wall': {
      normal: new pc.Vec3(0, 0, -1),
      center: new pc.Vec3(0, 2.5, 12),
      width: 5,
      height: 3,
      zoomDistance: 1.5
    }
  });

  const setViewpoint = (viewpointIndex) => {
    if (appRef.current) {
      const camera = appRef.current.root.findByName('camera');
      if (camera) {
        const viewpoint = viewpoints[viewpointIndex];
        
        // Get current values from mouse look
        const startValues = window.getMouseLookValues ? window.getMouseLookValues() : { yaw: 0, pitch: 0 };
        
        // Use the same system as click-to-move
        window.movementState.targetPosition = new pc.Vec3(...viewpoint.position);
        window.movementState.startYaw = startValues.yaw;
        window.movementState.startPitch = startValues.pitch;
        window.movementState.targetYaw = viewpoint.rotation[1]; // Y rotation is yaw
        window.movementState.targetPitch = viewpoint.rotation[0]; // X rotation is pitch
        window.movementState.isMoving = true;
        
        setCurrentViewpointIndex(viewpointIndex);
      }
    }
  };

  const findClosestLookAtPoint = (cameraPosition) => {
    let closestPoint = lookAtPoints[0];
    let minDistance = Infinity;

    lookAtPoints.forEach(point => {
      const distance = cameraPosition.distance(point.position);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });

    return closestPoint;
  };

  const exitWallMode = () => {
    if (wallInteractionMode && appRef.current) {
      const camera = appRef.current.root.findByName('camera');
      if (camera && window.wallTransitionState) {
        const prev = wallInteractionMode.previousCamera;
        
        window.wallTransitionState.isTransitioning = true;
        window.wallTransitionState.startPosition = camera.getPosition().clone();
        window.wallTransitionState.targetPosition = prev.position.clone();
        window.wallTransitionState.startRotation = camera.getEulerAngles().clone();
        window.wallTransitionState.targetRotation = prev.rotation.clone();
        window.wallTransitionState.progress = 0;
        window.wallTransitionState.duration = 1.0;
        window.wallTransitionState.syncOnComplete = true; // Flag to sync after transition

        window.wallPanState.isActive = false;
        window.currentWallMode = null;
        
        setWallInteractionMode(null);
      }
    }
  };
  window.exitWallMode = exitWallMode;

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

  // --- Preload and cache all family photos ---
  useEffect(() => {
    console.log('Preloading and creating object URLs...');
    
    const urlMap = {};
    let loadedCount = 0;
    
    const promises = familyPhotos.map((photo) => {
      return fetch(photo.src)
        .then(response => response.blob())
        .then(blob => {
          // Create an object URL from the blob
          const objectUrl = URL.createObjectURL(blob);
          urlMap[photo.src] = objectUrl;
          loadedCount++;
          console.log(`✓ Created object URL ${loadedCount}/${familyPhotos.length}`);
          return objectUrl;
        })
        .catch(err => {
          console.error(`✗ Failed to fetch ${photo.src}:`, err);
          urlMap[photo.src] = photo.src; // Fallback to original URL
        });
    });
    
    Promise.all(promises).then(() => {
      setImageUrls(urlMap);
      console.log('🎉 All object URLs created!');
    });
    
    // Cleanup object URLs when component unmounts
    return () => {
      Object.values(urlMap).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
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
    camera.camera.requestSceneColorMap(true);
    camera.setPosition(0, 1.5, 5.75);
    camera.setEulerAngles(0, 90, 0);
    app.root.addChild(camera);

    // Initialize scene layers to prevent splitLights error
    app.scene.layers.getLayerByName("World").enabled = true;

    app.start();

    // Add ambient light AFTER starting the app
    // const ambientLight = new pc.Entity('ambient-light');
    // ambientLight.addComponent('light', {
    //   type: 'ambient',
    //   color: new pc.Color(1, 1, 1),
    //   intensity: 0.8
    // });
    // app.root.addChild(ambientLight);

    console.log('Loading splat...');
    const splatUrl = "https://pub-b1b1a0b8a789411aa54abb9c340ba12e.r2.dev/splats/SplatFinal.sog";

    // Track download progress with XHR
    const xhr = new XMLHttpRequest();
    xhr.open('GET', splatUrl, true);
    xhr.responseType = 'arraybuffer';

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        console.log(`Download progress: ${percentComplete.toFixed(1)}%`);
        // Splat takes 0-70% of the loading bar
        setLoadProgress(Math.floor(percentComplete * 0.7));
      } else {
        setLoadProgress(prev => Math.min(prev + 5, 65));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log('Download complete, processing...');
        setLoadProgress(75); // Splat done, now 75%
        
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
          setLoadProgress(80);
          
          const splatEntity = new pc.Entity('splat');
          splatEntity.addComponent('gsplat', { asset: asset.id });
          splatEntity.setPosition(3.1903, -0.18828, 2.7212);
          splatEntity.setLocalScale(1.329, 1.329, 1.329);
          splatEntity.setEulerAngles(181.246, 135.72, 1.25);
          app.root.addChild(splatEntity);

          // === LOAD BOTH COLLISION AND INTERACTIVE MESH IN PARALLEL ===
          console.log('Loading collision mesh...');
          const collisionUrl = "https://pub-b1b1a0b8a789411aa54abb9c340ba12e.r2.dev/meshes/collision-cube_v2.glb";
          const collisionAsset = new pc.Asset('collision-mesh', 'model', { url: collisionUrl });

          console.log('Loading interactive mesh...');
          const interactiveUrl = "https://pub-b1b1a0b8a789411aa54abb9c340ba12e.r2.dev/meshes/roz-room_v2.glb";
          const interactiveAsset = new pc.Asset('interactive-mesh', 'container', { url: interactiveUrl });

          let collisionLoaded = false;
          let interactiveLoaded = false;

          const checkBothLoaded = () => {
            if (collisionLoaded && interactiveLoaded) {
              console.log('Both meshes loaded! Processing...');
              
              // Animate from 98% to 100% over 1 second to cover processing time
              let currentProgress = 95;
              const processingInterval = setInterval(() => {
                currentProgress += 1;
                setLoadProgress(currentProgress);
                
                if (currentProgress >= 100) {
                  clearInterval(processingInterval);
                  setIsLoaded(true);
                }
              }, 100); // 2 steps of 500ms = 1 second total
            }
          };

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
                  mi.cull = false;
                  mi.castShadow = false;
                  mi.receiveShadow = false;
                  
                  const material = new pc.StandardMaterial();
                  material.emissive = new pc.Color(0, 1, 0);
                  material.emissiveIntensity = 1.0;
                  material.opacity = 0.3;
                  material.blendType = pc.BLEND_NORMAL;
                  material.useLighting = false;
                  material.depthWrite = false;
                  material.cull = pc.CULLFACE_NONE;
                  material.update();
                  
                  mi.material = material;
                  
                  console.log('Material applied, AABB:', mi.aabb.getMin(), mi.aabb.getMax());
                });
              }
              
              console.log('Entity layers:', collisionEntity.model.layers);
            }, 100);

            collisionEntity.setPosition(0, 0, 0);
            collisionEntity.setLocalScale(1, 1, 1);
            collisionEntity.setEulerAngles(0, 0, 0);

            app.root.addChild(collisionEntity);
            console.log('Collision entity position:', collisionEntity.getPosition());

            window.collisionMesh = collisionEntity;
            
            collisionLoaded = true;
            checkBothLoaded();
          });

          interactiveAsset.on('load', () => {
            console.log('Interactive mesh loaded!');
            
            const interactiveEntity = interactiveAsset.resource.instantiateModelEntity();
            
            interactiveEntity.setPosition(0, 0, 0);
            interactiveEntity.setLocalScale(1, 1, 1);
            interactiveEntity.setEulerAngles(0, 0, 0);

            app.root.addChild(interactiveEntity);
            console.log('Interactive mesh added at:', interactiveEntity.getPosition());
            
            // Make the mesh invisible immediately
            if (interactiveEntity.model && interactiveEntity.model.meshInstances) {
              interactiveEntity.model.meshInstances.forEach((mi) => {
                mi.visible = false;
              });
            }
            
            // Log all the child objects so we can see what's labeled
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

            // Store reference for click detection
            window.interactiveMesh = interactiveEntity;

            // Track dragging to prevent accidental clicks on ANY interactive element
            let isDragging = false;
            let mouseDownPosition = { x: 0, y: 0 };
            let isMouseDown = false;

            canvas.addEventListener('mousedown', (event) => {
              mouseDownPosition = { x: event.clientX, y: event.clientY };
              isDragging = false;
              isMouseDown = true; 
            });

            // Set up click detection for tables using proper raycasting
            canvas.addEventListener('click', (event) => {
              if (window.movementState && window.movementState.isMoving) {
                return;
              }

              // Prevent accidental clicks during camera drag
              if (isDragging) {
                isDragging = false;
                mouseDownPosition = { x: undefined, y: undefined };
                return;
              }

              // NEW: Check if in wall mode - ignore clicks (for future picture interaction)
              if (wallInteractionMode) {
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
              
              // NEW: First check for wall clicks using AABB intersection
              console.log('🖱️ Click detected, checking for walls...');
              let clickedWall = null;
              if (interactiveEntity.model && interactiveEntity.model.meshInstances) {
                console.log(`Found ${interactiveEntity.model.meshInstances.length} mesh instances to check`);
                let closestWallDistance = Infinity;
                
                interactiveEntity.model.meshInstances.forEach((mi, index) => {
                  const materialName = mi.material.name;
                  console.log(`  [${index}] Material: ${materialName}`);
                  
                  // Check all mesh instances for hits, regardless of material name
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

                  if (tmin > 0 && tmin < closestWallDistance) {
                    const hitPoint = new pc.Vec3(
                      cameraPos.x + rayDirection.x * tmin,
                      cameraPos.y + rayDirection.y * tmin,
                      cameraPos.z + rayDirection.z * tmin
                    );
                    
                    // Skip table materials
                    if (materialName.includes('table') || materialName.includes('chair')) {
                      return;
                    }
                    
                    closestWallDistance = tmin;
                    console.log(`    ✓ HIT! Material: ${materialName}, Distance: ${tmin}, Point:`, hitPoint);
                    clickedWall = { name: materialName, index: index, hitPoint: hitPoint };
                  }
                });
                
                if (clickedWall) {
                  console.log(`Clicked on wall: ${clickedWall.name}`);
                  
                  // Determine which wall based on material name or position
                  let wallName = null;
                  if (clickedWall.name.toLowerCase().includes('personal') || clickedWall.hitPoint.x < -3) {
                    wallName = 'Personal Wall';
                  } else if (clickedWall.name.toLowerCase().includes('dodger') || clickedWall.hitPoint.x > 3) {
                    wallName = 'Dodgers Wall';
                  } else if (clickedWall.name.toLowerCase().includes('politic') || clickedWall.hitPoint.z > 10) {
                    wallName = 'Politics Wall';
                  }
                  
                  if (wallName) {
                    enterWallMode(wallName, clickedWall.hitPoint);
                    return; // Don't process other clicks
                  }
                }
              }
              
              // First check for table clicks
              let clickedTable = null;
              if (interactiveEntity.model && interactiveEntity.model.meshInstances) {
                let closestDistance = Infinity;
                
                interactiveEntity.model.meshInstances.forEach((mi, index) => {
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
                    
                    if (tmin > 0 && tmin < closestDistance) {
                      closestDistance = tmin;
                      clickedTable = { name: materialName, index: index };
                    }
                  }
                });
                
                if (clickedTable) {
                  console.log(`Clicked ON table: ${clickedTable.name} (mesh instance ${clickedTable.index})`);
                  setIsInteractiveMode(true);
                  return; // Don't process floor click
                }
              }
              
              // If no table clicked, check for floor click using collision box bounds
              if (window.collisionMesh && window.collisionMesh.model) {
                const aabb = window.collisionMesh.model.meshInstances[0]?.aabb;
                if (aabb) {
                  const t = -cameraPos.y / rayDirection.y;
                  
                  if (t > 0) {
                    const intersectionPoint = new pc.Vec3(
                      cameraPos.x + rayDirection.x * t,
                      0,
                      cameraPos.z + rayDirection.z * t
                    );
                    
                    const min = aabb.getMin();
                    const max = aabb.getMax();
                    
                    if (intersectionPoint.x >= min.x && intersectionPoint.x <= max.x &&
                        intersectionPoint.z >= min.z && intersectionPoint.z <= max.z) {
                      console.log('Floor clicked at:', intersectionPoint);
                      
                      // Set the target at camera height (1.5)
                      const targetPos = new pc.Vec3(intersectionPoint.x, 1.5, intersectionPoint.z);

                      // Find the closest look-at point for this target position
                      const closestLookAt = findClosestLookAtPoint(targetPos);

                      console.log('🎯 Camera will look at:', closestLookAt.name, 'at position:', closestLookAt.position);
                      console.log('📍 Camera moving to:', targetPos);

                      // Update UI immediately to show which viewpoint we're looking at
                      const lookAtToViewpointMap = {
                        "Personal Wall": 0,
                        "Family Table": 1,
                        "Dodgers Wall": 2,
                        "Politics Wall": 3
                      };
                      setCurrentViewpointIndex(lookAtToViewpointMap[closestLookAt.name]);

                      // Calculate rotation to look at the closest point
                      const lookAtQuat = new pc.Quat();
                      const lookDirection = new pc.Vec3();
                      lookDirection.sub2(closestLookAt.position, targetPos).normalize();

                      // Check if looking straight up or down (gimbal lock territory)
                      const upDot = Math.abs(lookDirection.dot(pc.Vec3.UP));
                      if (upDot > 0.99) {
                        const tempUp = Math.abs(lookDirection.x) < 0.9 ? pc.Vec3.RIGHT : pc.Vec3.FORWARD;
                        const tempMat = new pc.Mat4();
                        tempMat.setLookAt(closestLookAt.position, targetPos, tempUp);
                        lookAtQuat.setFromMat4(tempMat);
                      } else {
                        const tempMat = new pc.Mat4();
                        tempMat.setLookAt(closestLookAt.position, targetPos, pc.Vec3.UP);
                        lookAtQuat.setFromMat4(tempMat);
                      }

                      // IMPORTANT: Normalize the quaternion to avoid flipped euler angles
                      // Extract and rebuild from yaw/pitch to get clean representation
                      const forward = new pc.Vec3();
                      lookAtQuat.transformVector(pc.Vec3.FORWARD, forward);

                      const targetYaw = Math.atan2(forward.x, forward.z) * pc.math.RAD_TO_DEG;
                      const horizontalDist = Math.sqrt(forward.x * forward.x + forward.z * forward.z);
                      const targetPitch = Math.atan2(-forward.y, horizontalDist) * pc.math.RAD_TO_DEG;

                      console.log('🎯 Target yaw/pitch for animation:', targetPitch, targetYaw);
                      console.log('🎯 Forward vector:', forward.x, forward.y, forward.z);
                      console.log('🎯 LookAt position:', closestLookAt.position.x, closestLookAt.position.y, closestLookAt.position.z);
                      console.log('🎯 Camera target position:', targetPos.x, targetPos.y, targetPos.z);

                      // Get current yaw/pitch from the mouse look system
                      const startValues = window.getMouseLookValues ? window.getMouseLookValues() : { yaw: 0, pitch: 0 };

                      // Store both position and rotation targets
                      window.movementState.targetPosition = targetPos;
                      window.movementState.targetYaw = targetYaw;
                      window.movementState.targetPitch = targetPitch;
                      window.movementState.startYaw = startValues.yaw;
                      window.movementState.startPitch = startValues.pitch;
                      window.movementState.isMoving = true;
                      
                      // Show destination marker and hide hover marker
                      if (window.floorMarkers) {
                        window.floorMarkers.destination.setPosition(intersectionPoint.x, 0.05, intersectionPoint.z);
                        window.floorMarkers.destination.enabled = true;
                        window.floorMarkers.hover.enabled = false;
                      }
                    }
                  }
                }
              }
            });
            
            //hover
            canvas.addEventListener('mousemove', (event) => {
              // Don't show hover ring while moving
              if (window.movementState && window.movementState.isMoving) {
                if (window.floorMarkers) {
                  window.floorMarkers.hover.enabled = false;
                }
                canvas.style.cursor = 'grab';
                return;
              }

              // Check if dragging
              if (mouseDownPosition.x !== undefined) {
                const dragDistance = Math.sqrt(
                  Math.pow(event.clientX - mouseDownPosition.x, 2) + 
                  Math.pow(event.clientY - mouseDownPosition.y, 2)
                );
                if (dragDistance > 5) {
                  isDragging = true;
                }
              } else {
                // Reset dragging if no mousedown position
                isDragging = false;
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
              let hoveredFloor = false;
              
              // Check table hover first
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
              
              // If not hovering table, check floor
              if (!hoveredTable && window.collisionMesh && window.collisionMesh.model) {
                const aabb = window.collisionMesh.model.meshInstances[0]?.aabb;
                if (aabb) {
                  const t = -cameraPos.y / rayDirection.y;
                  
                  if (t > 0) {
                    const intersectionPoint = new pc.Vec3(
                      cameraPos.x + rayDirection.x * t,
                      0,
                      cameraPos.z + rayDirection.z * t
                    );
                    
                    const min = aabb.getMin();
                    const max = aabb.getMax();
                    
                    if (intersectionPoint.x >= min.x && intersectionPoint.x <= max.x &&
                        intersectionPoint.z >= min.z && intersectionPoint.z <= max.z) {
                      hoveredFloor = true;
                      
                      // Show and position hover marker
                      if (window.floorMarkers) {
                        window.floorMarkers.hover.setPosition(intersectionPoint.x, 0.05, intersectionPoint.z);
                        window.floorMarkers.hover.enabled = true;
                      }
                    }
                  }
                }
              }
              
              // Hide hover marker if not hovering floor
              if (!hoveredFloor && window.floorMarkers) {
                window.floorMarkers.hover.enabled = false;
              }
              
              // Change cursor based on hover
              if (isMouseDown && isDragging) {
                canvas.style.cursor = 'grabbing'; // Keep grabbing cursor while dragging
              } else {
                canvas.style.cursor = hoveredTable ? 'pointer' : (hoveredFloor ? 'pointer' : 'grab');
              }
            });

            interactiveLoaded = true;
            checkBothLoaded();
          });
          interactiveAsset.on('error', (err) => console.error('Error loading interactive mesh:', err));
                    
          collisionAsset.on('error', (err) => console.error('Error loading collision mesh:', err));

          // File sizes in bytes
          const collisionSize = 2200;
          const interactiveSize = 232605328;
          const totalSize = collisionSize + interactiveSize;

          let collisionBytesLoaded = 0;
          let interactiveBytesLoaded = 0;
          let lastProgressUpdate = 0;

          const updateCombinedProgress = () => {
            const now = Date.now();
            if (now - lastProgressUpdate > 50) {
              const totalLoaded = collisionBytesLoaded + interactiveBytesLoaded;
              const percentLoaded = (totalLoaded / totalSize) * 100;
              // Map 0-100% of download to 80-98% of loading bar (leave room for processing)
              const progressPercent = 80 + (percentLoaded * 0.15); // Changed from 0.2 to 0.18
              const cappedProgress = Math.min(Math.floor(progressPercent), 95); // Cap at 98%
              setLoadProgress(cappedProgress);
              lastProgressUpdate = now;
            }
          };

          collisionAsset.on('progress', (bytesLoaded) => {
            collisionBytesLoaded = Math.min(bytesLoaded, collisionSize);
            updateCombinedProgress();
          });

          interactiveAsset.on('progress', (bytesLoaded) => {
            interactiveBytesLoaded = Math.min(bytesLoaded, interactiveSize);
            updateCombinedProgress();
          });

          // Add and load assets ONLY ONCE
          app.assets.add(collisionAsset);
          app.assets.load(collisionAsset);
          app.assets.add(interactiveAsset);
          app.assets.load(interactiveAsset);

          // Clean up blob URL
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

          // Helper function to create a ring mesh
          function createRingMesh(innerRadius, outerRadius, segments) {
            const vertices = [];
            const normals = [];
            const indices = [];
            
            for (let i = 0; i <= segments; i++) {
              const angle = (i / segments) * Math.PI * 2;
              const cos = Math.cos(angle);
              const sin = Math.sin(angle);
              
              // Inner vertex
              vertices.push(innerRadius * cos, 0, innerRadius * sin);
              normals.push(0, 1, 0); // Normal pointing up
              
              // Outer vertex
              vertices.push(outerRadius * cos, 0, outerRadius * sin);
              normals.push(0, 1, 0); // Normal pointing up
            }
            
            for (let i = 0; i < segments; i++) {
              const a = i * 2;
              const b = a + 1;
              const c = a + 2;
              const d = a + 3;
              
              indices.push(a, c, b);
              indices.push(b, c, d);
            }
            
            const mesh = pc.createMesh(app.graphicsDevice, vertices, {
              normals: normals,
              indices: indices
            });
            
            return mesh;
          }

          // Create hover marker (white ring)
          const hoverMarker = new pc.Entity('hover-marker');
          hoverMarker.addComponent('render', {
            type: 'asset',
            meshInstances: []
          });

          setTimeout(() => {
            const hoverMesh = createRingMesh(0.3, 0.4, 32);
            const hoverMaterial = new pc.StandardMaterial();
            hoverMaterial.emissive = new pc.Color(1, 1, 1);
            hoverMaterial.emissiveIntensity = 0.5;
            hoverMaterial.opacity = 0.1; // Make fully opaque
            hoverMaterial.blendType = pc.BLEND_NONE; // No blending
            hoverMaterial.depthWrite = true; // Write depth
            hoverMaterial.depthTest = true; // Test depth
            hoverMaterial.cull = pc.CULLFACE_NONE;
            hoverMaterial.update();
            
            const hoverMeshInstance = new pc.MeshInstance(hoverMesh, hoverMaterial);
            hoverMarker.render.meshInstances = [hoverMeshInstance];
            hoverMarker.enabled = false;
          }, 100);

          app.root.addChild(hoverMarker);

          // Create destination marker (green ring)
          const destinationMarker = new pc.Entity('destination-marker');
          destinationMarker.addComponent('render', {
            type: 'asset',
            meshInstances: []
          });

          setTimeout(() => {
            const destMesh = createRingMesh(0.3, 0.4, 32);
            const destMaterial = new pc.StandardMaterial();
            destMaterial.emissive = new pc.Color(0, 1, 0);
            destMaterial.emissiveIntensity = 1.0;
            destMaterial.opacity = 0.7;
            destMaterial.blendType = pc.BLEND_NONE;
            destMaterial.depthWrite = true;
            destMaterial.depthTest = true;
            destMaterial.cull = pc.CULLFACE_NONE;
            destMaterial.update();
            
            const destMeshInstance = new pc.MeshInstance(destMesh, destMaterial);
            destinationMarker.render.meshInstances = [destMeshInstance];
            destinationMarker.enabled = false;
          }, 100);

          app.root.addChild(destinationMarker);

          window.floorMarkers = { hover: hoverMarker, destination: destinationMarker };

          // NEW: Function to enter wall interaction mode
          function enterWallMode(wallName, clickPoint) {
            const wallDef = wallDefinitions[wallName];
            if (!wallDef) return;

            const camera = app.root.findByName('camera');
            if (!camera) return;

            console.log(`🎨 Entering wall mode: ${wallName}`);

            // Get current mouse look values instead of camera euler (which might be flipped)
            const currentMouseLook = window.getMouseLookValues ? window.getMouseLookValues() : { yaw: 0, pitch: 0 };

            const previousCamera = {
              position: camera.getPosition().clone(),
              rotation: new pc.Vec3(currentMouseLook.pitch, currentMouseLook.yaw, 0) // Use mouse look values, not camera euler
            };

            const targetPosition = clickPoint.clone().add(
              wallDef.normal.clone().mulScalar(wallDef.zoomDistance)
            );

            const lookDirection = wallDef.normal.clone();
            const targetYaw = Math.atan2(lookDirection.x, lookDirection.z) * pc.math.RAD_TO_DEG;
            const targetPitch = 0;

            window.wallTransitionState.isTransitioning = true;
            window.wallTransitionState.startPosition = previousCamera.position.clone();
            window.wallTransitionState.targetPosition = targetPosition;
            window.wallTransitionState.startRotation = previousCamera.rotation.clone();
            window.wallTransitionState.targetRotation = new pc.Vec3(targetPitch, targetYaw, 0);
            window.wallTransitionState.progress = 0;
            window.wallTransitionState.duration = 1.2;

            window.wallPanState.isActive = true;
            window.wallPanState.isDragging = false;
            window.wallPanState.currentOffset = new pc.Vec3(0, 0, 0);
            window.wallPanState.wallDefinition = wallDef;

            setWallInteractionMode({
              wallName: wallName,
              clickPoint: clickPoint,
              previousCamera: previousCamera
            });
            
            // Store on window for update loop access
            window.currentWallMode = {
              wallName: wallName,
              clickPoint: clickPoint,
              previousCamera: previousCamera
            };
          }

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
          imageUrls={imageUrls}
        />
      )}
      {isLoaded && !wallInteractionMode && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '15px 20px',
          borderRadius: '12px',
          zIndex: 100
        }}>
          <button
            onClick={() => setViewpoint((currentViewpointIndex - 1 + viewpoints.length) % viewpoints.length)}
            style={{
              padding: '8px 12px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            ←
          </button>
          
          <div style={{
            color: 'white',
            fontSize: '16px',
            minWidth: '150px',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            {viewpoints[currentViewpointIndex].name}
          </div>
          
          <button
            onClick={() => setViewpoint((currentViewpointIndex + 1) % viewpoints.length)}
            style={{
              padding: '8px 12px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            →
          </button>
        </div>
      )}
      
      {/* NEW: Wall mode exit button */}
      {wallInteractionMode && (
        <button
          onClick={exitWallMode}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            background: 'rgba(244, 67, 54, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 999,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          ← Exit Wall View (ESC)
        </button>
      )}

      {/* NEW: Wall mode indicator */}
      {wallInteractionMode && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          background: 'rgba(33, 150, 243, 0.9)',
          color: 'white',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          zIndex: 999,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          Viewing: {wallInteractionMode.wallName} - Drag to explore
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
  let accumulatedYaw = 0;
  let accumulatedPitch = 0;

  // Helper to get current accumulated values
  window.getMouseLookValues = () => {
    return { yaw: accumulatedYaw, pitch: accumulatedPitch };
  };
    
  // Initialize from camera's starting rotation
  const initialEuler = camera.getEulerAngles();
  accumulatedYaw = initialEuler.y;
  accumulatedPitch = initialEuler.x;
  
  // Helper to sync accumulated values without calling resetMouseLookTracking
  window.syncMouseLookValues = (yaw, pitch) => {
    accumulatedYaw = yaw;
    accumulatedPitch = pitch;
    console.log('Synced mouse look to:', pitch, yaw);
  };

  // Expose a way to reset these when camera transitions happen
  window.resetMouseLookTracking = () => {
    const quat = camera.getRotation();
    
    // Extract yaw and pitch from quaternion
    const forward = new pc.Vec3();
    quat.transformVector(pc.Vec3.FORWARD, forward);
    
    // Calculate yaw (rotation around Y axis)
    accumulatedYaw = Math.atan2(forward.x, forward.z) * pc.math.RAD_TO_DEG;
    
    // Calculate pitch (rotation around X axis)
    const horizontalDist = Math.sqrt(forward.x * forward.x + forward.z * forward.z);
    accumulatedPitch = Math.atan2(-forward.y, horizontalDist) * pc.math.RAD_TO_DEG;
    
    // Clamp pitch
    accumulatedPitch = Math.max(-85, Math.min(85, accumulatedPitch));
    
    console.log('Reset tracking to:', accumulatedPitch, accumulatedYaw);
    
    // IMPORTANT: Immediately apply these values to normalize the camera rotation
    // This prevents the "snap" on first mouse move
    const yawQuat = new pc.Quat().setFromAxisAngle(pc.Vec3.UP, accumulatedYaw);
    const pitchQuat = new pc.Quat().setFromAxisAngle(pc.Vec3.RIGHT, accumulatedPitch);
    const finalQuat = new pc.Quat().mul2(yawQuat, pitchQuat);
    camera.setRotation(finalQuat);
    
    console.log('Normalized camera to:', camera.getEulerAngles().x, camera.getEulerAngles().y);
  };
  
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
    
    // NEW: If in wall pan mode, handle panning instead of rotation
    if (window.wallPanState && window.wallPanState.isActive) {
      const wallDef = window.wallPanState.wallDefinition;
      if (wallDef) {
        const panSensitivity = 0.003;
        
        const normal = wallDef.normal;
        const worldUp = new pc.Vec3(0, 1, 0);
        const right = new pc.Vec3().cross(worldUp, normal).normalize();
        const up = worldUp;
        
        const panX = -deltaX * panSensitivity;
        const panY = deltaY * panSensitivity;
        
        const newOffset = window.wallPanState.currentOffset.clone();
        newOffset.add(right.clone().mulScalar(panX));
        newOffset.add(up.clone().mulScalar(panY));
        
        const maxPanX = wallDef.width / 2;
        const maxPanY = wallDef.height / 2;
        
        const offsetRight = newOffset.dot(right);
        const offsetUp = newOffset.dot(up);
        
        const clampedRight = Math.max(-maxPanX, Math.min(maxPanX, offsetRight));
        const clampedUp = Math.max(-maxPanY, Math.min(maxPanY, offsetUp));
        
        window.wallPanState.currentOffset = right.clone().mulScalar(clampedRight)
          .add(up.clone().mulScalar(clampedUp));
      }
      
      lastX = e.clientX;
      lastY = e.clientY;
      return;
    }
    
    // Normal mouse look rotation
    // Log on first move after lookAt
    if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
      const currentEuler = camera.getEulerAngles();
      console.log('🖱️ First mouse move after lookAt:');
      console.log('   Current camera euler:', currentEuler.x, currentEuler.y, currentEuler.z);
      console.log('   Accumulated values:', accumulatedPitch, accumulatedYaw);
      console.log('   Delta:', deltaX, deltaY);
    }
    
    // Update accumulated values
    accumulatedYaw += deltaX * 0.1;
    accumulatedPitch += deltaY * 0.1;
    
    // Clamp pitch only
    accumulatedPitch = Math.max(-85, Math.min(85, accumulatedPitch));
    
    console.log('   New accumulated:', accumulatedPitch, accumulatedYaw);
    
    // Build rotation: yaw around world UP, pitch around local RIGHT
    const yawQuat = new pc.Quat().setFromAxisAngle(pc.Vec3.UP, accumulatedYaw);
    const pitchQuat = new pc.Quat().setFromAxisAngle(pc.Vec3.RIGHT, accumulatedPitch);
    const finalQuat = new pc.Quat().mul2(yawQuat, pitchQuat);
    
    camera.setRotation(finalQuat);
    
    const afterEuler = camera.getEulerAngles();
    console.log('   After setRotation euler:', afterEuler.x, afterEuler.y, afterEuler.z);
    
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

// WASD controls and click-to-move
function addWASDMovement(app, camera) {
  const keys = {};
  const moveSpeed = 3.0;

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    // NEW: ESC to exit wall mode - check window.currentWallMode instead
    if (e.key === 'Escape' && window.currentWallMode) {
      // Trigger exit by clicking the exit button programmatically
      // Or set a flag that exitWallMode checks
      window.shouldExitWallMode = true;
    }
  });
  window.addEventListener('keyup', (e) => keys[e.code] = false);

  // Store movement state on window
  window.movementState = {
    targetPosition: null,
    isMoving: false,
    moveStartTime: 0,
    moveStartPosition: new pc.Vec3()
  };

  window.wallTransitionState = {
    isTransitioning: false,
    startPosition: null,
    targetPosition: null,
    startRotation: null,
    targetRotation: null,
    progress: 0,
    duration: 1.0
  };

  window.wallPanState = {
    isActive: false,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    currentOffset: new pc.Vec3(0, 0, 0),
    wallDefinition: null
  };

  app.on('update', (dt) => {
    // Check for ESC exit request
    if (window.shouldExitWallMode) {
      window.shouldExitWallMode = false;
      exitWallMode();
    }
    const moveState = window.movementState;

    // NEW: Handle wall transition
    if (window.wallTransitionState && window.wallTransitionState.isTransitioning) {
      const state = window.wallTransitionState;
      state.progress += dt / state.duration;

        if (state.progress >= 1.0) {
          console.log('🎬 Wall transition completing!');
          console.log('  Target position:', state.targetPosition);
          console.log('  Target rotation (euler):', state.targetRotation);
          
          camera.setPosition(state.targetPosition);
          camera.setEulerAngles(state.targetRotation);
          
          console.log('  Camera after setEulerAngles:', camera.getEulerAngles());
          
          state.isTransitioning = false;
          
          // Directly sync to target rotation - don't use reset which recalculates
          if (window.syncMouseLookValues) {
            console.log('  Syncing mouse look to:', state.targetRotation.y, state.targetRotation.x);
            window.syncMouseLookValues(state.targetRotation.y, state.targetRotation.x);
            const synced = window.getMouseLookValues();
            console.log('  After sync, mouse look values are:', synced);
          }
        state.isTransitioning = false;
        // Don't return - fall through to wall pan mode
        } else {
          const t = state.progress;
          const smoothT = t * t * (3 - 2 * t);

          // Interpolate position
          const pos = new pc.Vec3().lerp(state.startPosition, state.targetPosition, smoothT);
          camera.setPosition(pos);

          // Convert Euler to Quaternions and use SLERP for rotation
          const startQuat = new pc.Quat();
          startQuat.setFromEulerAngles(state.startRotation.x, state.startRotation.y, state.startRotation.z);
          
          const targetQuat = new pc.Quat();
          targetQuat.setFromEulerAngles(state.targetRotation.x, state.targetRotation.y, state.targetRotation.z);
          
          const currentQuat = new pc.Quat();
          currentQuat.slerp(startQuat, targetQuat, smoothT);
          camera.setRotation(currentQuat);
          
          return; // ONLY return while still transitioning
        }
    }

    // NEW: Handle wall pan mode
    if (window.wallPanState && window.wallPanState.isActive) {
      const wallDef = window.wallPanState.wallDefinition;
      if (wallDef && window.currentWallMode) {
        const basePosition = window.currentWallMode.clickPoint.clone().add(
          wallDef.normal.clone().mulScalar(wallDef.zoomDistance)
        );

        const finalPosition = basePosition.clone().add(window.wallPanState.currentOffset);
        camera.setPosition(finalPosition);

        const lookDirection = wallDef.normal.clone();
        const targetYaw = Math.atan2(lookDirection.x, lookDirection.z) * pc.math.RAD_TO_DEG;
        camera.setEulerAngles(0, targetYaw, 0);
      }
      return;
    }

    // // Handle camera viewpoint transition with quaternions
    // if (window.cameraTransition && window.cameraTransition.isTransitioning) {
    //   const transition = window.cameraTransition;
    //   const elapsed = Date.now() - transition.startTime;
    //   const progress = Math.min(elapsed / transition.duration, 1);
      
    //   // Ease in-out function for smoother motion
    //   const easeProgress = progress < 0.5 
    //     ? 2 * progress * progress 
    //     : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    //   // Interpolate position
    //   camera.setPosition(
    //     transition.startPosition.x + (transition.targetPosition.x - transition.startPosition.x) * easeProgress,
    //     transition.startPosition.y + (transition.targetPosition.y - transition.startPosition.y) * easeProgress,
    //     transition.startPosition.z + (transition.targetPosition.z - transition.startPosition.z) * easeProgress
    //   );

    //   // Slerp (spherical interpolation) for smooth rotation without gimbal lock
    //   const tempQuat = new pc.Quat();
    //   tempQuat.slerp(transition.startRotation, transition.targetRotation, easeProgress);
    //   camera.setRotation(tempQuat);
      
    //   // Update mouse look rotation to match final euler angles
    //   if (progress >= 1) {
    //     transition.isTransitioning = false;
    //     // Reset the accumulated tracking values
    //     if (window.resetMouseLookTracking) {
    //       window.resetMouseLookTracking();
    //     }
    //   }
      
    //   return; // Don't process other movement during transition
    // }

    // Handle click-to-move
    if (moveState.isMoving && moveState.targetPosition) {
      if (moveState.moveStartTime === 0) {
        moveState.moveStartTime = Date.now();
        moveState.moveStartPosition.copy(camera.getPosition());
      }

      const elapsed = Date.now() - moveState.moveStartTime;
      const progress = Math.min(elapsed / 1000, 1);
      
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // Interpolate position
      camera.setPosition(
        moveState.moveStartPosition.x + (moveState.targetPosition.x - moveState.moveStartPosition.x) * easeProgress,
        1.5,
        moveState.moveStartPosition.z + (moveState.targetPosition.z - moveState.moveStartPosition.z) * easeProgress
      );

      // Interpolate rotation using yaw/pitch instead of quaternion slerp
      if (moveState.targetYaw !== undefined && moveState.targetPitch !== undefined) {
        // Calculate shortest yaw difference (handle wraparound at +/-180)
        let yawDiff = moveState.targetYaw - moveState.startYaw;
        
        // Normalize to -180 to 180 range
        while (yawDiff > 180) yawDiff -= 360;
        while (yawDiff < -180) yawDiff += 360;
        
        const currentYaw = moveState.startYaw + yawDiff * easeProgress;
        const currentPitch = moveState.startPitch + (moveState.targetPitch - moveState.startPitch) * easeProgress;
        
        const yawQuat = new pc.Quat().setFromAxisAngle(pc.Vec3.UP, currentYaw);
        const pitchQuat = new pc.Quat().setFromAxisAngle(pc.Vec3.RIGHT, currentPitch);
        const finalQuat = new pc.Quat().mul2(yawQuat, pitchQuat);
        camera.setRotation(finalQuat);
      }

      if (progress >= 1) {
        moveState.moveStartTime = 0;
        moveState.isMoving = false;
        moveState.targetPosition = null;
        
        // DON'T call resetMouseLookTracking - set values directly
        // The camera is already at the correct rotation from the interpolation
        // Just sync the accumulated tracking values
        const finalForward = new pc.Vec3();
        camera.getRotation().transformVector(pc.Vec3.FORWARD, finalForward);
        
        // Calculate and store in the mouse look closure variables
        // We need to access them through window
        if (window.syncMouseLookValues) {
          window.syncMouseLookValues(moveState.targetYaw, moveState.targetPitch);
        }
        
        moveState.targetYaw = undefined;
        moveState.targetPitch = undefined;
        moveState.startYaw = undefined;
        moveState.startPitch = undefined;

        // Hide destination marker
        if (window.floorMarkers) {
          window.floorMarkers.destination.enabled = false;
        }
      }
      return;
    }

    // Handle WASD movement
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
        if (aabb.containsPoint(newPos)) {
          newPos.y = 1.5;
          camera.setPosition(newPos);
        } else {
          const slideX = new pc.Vec3(newPos.x, 1.5, currentPos.z);
          if (aabb.containsPoint(slideX)) {
            camera.setPosition(slideX);
            return;
          }
          
          const slideZ = new pc.Vec3(currentPos.x, 1.5, newPos.z);
          if (aabb.containsPoint(slideZ)) {
            camera.setPosition(slideZ);
            return;
          }
        }
      }
    }
  });
}

// Interactive overlay component
function InteractiveOverlay({ visible, onClose, imageUrls }) {
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
              src={imageUrls[familyPhotos[currentPhotoIndex].src] || familyPhotos[currentPhotoIndex].src}
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
            <source src={documentaryVideo.mp4} type="video/mp4" />
            <source src={documentaryVideo.webm} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}

export default PlayCanvasMuseum;