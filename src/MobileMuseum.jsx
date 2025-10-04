import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Splat, useGLTF, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

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

function SplatRoom() {
  const splatUrl = "https://raw.githubusercontent.com/ecksjeff/museum-react/main/public/living-room.splat"
  
  return (
    <Suspense fallback={<FallbackRoom />}>
      <ErrorBoundary fallback={<FallbackRoom />}>
        <Splat 
          src={splatUrl}
          scale={3.5}
          position={[4, 0, 0]}
          rotation={[0, .3, 0]}
        />
      </ErrorBoundary>
    </Suspense>
  );
}

// Fallback room component
function FallbackRoom() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 13]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
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
      <mesh position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 13]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// Interactive table
function InteractiveTable({ onInteract }) {
  const { scene, error } = useGLTF('photo-table.glb');

  useEffect(() => {
    if (scene) {
      scene.scale.setScalar(0.6);
      scene.traverse((child) => {
        if (child.isMesh) {
          child.userData = {
            isExhibit: true,
            isInteractiveTable: true,
            name: 'Roz Wyman Family Collection'
          };
        }
      });
    }
  }, [scene]);

  if (error || !scene) {
    return (
      <mesh position={[2, 1, 5]} onClick={(e) => { e.stopPropagation(); onInteract(); }}>
        <boxGeometry args={[2, 0.8, 1]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
    );
  }

  return (
    <group>
      <primitive object={scene} position={[2, 0, 5]} rotation={[0, Math.PI, 0]} />
      <mesh 
        position={[2, 1, 5]}
        onClick={(e) => { e.stopPropagation(); onInteract(); }}
      >
        <boxGeometry args={[2, 1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

// Wall paintings
function WallPainting({ position, rotation, color, name, description, onExhibitClick }) {
  return (
    <mesh 
      position={position} 
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onExhibitClick({ position: new THREE.Vector3(...position), userData: { name, audioText: description } });
      }}
    >
      <planeGeometry args={[1.5, 1.2]} />
      <meshLambertMaterial color={color} />
    </mesh>
  );
}

// Touch controls for mobile
function TouchCameraControls({ isInteractiveMode, isAnimating, onCameraMove }) {
  const { camera } = useThree();
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const MOVE_SPEED = 2.0;
  const TURN_SPEED = 0.8;

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (isInteractiveMode || isAnimating) return;
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      isDraggingRef.current = false;
    };

    const handleTouchMove = (e) => {
      if (isInteractiveMode || isAnimating) return;
      e.preventDefault();
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        isDraggingRef.current = true;

        if (onCameraMove) onCameraMove();

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe - turn
          const turnAmount = -deltaX * 0.004 * TURN_SPEED;
          const euler = new THREE.Euler(0, 0, 0, 'YXZ');
          euler.setFromQuaternion(camera.quaternion);
          euler.y -= turnAmount;
          camera.quaternion.setFromEuler(euler);
        } else {
          // Vertical swipe - move
          const moveAmount = -deltaY * 0.01 * MOVE_SPEED;
          const forward = new THREE.Vector3();
          camera.getWorldDirection(forward);
          forward.multiplyScalar(moveAmount);
          
          const newPosition = camera.position.clone().add(forward);
          newPosition.x = Math.max(-7, Math.min(7, newPosition.x));
          newPosition.z = Math.max(-6.5, Math.min(7, newPosition.z));
          newPosition.y = 3;
          
          camera.position.copy(newPosition);
        }

        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [camera, isInteractiveMode, isAnimating, onCameraMove]);

  return null;
}

// Main mobile museum component
function MobileMuseum() {
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupText, setPopupText] = useState('');

  const paintings = [
    { position: [-2, 2.5, -6.9], rotation: [0, 0, 0], color: 0x4ecdc4, name: 'Teal Serenity', description: 'This serene teal painting evokes feelings of calm and tranquility.' },
    { position: [0, 2.5, -6.9], rotation: [0, 0, 0], color: 0xff6b6b, name: 'Coral Passion', description: 'This vibrant coral painting radiates warmth and energy.' },
    { position: [2, 2.5, -6.9], rotation: [0, 0, 0], color: 0xffe66d, name: 'Golden Dreams', description: 'This bright golden painting brings light and optimism.' },
    { position: [-7.4, 2.5, -3], rotation: [0, Math.PI / 2, 0], color: 0xa8e6cf, name: 'Mint Harmony', description: 'This soft mint painting brings balance and peace.' },
    { position: [-7.4, 2.5, 0], rotation: [0, Math.PI / 2, 0], color: 0x88d8c0, name: 'Sage Wisdom', description: 'This wise sage painting represents growth and natural beauty.' },
    { position: [-7.4, 2.5, 3], rotation: [0, Math.PI / 2, 0], color: 0xffd93d, name: 'Sunny Disposition', description: 'This cheerful yellow painting lifts spirits.' },
    { position: [8, 2.5, -3], rotation: [0, -Math.PI / 2, 0], color: 0x6c5ce7, name: 'Purple Majesty', description: 'This regal purple painting commands attention.' },
    { position: [8, 2.5, 0], rotation: [0, -Math.PI / 2, 0], color: 0xfd79a8, name: 'Rose Blush', description: 'This delicate rose painting captures softness.' },
    { position: [8, 2.5, 3], rotation: [0, -Math.PI / 2, 0], color: 0x00b894, name: 'Emerald Forest', description: 'This rich emerald painting brings vitality.' }
  ];

  const handleExhibitClick = useCallback((exhibit) => {
    setPopupTitle(exhibit.userData.name);
    setPopupText(exhibit.userData.audioText);
    setPopupVisible(true);

    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(exhibit.userData.audioText);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }, []);

  const handleClosePopup = useCallback(() => {
    setPopupVisible(false);
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }, []);

  const handleInteractiveMode = useCallback(() => {
    setIsInteractiveMode(true);
  }, []);

  const handleCloseInteractive = useCallback(() => {
    setIsInteractiveMode(false);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', touchAction: 'none' }}>
      <Canvas shadows gl={{ antialias: false, powerPreference: 'default' }}>
        <PerspectiveCamera makeDefault position={[0, 3, 0]} fov={70} />
        
        <TouchCameraControls 
            isInteractiveMode={isInteractiveMode} 
            isAnimating={isAnimating}
            onCameraMove={handleClosePopup}
        />

        <ambientLight intensity={1.5} />
        <pointLight position={[0, 4, 8]} intensity={1.5} distance={15} />

        <Suspense fallback={<FallbackRoom />}>
          <SplatRoom />
        </Suspense>

        <Suspense fallback={null}>
          <InteractiveTable onInteract={handleInteractiveMode} />
        </Suspense>

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
      </Canvas>

      {/* Controls UI */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'white',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '8px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 100,
        maxWidth: '200px'
      }}>
        <div><strong>Controls:</strong></div>
        <div>Swipe up/down - Move forward/back</div>
        <div>Swipe left/right - Turn left/right</div>
        <div>Tap exhibits to interact</div>
      </div>

      {/* Text popup */}
      {popupVisible && (
        <div 
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          maxWidth: '280px',
          fontSize: '13px',
          lineHeight: '1.4',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          zIndex: 200,
          textAlign: 'center',
          userSelect: 'text',
          WebkitUserSelect: 'text'
        }}>
          <button 
            onClick={handleClosePopup}
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
              cursor: 'pointer'
            }}
          >
            ×
          </button>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            color: '#ffd700', 
            fontSize: '15px', 
            fontWeight: 'bold',
            userSelect: 'text',
            WebkitUserSelect: 'text'
            }}>
            {popupTitle}
          </h3>
          <p style={{ 
            margin: 0,
            userSelect: 'text',
            WebkitUserSelect: 'text'
            }}>
                {popupText}
            </p>
        </div>
      )}

      {/* Interactive overlay - same as desktop version */}
      {isInteractiveMode && (
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
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '400px',
            width: '85%',
            textAlign: 'center',
            position: 'relative'
          }}>
            <button 
              onClick={handleCloseInteractive}
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
            <button style={{
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
            }}>
              View Family Photo Album
            </button>
            <button style={{
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
            }}>
              Watch Family Documentary
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileMuseum;