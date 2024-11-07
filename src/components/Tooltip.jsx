import React from 'react';
import '../styles/tooltip.css';

/**
 * Tooltip component that displays information about a feature at the mouse position.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.feature - The feature object containing properties to display.
 * @param {Object} props.feature.properties - The properties of the feature.
 * @param {string} props.feature.properties.NOM - The name property of the feature.
 * @param {Object} props.mousePosition - The current mouse position.
 * @param {number} props.mousePosition.x - The x-coordinate of the mouse position.
 * @param {number} props.mousePosition.y - The y-coordinate of the mouse position.
 * @returns {JSX.Element} The Tooltip component.
 */
const Tooltip = ({ feature, mousePosition }) => (
  <div
    className="tooltip"
    style={{
      top: `${mousePosition.y - 100}px`,
      left: `${mousePosition.x + 30}px`,
    }}
  >
    <h3>{feature.properties.NOM}</h3>
  </div>
);

export default Tooltip;