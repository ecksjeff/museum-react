import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Splat, useGLTF, PerspectiveCamera, useProgress } from '@react-three/drei';
import * as THREE from 'three';

// Family photo data
const familyPhotos = [
  { src: 'images/family/roz_41.jpg', caption: '(L-R) Eugene Wyman, Roz Wyman, Oliver Wyman, Samantha Wyman, 2011' },
  { src: 'images/family/roz_1.jpg', caption: 'B&W, Oscar Wiener (L) Sarah Wiener (R) in their pharmacy, 1950s' },
  { src: 'images/family/roz_2.jpg', caption: 'B&W, Oscar Wiener (L) Sarah Wiener (R) in their pharmacy, 1931' },
  { src: 'images/family/roz_3.jpg', caption: 'B&W, Roz Wiener in front of her mother.s Franklin D. Roosevelt poster that was hung up at the pharmacy, 1932' },
  { src: 'images/family/roz_20.jpg', caption: "B&W, vintage print, Betty Wyman (L) Bob Wyman (center L), Roz Wyman (center R), Brad Wyman (R) visiting City Hall to support their mother's reelection, 1966" },
  { src: 'images/family/roz_42.jpg', caption: 'Roz Wyman (L), Oliver Wyman (center), Eugene Wyman (R), 2012' },
  { src: 'images/family/roz_66.jpg', caption: 'B&W, vintage print, (L-R) Betty Wyman, Roz wyman, Bob Wyman, Gene Wyman, 1962' },
  { src: 'images/family/roz_83.jpg', caption: "(L-R) Brad Wyman, Eugene Wyman, Samantha Wyman, Roz Wyman, Oliver Wyman, Peggy Wyman, Bob Wyman, Samantha's boyfriend, holiday celebration, 2014" },
  { src: 'images/family/roz_84.jpg', caption: "(L-R) Bob Wyman, Peggy Wyman, John  Deeb, Betty Wyman, Jean Firstenberg, Roz Wyman, Oliver Wyman, Eugene Wyman, Brad Wyman, 2015" },
  { src: 'images/family/roz_85.jpg', caption: "(L-R) Oliver Wyman, Brad Wyman, Roz Wyman, Eugene Wyman, lunch celebrating the grandkids birthday, 2016" },
  { src: 'images/family/roz_88.jpg', caption: "B&W, vintage print, (L-R), Betty Wyman, Gene Wyman, Roz Wyman, Brad Wyman, Bob Wyman, their dog Bingo, 1965" },
  { src: 'images/family/roz_99.jpg', caption: "B&W, vintage print, (L-R) Oscar Wiener, Roz Wiener, Sarah Wiener, Brother George, celebrating the win of the 1953 election of Roz, 1953" },
  { src: 'images/family/roz_100.jpg', caption: "Color, vintage print, (L-R) Bob Wyman, Brad Wyman, Roz Wyman, Edward Kennedy, Betty Wyman, having Edward over their home preparing Roz for her second run at office, 1970s" },
  { src: 'images/family/roz_97.jpg', caption: "Color, vintage print, (L-R) Betty Wyman, Gene Wyman, Bob Wyman, Abba Eban, Roz Wyman, Brad Wyman, having Abba Eban over the home, 1970s" },
  { src: 'images/family/roz_131.jpg', caption: "B&W, 8x10 inch, vintage print, (L-R) Gene Wyman, Roz Wyman, Betty Wyman, 1958" },
  { src: 'images/family/roz_149.jpg', caption: "B&W, 8x10 inch, vintage print, (L-R) Robert Kennedy, Gene Wyman, Betty Wyman, Bob Wyman, Brad Wyman, 1965" },
  { src: 'images/family/roz_154.jpg', caption: "B&W, 10x8inch, framed, vintage print, Gene Wyman (L), RRoz Wyman (R), at a convention, 1963" },
  { src: 'images/family/roz_159.jpg', caption: "Color,  framed, vintage print, 8x10 inch, (L-R) Gene Wyman, J. Edgar Hoover, Roz Wyman,  Betty Wyman, Bob Wyman, Brad Wyman, June 10th, 1967" },
  { src: 'images/family/roz_183.jpg', caption: 'scrapbook page, B&W, vintage print, "Roz with mom and dad" Top: 1953 Bottom: 1965' },
  { src: 'images/family/roz_185.jpg', caption: "scrapbook page, B&W, vintage prints, Roz and Gene Wyman with Betty Wyman, Bob Wyman, Brad Wyman, 1965" },
  { src: 'images/family/roz_186.jpg', caption: 'scrapbook page, Sepia, B&W, Top: "Bobby 1960"  featuring Betty Wyman Bottom: "Brad 1963"' }
];

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

