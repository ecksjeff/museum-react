// DeviceDetection.js
export const isMobileDevice = () => {
  // Check for touch capability and screen size
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  
  // Check user agent for mobile devices
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUA = mobileRegex.test(navigator.userAgent);
  
  return (hasTouch && isSmallScreen) || isMobileUA;
};

export const getDeviceType = () => {
  return isMobileDevice() ? 'mobile' : 'desktop';
};