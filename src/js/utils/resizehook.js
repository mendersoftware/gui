import { useLayoutEffect, useRef, useState } from 'react';

import { TIMEOUTS } from '../constants/appConstants';

export const useWindowSize = () => {
  const [size, setSize] = useState({ height: window.innerHeight, width: window.innerWidth });
  const timer = useRef();
  useLayoutEffect(() => {
    const handleResize = () => {
      timer.current = setTimeout(() => setSize({ height: window.innerHeight, width: window.innerWidth }), TIMEOUTS.halfASecond);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
};

export default useWindowSize;
