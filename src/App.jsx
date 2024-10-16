import React from 'react';
import { DeckGL } from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { MapView } from '@deck.gl/core';

const INITIAL_VIEW_STATE = {
  longitude: 2.2137,
  latitude: 46.2276,
  zoom: 5,
  pitch: 45,
  bearing: 0
};

const COUNTRIES = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson';

function App() {
  const countriesLayer = new GeoJsonLayer({
    id: 'countries',
    data: COUNTRIES,
    stroked: true,
    filled: true,
    lineWidthMinPixels: 2,
    getLineColor: [255, 255, 255],
    getFillColor: [200, 200, 200, 100],
  });
  
  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={[countriesLayer]}
      views={new MapView({ repeat: true })}
      style={{ height: "100vh", width: "100%" }}
    />
  );
}

export default App;