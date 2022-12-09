import { useLayoutEffect, useState } from 'react';

import { TIMEOUTS } from '../constants/appConstants';

export const useWindowSize = () => {
  const [size, setSize] = useState({ height: window.innerHeight, width: window.innerWidth });
  useLayoutEffect(() => {
    const handleResize = () => setTimeout(() => setSize({ height: window.innerHeight, width: window.innerWidth }), TIMEOUTS.halfASecond);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
};

export default useWindowSize;
