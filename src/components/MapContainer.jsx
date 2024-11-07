import React from 'react';
import { DeckGL } from '@deck.gl/react';
import { MapView } from '@deck.gl/core';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';

/**
 * MapContainer component renders a DeckGL map with specified layers and view state.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.viewState - The current view state of the map.
 * @param {Function} props.onViewStateChange - Callback function to handle view state changes.
 * @param {Array} props.layers - Array of additional layers to be rendered on the map.
 *
 * @returns {JSX.Element} The rendered DeckGL map component.
 */
const MapContainer = ({ viewState, onViewStateChange, layers }) => {
  const countriesLayer = new TileLayer({
    id: 'tile-layer',
    data: 'https://basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,
    renderSubLayers: props => new BitmapLayer(props, {
      data: null,
      image: props.data,
      bounds: [props.tile.bbox.west, props.tile.bbox.south, props.tile.bbox.east, props.tile.bbox.north],
    }),
  });

  return (
    <DeckGL
      viewState={viewState}
      onViewStateChange={({ viewState }) => onViewStateChange(viewState)}
      controller={true}
      layers={[countriesLayer, ...layers]}
      views={new MapView({ repeat: true })}
      style={{ height: '100vh', width: '100%' }}
    />
  );
};

export default MapContainer;
