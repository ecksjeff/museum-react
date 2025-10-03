import React, { useState, useRef, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Splat, useGLTF, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Splat loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

// Splat room component
function SplatRoom() {
  return (
    <Suspense fallback={<FallbackRoom />}>
      <ErrorBoundary fallback={<FallbackRoom />}>
        <Splat 
          src="/living-room.splat" 
          scale={3.5}
          position={[4, 0, 0]}
          rotation={[0, .3, 0]}
        />
      </ErrorBoundary>
    </Suspense>
  );
}

// Point cloud component (fallback for PLY files)
// function PointCloudRoom() {
//   const [geometry, setGeometry] = useState(null);

//   useEffect(() => {
//     const loader = new PLYLoader();
//     loader.load(
//       '/living-room.ply',
//       (loadedGeometry) => {
//         console.log('PLY loaded successfully');
//         setGeometry(loadedGeometry);
//       },
//       (progress) => {
//         console.log('PLY loading progress:', (progress.loaded / progress.total * 100) + '%');
//       },
//       (error) => {
//         console.error('PLY loading error:', error);
//       }
//     );
//   }, []);

//   if (!geometry) {
//     return <FallbackRoom />;
//   }

//   return (
//     <points 
//       geometry={geometry} 
//       position={[0, 0, 0]} 
//       rotation={[Math.PI, 0, 0]}
//       scale={3.0}
//     >
//       <pointsMaterial 
//         size={0.01}
//         vertexColors 
//         sizeAttenuation 
//         transparent={false}
//         opacity={0.8}
//       />
//     </points>
//   );
// }

// Fallback room component (simple geometry as backup)
function FallbackRoom() {
  return (
    <group>
      {/* Simple room geometry as fallback */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 13]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      {/* Walls */}
      <mesh position={[0, 3.5, -6.5]} receiveShadow>
        <planeGeometry args={[14, 7]} />
        <meshLambertMaterial color="#f5f5f5" />
      </mesh>
      <mesh position={[0, 3.5, 6.5]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[14, 7]} />
        <meshLambertMaterial color="#e0e0e0" />
      </mesh>
      <mesh position={[-7, 3.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[13, 7]} />
        <meshLambertMaterial color="#f0f0f0" />
      </mesh>
      <mesh position={[7, 3.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[13, 7]} />
        <meshLambertMaterial color="#e8e8e8" />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 13]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// Family photo data
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

// Navigation overlay component
function NavigationOverlay({ presetLocations, onPresetClick, isMoving, isAnimating }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 150
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: 'none',
          padding: '10px 15px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          minWidth: '120px'
        }}
      >
        {isOpen ? 'Close Nav' : 'Quick Nav'}
      </button>
      
      {isOpen && (
        <div style={{
          marginTop: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '8px',
          padding: '10px',
          minWidth: '150px'
        }}>
          {presetLocations.map((preset, index) => (
            <button
              key={index}
              onClick={() => onPresetClick(preset)}
              disabled={isMoving || isAnimating}
              style={{
                display: 'block',
                width: '100%',
                background: (isMoving || isAnimating) ? 'rgba(100, 100, 100, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                margin: '2px 0',
                borderRadius: '4px',
                cursor: (isMoving || isAnimating) ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                textAlign: 'left'
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Destination marker component
function DestinationMarker({ position, visible, color = 0x00ff00 }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} visible={visible}>
      <ringGeometry args={[0.3, 0.4, 32]} />
      <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.7} />
    </mesh>
  );
}

// Interactive table component
function InteractiveTable({ onInteract }) {
  const { scene, error } = useGLTF('photo-table.glb');
  const tableRef = useRef();
  const dragStartRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (scene) {
      scene.scale.setScalar(0.6);
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.userData = {
            isExhibit: true,
            isInteractiveTable: true,
            name: 'Roz Wyman Family Collection',
            audioText: 'Click to explore the Roz Wyman family collection.'
          };
        }
      });
    }
  }, [scene]);

  // If GLB fails to load, create simple placeholder
  if (error || !scene) {
    return (
      <mesh 
        position={[0.25, 1, 7]} 
        onClick={(e) => {
          e.stopPropagation();
          onInteract();
        }}
      >
        <boxGeometry args={[2, 0.8, 1]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
    );
  }

  return (
    <group>
      <primitive 
        ref={tableRef}
        object={scene} 
        position={[2, 0, 5]} 
        rotation={[0, Math.PI, 0]}
      />
      {/* Invisible clickable box over the table */}
      <mesh 
        position={[2, 1, 5]} 
        onPointerEnter={() => document.body.style.cursor = 'pointer'}
        onPointerLeave={() => document.body.style.cursor = 'default'}
        onPointerDown={(e) => {
          dragStartRef.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
          isDraggingRef.current = false;
        }}
        onPointerMove={(e) => {
          if (dragStartRef.current.x !== undefined) {
            const dragDistance = Math.sqrt(
              Math.pow(e.nativeEvent.clientX - dragStartRef.current.x, 2) + 
              Math.pow(e.nativeEvent.clientY - dragStartRef.current.y, 2)
            );
            if (dragDistance > 5) {
              isDraggingRef.current = true;
            }
          }
        }}
        onClick={(e) => {
          if (!isDraggingRef.current) {
            e.stopPropagation();
            onInteract();
          }
          isDraggingRef.current = false;
          dragStartRef.current = { x: undefined, y: undefined };
        }}
      >
        <boxGeometry args={[2, 1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

// Wall painting component
function WallPainting({ position, rotation, color, name, description, onExhibitClick }) {
  const dragStartRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  return (
    <mesh 
      position={position} 
      rotation={rotation}
      onPointerEnter={() => document.body.style.cursor = 'pointer'}
      onPointerLeave={() => document.body.style.cursor = 'default'}
      onPointerDown={(e) => {
        dragStartRef.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
        isDraggingRef.current = false;
      }}
      onPointerMove={(e) => {
        if (dragStartRef.current.x !== undefined) {
          const dragDistance = Math.sqrt(
            Math.pow(e.nativeEvent.clientX - dragStartRef.current.x, 2) + 
            Math.pow(e.nativeEvent.clientY - dragStartRef.current.y, 2)
          );
          if (dragDistance > 5) {
            isDraggingRef.current = true;
          }
        }
      }}
      onClick={(e) => {
        // Only trigger exhibit click if it wasn't a drag
        if (!isDraggingRef.current) {
          e.stopPropagation();
          onExhibitClick({
            position: new THREE.Vector3(...position),
            userData: { isExhibit: true, isPainting: true, name, audioText: description }
          });
        }
        // Reset drag tracking
        isDraggingRef.current = false;
        dragStartRef.current = { x: undefined, y: undefined };
      }}
    >
      <planeGeometry args={[1.5, 1.2]} />
      <meshLambertMaterial color={color} />
    </mesh>
  );
}

// Collision geometry component (invisible GLB for raycasting)
function CollisionGeometry({ onFloorClick, setHoverPosition, setHoverVisible, isMoving }) {
  const { scene } = useGLTF('room-baked.glb');
  const collisionRef = useRef();
  const isDragging = useRef(false);
  const dragStartPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (scene) {
      scene.scale.setScalar(2);
      scene.traverse((child) => {
        if (child.isMesh) {
          child.visible = false;
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });
    }
  }, [scene]);

  // Track mouse events specifically for this component
  useEffect(() => {
    const handleMouseDown = (event) => {
      dragStartPosition.current = { x: event.clientX, y: event.clientY };
      isDragging.current = false;
    };

    const handleMouseMove = (event) => {
      if (dragStartPosition.current.x !== undefined) {
        const dragDistance = Math.sqrt(
          Math.pow(event.clientX - dragStartPosition.current.x, 2) + 
          Math.pow(event.clientY - dragStartPosition.current.y, 2)
        );
        
        if (dragDistance > 5) {
          isDragging.current = true;
        }
      }
    };

    const handleMouseUp = () => {
      // Reset drag tracking after a short delay
      setTimeout(() => {
        isDragging.current = false;
        dragStartPosition.current = { x: undefined, y: undefined };
      }, 10);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!scene) {
    return (
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        onPointerEnter={(e) => {
          if (isMoving) return; // Don't show hover during movement

          const point = e.point;
          if (point.y < 0.5 && 
              point.x >= -7 && point.x <= 7 &&
              point.z >= -6.5 && point.z <= 7) {
            setHoverPosition([point.x, 0.06, point.z]);
            setHoverVisible(true);
          }
        }}
        onPointerLeave={() => {
          setHoverVisible(false);
        }}
        onPointerMove={(e) => {
          if (isMoving) return; // Don't show hover during movement

          const point = e.point;
          if (point.y < 0.5 && 
              point.x >= -7 && point.x <= 7 &&
              point.z >= -6.5 && point.z <= 7) {
            setHoverPosition([point.x, 0.06, point.z]);
            setHoverVisible(true);
          } else {
            setHoverVisible(false);
          }
        }}
        onClick={(e) => {
          // Check if this was a drag operation
          if (isDragging.current) {
            e.stopPropagation();
            return;
          }
          
          const point = e.point;
          if (point.y < 0.5 && 
              point.x >= -7 && point.x <= 7 &&
              point.z >= -6.5 && point.z <= 7) {
            onFloorClick(point);
          }
        }}
      >
        <planeGeometry args={[14, 13]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    );
  }

  return (
    <primitive 
      ref={collisionRef}
      object={scene} 
      onPointerEnter={(e) => {
        if (isMoving) return; // Don't show hover during movement

        const point = e.point;
        if (point.y < 0.5 && 
            point.x >= -7 && point.x <= 7 &&
            point.z >= -6.5 && point.z <= 7) {
          setHoverPosition([point.x, 0.06, point.z]);
          setHoverVisible(true);
        }
      }}
      onPointerLeave={() => {
        setHoverVisible(false);
      }}
      onPointerMove={(e) => {
        if (isMoving) return; // Don't show hover during movement

        const point = e.point;
        if (point.y < 0.5 && 
            point.x >= -7 && point.x <= 7 &&
            point.z >= -6.5 && point.z <= 7) {
          setHoverPosition([point.x, 0.06, point.z]);
          setHoverVisible(true);
        } else {
          setHoverVisible(false);
        }
      }}
      onClick={(e) => {
        // Check if this was a drag operation
        if (isDragging.current) {
          e.stopPropagation();
          return;
        }
        
        const point = e.point;
        if (point.y < 0.5 && 
            point.x >= -7 && point.x <= 7 &&
            point.z >= -6.5 && point.z <= 7) {
          onFloorClick(point);
        }
      }}
    />
  );
}

// Main camera controller
function CameraController({ 
  targetPosition, 
  isMoving, 
  onMoveComplete,
  isZoomedIn,
  zoomTarget,
  onZoomComplete,
  isAnimating,
  isInteractiveMode,
  setCursorState,
  originalCameraPosition,
  originalCameraQuaternion,
  onAnimationReset
}) {
  const { camera } = useThree();
  const moveStartTime = useRef(0);
  const moveStartPosition = useRef(new THREE.Vector3());
  const resetAnimation = useCallback(() => {
    zoomStartTime.current = 0;
    moveStartTime.current = 0;
    console.log('Animation state reset');
  }, []);

  useEffect(() => {
    if (onAnimationReset) {
      onAnimationReset.current = resetAnimation;
    }
  }, [resetAnimation, onAnimationReset]);
  
  // Zoom animation refs
  const zoomStartTime = useRef(0);
  const zoomStartPosition = useRef(new THREE.Vector3());
  const zoomStartQuaternion = useRef(new THREE.Quaternion());
  const zoomTargetPosition = useRef(new THREE.Vector3());
  const zoomTargetQuaternion = useRef(new THREE.Quaternion());

  useMouseControls(camera, isInteractiveMode, isAnimating, setCursorState);
  useKeyboardMovement(camera, isMoving, isInteractiveMode);

  useEffect(() => {
    camera.position.set(0, 2, 0);
  }, [camera]);

  useFrame((state) => {
    const now = state.clock.getElapsedTime() * 1000;

    // Handle zoom animation
    if (isAnimating && zoomTarget) {
      if (zoomStartTime.current === 0) {
        console.log('Starting zoom animation');
        
        zoomStartTime.current = now;
        zoomStartPosition.current.copy(camera.position);
        zoomStartQuaternion.current.copy(camera.quaternion);
        
        // Calculate target position and rotation
        if (zoomTarget.userData.isZoomOut) {
          // Zooming back out to original position
          console.log('Zooming out to saved position:', originalCameraPosition.current);
          zoomTargetPosition.current.copy(originalCameraPosition.current);
          zoomTargetQuaternion.current.copy(originalCameraQuaternion.current);
        } else {
          // Zooming in to exhibit (remove the position saving from here)
          const exhibitPos = zoomTarget.position;
          
          if (zoomTarget.userData.isPainting) {
            // For wall paintings, position camera directly in front
            if (Math.abs(exhibitPos.z) > Math.abs(exhibitPos.x)) {
              if (exhibitPos.z < 0) {
                zoomTargetPosition.current.set(exhibitPos.x, exhibitPos.y, exhibitPos.z + 3);
              } else {
                zoomTargetPosition.current.set(exhibitPos.x, exhibitPos.y, exhibitPos.z - 3);
              }
            } else {
              if (exhibitPos.x < 0) {
                zoomTargetPosition.current.set(exhibitPos.x + 3, exhibitPos.y, exhibitPos.z);
              } else {
                zoomTargetPosition.current.set(exhibitPos.x - 3, exhibitPos.y, exhibitPos.z);
              }
            }
          } else {
            zoomTargetPosition.current.set(
              exhibitPos.x + 2, 
              exhibitPos.y, 
              exhibitPos.z + 2
            );
          }
          
          // Calculate target rotation (looking at exhibit)
          const tempCamera = camera.clone();
          tempCamera.position.copy(zoomTargetPosition.current);
          tempCamera.lookAt(exhibitPos);
          zoomTargetQuaternion.current.copy(tempCamera.quaternion);
        }
        
        console.log('Target position calculated:', zoomTargetPosition.current);
      }

      const elapsed = now - zoomStartTime.current;
      const progress = Math.min(elapsed / 1200, 1); // 1200ms duration
      
      // Smooth easing
      const easeProgress = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      // Animate position and rotation
      camera.position.lerpVectors(zoomStartPosition.current, zoomTargetPosition.current, easeProgress);
      camera.quaternion.slerpQuaternions(zoomStartQuaternion.current, zoomTargetQuaternion.current, easeProgress);

      if (progress >= 1) {
        console.log('Zoom animation complete');
        zoomStartTime.current = 0; // Reset for next animation
        if (onZoomComplete) onZoomComplete();
      }
    }

    // Handle point-to-point movement (only if not zooming)
    if (isMoving && targetPosition && !isAnimating) {
      if (moveStartTime.current === 0) {
        console.log('Starting floor movement animation');
        console.log('Start position:', camera.position.clone());
        console.log('Target position:', targetPosition.clone());

        // Verify we're not trying to move to where we already are
        const distance = camera.position.distanceTo(targetPosition);
        if (distance < 0.01) {
          console.log('Already at target, completing immediately');
          onMoveComplete();
          return;
        }
        
        moveStartTime.current = now;
        moveStartPosition.current.copy(camera.position);
      }

      const elapsed = now - moveStartTime.current;
      const progress = Math.min(elapsed / 1000, 1);
      
      console.log('Movement progress:', progress); // This should show gradual increase
      
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      camera.position.lerpVectors(moveStartPosition.current, targetPosition, easeProgress);

      if (progress >= 1) {
        console.log('Floor movement complete');
        console.log('Final position:', camera.position.clone());
        moveStartTime.current = 0;
        onMoveComplete();
      }
    } else if (isMoving && targetPosition) {
      console.log('Movement blocked - isAnimating:', isAnimating);
    }
  });
  if (isMoving && !isAnimating) {
    const distanceToTarget = camera.position.distanceTo(targetPosition);
    if (distanceToTarget < 0.1 && moveStartTime.current > 0) {
      console.log('Camera reached target without animation - possible external update');
    }
  }

  return null;
}

// Text popup component
function TextPopup({ visible, title, text, onClose }) {
  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '60%',
      transform: 'translateY(-50%)',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '8px',
      maxWidth: '350px',
      fontSize: '14px',
      lineHeight: '1.4',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
      zIndex: 200,
      pointerEvents: 'auto'
    }}>
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ×
      </button>
      <h3 style={{ margin: '0 0 8px 0', color: '#ffd700', fontSize: '16px' }}>
        {title}
      </h3>
      <p style={{ margin: 0 }}>{text}</p>
    </div>
  );
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

// Mouse controls hook
function useMouseControls(camera, isInteractiveMode, isAnimating, setCursorState) {
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const dragStartPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (isInteractiveMode || isAnimating || event.button !== 0) return;
      isDragging.current = true;
      previousMouse.current = { x: event.clientX, y: event.clientY };
      dragStartPosition.current = { x: event.clientX, y: event.clientY };
      setCursorState('grabbing');
    };

    const handleMouseMove = (event) => {
      if (!isDragging.current) return;
      
      const deltaX = event.clientX - previousMouse.current.x;
      const deltaY = event.clientY - previousMouse.current.y;
      
      const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      euler.setFromQuaternion(camera.quaternion);
      
      euler.y += deltaX * 0.0015;
      euler.x += deltaY * 0.0015;
      euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
      
      camera.quaternion.setFromEuler(euler);
      
      previousMouse.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = (event) => {
      if (isDragging.current) {
        const dragDistance = Math.sqrt(
          Math.pow(event.clientX - dragStartPosition.current.x, 2) + 
          Math.pow(event.clientY - dragStartPosition.current.y, 2)
        );
        
        if (dragDistance > 5) {
          event.stopPropagation();
          event.preventDefault();
        }
        
        isDragging.current = false;
        setCursorState('default'); // Back to default after drag
      }
    };

    // Set initial cursor to default when not in interactive mode
    if (!isInteractiveMode && !isAnimating) {
      setCursorState('default');
    }

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp, true);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp, true);
    };
  }, [camera, isInteractiveMode, isAnimating, setCursorState]);
}

// WASD movement hook
function useKeyboardMovement(camera, isMoving, isInteractiveMode) {
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (isMoving || isInteractiveMode) return;

    const moveSpeed = 3.0 * delta;
    const direction = new THREE.Vector3();

    if (keys.current.forward || keys.current.backward) {
      camera.getWorldDirection(direction);
      direction.multiplyScalar((keys.current.forward ? 1 : -1) * moveSpeed);
      camera.position.add(direction);
    }

    if (keys.current.left || keys.current.right) {
      camera.getWorldDirection(direction);
      direction.cross(camera.up);
      direction.multiplyScalar((keys.current.right ? 1 : -1) * moveSpeed);
      camera.position.add(direction);
    }

    // Keep camera within bounds and at proper height
    camera.position.x = Math.max(-7, Math.min(7, camera.position.x));
    camera.position.z = Math.max(-6.5, Math.min(7, camera.position.z));
    camera.position.y = 2.5;
  });
}