function LoadingScreen({ progress, isProcessing }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#ffffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      color: 'grey'
    }}>
      <h2 style={{ marginBottom: '20px' }}>
        {isProcessing ? 'Processing scene...' : 'Loading Museum...'}
      </h2>
      <div style={{
        width: '300px',
        height: '20px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #b9b9b9ff, #a7a7a7ff)',
          transition: 'width 0.3s ease'
        }}/>
      </div>
      <p style={{ marginTop: '10px', fontSize: '14px' }}>
        {isProcessing ? 'Almost ready...' : `${Math.round(progress)}%`}
      </p>
    </div>
  );
}

function Loader() {
  const { progress, active } = useProgress();
  const [shouldHide, setShouldHide] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (progress >= 100) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setShouldHide(true);
      }, 3000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [progress]);

  useEffect(() => {
    if (!active && progress >= 100) {
      setShouldHide(true);
    }
  }, [active, progress]);

  if (shouldHide) {
    return null;
  }

  return (
    <LoadingScreen 
      progress={progress} 
      isProcessing={progress >= 100} 
    />
  );
}

function SplatRoom() {
  const splatUrl = "https://raw.githubusercontent.com/ecksjeff/museum-react/main/public/Splat5.splat"
  
  return (
    <Suspense fallback={<FallbackRoom />}>
      <ErrorBoundary fallback={<FallbackRoom />}>
        <Splat 
          src={splatUrl}
          scale={1.2}
          position={[1.65, 0, 3.45]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      </ErrorBoundary>
    </Suspense>
  );
}

function FallbackRoom() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 13]} />
        <meshBasicMaterial color="#000000" opacity={0.1} transparent />
      </mesh>
    </group>
  );
}

function InteractiveTable({ onInteract, setHoverVisible }) {
  const dragStartRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  return (
    <mesh 
      position={[1.65, .5, 4]}
      onPointerEnter={(e) => {
        e.stopPropagation();
        if (setHoverVisible) setHoverVisible(false);
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        dragStartRef.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
        isDraggingRef.current = false;
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
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
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}

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
          const turnAmount = deltaX * 0.01 * TURN_SPEED;
          const euler = new THREE.Euler(0, 0, 0, 'YXZ');
          euler.setFromQuaternion(camera.quaternion);
          euler.y -= turnAmount;
          camera.quaternion.setFromEuler(euler);
        } else {
          const moveAmount = -deltaY * 0.01 * MOVE_SPEED;
          const forward = new THREE.Vector3();
          camera.getWorldDirection(forward);
          forward.multiplyScalar(moveAmount);
          
          const newPosition = camera.position.clone().add(forward);
          newPosition.x = Math.max(-3.5, Math.min(6.5, newPosition.x));
          newPosition.z = Math.max(-5, Math.min(4, newPosition.z));
          newPosition.y = 1.5;
          
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

function MobileMuseum() {
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupText, setPopupText] = useState('');
  const [currentView, setCurrentView] = useState('selection');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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
    setCurrentView('selection');
  }, []);

  const openPhotoAlbum = useCallback(() => {
    setCurrentView('photos');
    setCurrentPhotoIndex(0);
  }, []);

  const openDocumentary = useCallback(() => {
    setCurrentView('video');
  }, []);

  const backToSelection = useCallback(() => {
    setCurrentView('selection');
  }, []);

  const nextPhoto = useCallback(() => {
    if (currentPhotoIndex < familyPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  }, [currentPhotoIndex]);

  const previousPhoto = useCallback(() => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  }, [currentPhotoIndex]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', touchAction: 'none' }}>
      <Loader />

      <Canvas shadows gl={{ antialias: false, powerPreference: 'default' }}>
        <PerspectiveCamera makeDefault position={[0, 1.5, 0]} fov={70} />
        
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
        <div>Tap table to interact</div>
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
            onTouchEnd={(e) => {
              e.stopPropagation();
              handleClosePopup();
            }}
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

      {/* Interactive overlay */}
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
          {currentView === 'selection' && (
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
      )}
    </div>
  );
}

export default MobileMuseum;