import React, { useState, useEffect } from 'react';
import { isMobileDevice } from './DeviceDetection';
import MuseumWalkthrough from './MuseumWalkthrough'; // Your original desktop component
import MobileMuseum from './MobileMuseum';

function App() {
  const [deviceType, setDeviceType] = useState(null);
  const [userOverride, setUserOverride] = useState(null);

  useEffect(() => {
    // Check for stored user preference
    const storedPreference = localStorage.getItem('museumDevicePreference');
    if (storedPreference) {
      setUserOverride(storedPreference);
      setDeviceType(storedPreference);
    } else {
      // Auto-detect device
      const detected = isMobileDevice() ? 'mobile' : 'desktop';
      setDeviceType(detected);
    }
  }, []);

  const switchVersion = (version) => {
    localStorage.setItem('museumDevicePreference', version);
    setUserOverride(version);
    setDeviceType(version);
  };

  // Show loading while detecting
  if (!deviceType) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#000',
        color: 'white'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      {deviceType === 'mobile' ? <MobileMuseum /> : <MuseumWalkthrough />}
      
      {/* Version switcher button */}
      <button
        onClick={() => switchVersion(deviceType === 'mobile' ? 'desktop' : 'mobile')}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '10px 15px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '12px',
          zIndex: 9999
        }}
      >
        Switch to {deviceType === 'mobile' ? 'Desktop' : 'Mobile'} Version
      </button>
    </>
  );
}

export default App;