// Cursor management hook
function useCursorStates(isInteractiveMode) {
  const [cursorState, setCursorState] = useState('default');

  useEffect(() => {
    document.body.style.cursor = cursorState;
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [cursorState]);

  return { setCursorState };
}

// Create camera reference
function CameraCapture({ cameraRef }) {
  const { camera } = useThree();
  
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera, cameraRef]);
  
  return null;
}

// Main museum component
function MuseumWalkthrough() {
  const [targetPosition, setTargetPosition] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [destinationVisible, setDestinationVisible] = useState(false);
  const [destinationPosition, setDestinationPosition] = useState([0, 0.05, 0]);
  const [hoverVisible, setHoverVisible] = useState(false);
  const [hoverPosition, setHoverPosition] = useState([0, 0.06, 0]);
  const originalCameraPosition = useRef(new THREE.Vector3(0, 2.5, 0));
  const originalCameraQuaternion = useRef(new THREE.Quaternion());
  const animationResetRef = useRef();
  
  // Exhibit state
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [currentExhibit, setCurrentExhibit] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupText, setPopupText] = useState('');
  
  // Interactive mode state
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);

  const { setCursorState } = useCursorStates(isInteractiveMode);
  const cameraRef = useRef();

  const paintings = useMemo(() => [
    { position: [-2, 2.5, -6.9], rotation: [0, 0, 0], color: 0x4ecdc4, name: 'Teal Serenity', description: 'This serene teal painting evokes feelings of calm and tranquility, reminiscent of ocean depths.' },
    { position: [0, 2.5, -6.9], rotation: [0, 0, 0], color: 0xff6b6b, name: 'Coral Passion', description: 'This vibrant coral painting radiates warmth and energy, capturing the essence of a sunset.' },
    { position: [2, 2.5, -6.9], rotation: [0, 0, 0], color: 0xffe66d, name: 'Golden Dreams', description: 'This bright golden painting brings light and optimism, like captured sunshine.' },
    { position: [-7.4, 2.5, -3], rotation: [0, Math.PI / 2, 0], color: 0xa8e6cf, name: 'Mint Harmony', description: 'This soft mint painting brings balance and peace, like a gentle spring breeze.' },
    { position: [-7.4, 2.5, 0], rotation: [0, Math.PI / 2, 0], color: 0x88d8c0, name: 'Sage Wisdom', description: 'This wise sage painting represents growth and natural beauty.' },
    { position: [-7.4, 2.5, 3], rotation: [0, Math.PI / 2, 0], color: 0xffd93d, name: 'Sunny Disposition', description: 'This cheerful yellow painting lifts spirits and brightens any space.' },
    { position: [8, 2.5, -3], rotation: [0, -Math.PI / 2, 0], color: 0x6c5ce7, name: 'Purple Majesty', description: 'This regal purple painting commands attention with its deep, rich tones.' },
    { position: [8, 2.5, 0], rotation: [0, -Math.PI / 2, 0], color: 0xfd79a8, name: 'Rose Blush', description: 'This delicate rose painting captures the softness of dawn light.' },
    { position: [8, 2.5, 3], rotation: [0, -Math.PI / 2, 0], color: 0x00b894, name: 'Emerald Forest', description: 'This rich emerald painting brings the vitality of nature indoors.' }
  ], []);

  // Preset camera view locations
  const presetLocations = useMemo(() => [
    {
      name: "Center",
      position: [0, 2.5, 0]
    },
    {
      name: "North Wall",
      position: [0, 2.5, -4]
    },
    {
      name: "South Wall", 
      position: [0, 2.5, 4]
    },
    {
      name: "West Wall",
      position: [-4, 2.5, 0]
    },
    {
      name: "East Wall",
      position: [4, 2.5, 0]
    },
    {
      name: "Table View",
      position: [2, 2.5, 2]
    }
  ], []);

  const lastClickTime = useRef(0);

  const handlePresetNavigation = useCallback((preset) => {
    if (isMoving || isAnimating) return;
    
    // Clear any active exhibit states before navigating
    setIsZoomedIn(false);
    setCurrentExhibit(null);
    setPopupVisible(false);
    setIsAnimating(false);
    
    // Stop any ongoing speech
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    // Instantly set camera position and rotation
    if (cameraRef.current) {
      cameraRef.current.position.set(...preset.position);
      
      // Set rotation based on the preset name
      switch(preset.name) {
        case "North Wall":
          cameraRef.current.rotation.set(0, 0, 0);
          break;
        case "South Wall":
          cameraRef.current.rotation.set(0, Math.PI, 0);
          break;
        case "West Wall":
          cameraRef.current.rotation.set(0, Math.PI / 2, 0);
          break;
        case "East Wall":
          cameraRef.current.rotation.set(0, -Math.PI / 2, 0);
          break;
        case "Table View":
          cameraRef.current.rotation.set(0, Math.PI, 0);
          break;
        case "Center":
        default:
          cameraRef.current.rotation.set(0, 0, 0);
          break;
      }
    }
  }, [isMoving, isAnimating]);

  const handleFloorClick = useCallback((point) => {
    const now = Date.now();
    
    if (now - lastClickTime.current < 100) {
      console.log('Click too fast, ignoring');
      return;
    }
    lastClickTime.current = now;
    
    if (isMoving) {
      console.log('Already moving, ignoring click');
      return;
    }
    
    const newTarget = new THREE.Vector3(point.x, 2.5, point.z);
    
    // Check if target is too close to current position
    if (cameraRef.current) {
      const distance = cameraRef.current.position.distanceTo(newTarget);
      if (distance < 0.1) {
        console.log('Target too close to current position, ignoring');
        return;
      }
    }
    
    console.log('Setting new target:', newTarget);
    setTargetPosition(newTarget);
    setIsMoving(true);
    setDestinationPosition([point.x, 0.05, point.z]);
    setDestinationVisible(true);
    setHoverVisible(false);
  }, [isMoving]);

  const handleMoveComplete = useCallback(() => {
    setIsMoving(false);
    setTargetPosition(null);
    setDestinationVisible(false);
    // Remove all the camera rotation code from here
  }, []);

  const handleExhibitClick = useCallback((exhibit) => {
    console.log('Exhibit clicked:', exhibit.userData.name);
    
    // Force reset any ongoing animations
    if (animationResetRef.current) {
      animationResetRef.current();
    }
    
    // Save position IMMEDIATELY when exhibit is clicked
    if (cameraRef.current) {
      originalCameraPosition.current.copy(cameraRef.current.position);
      originalCameraQuaternion.current.copy(cameraRef.current.quaternion);
      console.log('Saved position at click time:', originalCameraPosition.current);
    }
    
    // Clear all states immediately
    setIsAnimating(false);
    setIsZoomedIn(false);
    setCurrentExhibit(null);
    setPopupVisible(false);
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    // Start new zoom immediately (no timeout needed)
    setCurrentExhibit(exhibit);
    setIsZoomedIn(true);
    setIsAnimating(true);
    
    setTimeout(() => {
      setPopupTitle(exhibit.userData.name);
      setPopupText(exhibit.userData.audioText);
      setPopupVisible(true);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(exhibit.userData.audioText);
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
      
      setIsAnimating(false);
    }, 1200);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!isZoomedIn) return;
    
    // Stop any ongoing speech and hide popup immediately
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setPopupVisible(false);
    
    // Create a zoom-out target object BEFORE starting animation
    const zoomOutTarget = {
      position: originalCameraPosition.current,
      userData: { isZoomOut: true, name: 'zoom-out' }
    };
    
    // Set up zoom out animation with the target
    setCurrentExhibit(zoomOutTarget);
    setIsAnimating(true);
    
    // Clear states AFTER animation completes
    setTimeout(() => {
      setIsZoomedIn(false);
      setCurrentExhibit(null);
      setIsAnimating(false);
    }, 1200); // Match the animation duration
  }, [isZoomedIn]);

  const handleInteractiveMode = useCallback(() => {
    setIsInteractiveMode(true);
  }, []);

  const handleCloseInteractive = useCallback(() => {
    setIsInteractiveMode(false);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Escape') {
        if (isInteractiveMode) {
          handleCloseInteractive();
        } else if (isZoomedIn) {
          handleZoomOut();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInteractiveMode, isZoomedIn, handleCloseInteractive, handleZoomOut]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas shadows style={{ background: '#f0f0f0' }}>
        <PerspectiveCamera makeDefault position={[0, 2, 0]} fov={70} />
        
        <CameraCapture cameraRef={cameraRef} />

        <CameraController 
          targetPosition={targetPosition}
          isMoving={isMoving}
          onMoveComplete={handleMoveComplete}
          isZoomedIn={isZoomedIn}
          zoomTarget={currentExhibit}
          isAnimating={isAnimating}
          isInteractiveMode={isInteractiveMode}
          setCursorState={setCursorState}
          originalCameraPosition={originalCameraPosition}
          originalCameraQuaternion={originalCameraQuaternion}
          onAnimationReset={animationResetRef}
        />

        {/* Lighting */}
        <ambientLight intensity={1.5} />
        <pointLight 
          position={[0, 4, 8]} 
          intensity={1.5} 
          distance={15}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        {/* Point cloud room (using your PLY file) */}
        {/* <Suspense fallback={<FallbackRoom />}>
          <PointCloudRoom />
        </Suspense> */}

        {/* Gaussian Splat room (using your converted .splat file) */}
        <SplatRoom />

        {/* Invisible collision geometry for raycasting */}
        <Suspense fallback={null}>
            <CollisionGeometry 
              onFloorClick={handleFloorClick}
              setHoverPosition={setHoverPosition}
              setHoverVisible={setHoverVisible}
              isMoving={isMoving}
            />
        </Suspense>

        {/* Interactive table */}
        <Suspense fallback={null}>
          <InteractiveTable onInteract={handleInteractiveMode} />
        </Suspense>

        {/* Wall paintings */}
        {paintings.map((painting, index) => (
          <WallPainting
            key={index}
            position={painting.position}
            rotation={painting.rotation}
            color={painting.color}
            name={painting.name}
            description={painting.description}
            onExhibitClick={handleExhibitClick}
          />
        ))}

        {/* Floor markers */}
        <DestinationMarker 
          position={destinationPosition} 
          visible={destinationVisible} 
          color={0x00ff00} 
        />
        <DestinationMarker 
          position={hoverPosition} 
          visible={hoverVisible} 
          color={0xffffff} 
        />
      </Canvas>

      {/* UI Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'white',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '14px',
        zIndex: 100
      }}>
        <div><strong>Controls:</strong></div>
        <div>Click floor - Move to location</div>
        <div>Click & drag - Look around</div>
        <div>Click exhibits - View info</div>
        <div>ESC - Exit zoom</div>
      </div>

      {/* Text popup */}
      <TextPopup 
        visible={popupVisible}
        title={popupTitle}
        text={popupText}
        onClose={handleZoomOut}
      />

      {/* Interactive overlay */}
      <InteractiveOverlay 
        visible={isInteractiveMode}
        onClose={handleCloseInteractive}
      />

      <NavigationOverlay
        presetLocations={presetLocations}
        onPresetClick={handlePresetNavigation}
        isMoving={isMoving}
        isAnimating={isAnimating}
      />
    </div>
  );
}

export default MuseumWalkthrough;