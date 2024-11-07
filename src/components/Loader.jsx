import React from 'react';

/**
 * Loader component that displays a centered loading spinner.
 * 
 * This component uses inline styles to position the loader in the center of the screen
 * and applies a high z-index to ensure it appears above other content.
 * 
 * @component
 * @example
 * return (
 *   <Loader />
 * )
 */
const Loader = () => (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 99999,
  }}>
    <div className="loader"></div>
  </div>
);

export default Loader;
