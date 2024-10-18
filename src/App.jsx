import React, { useEffect, useState, useMemo } from 'react';
import { DeckGL } from '@deck.gl/react';
import { GeoJsonLayer, BitmapLayer } from '@deck.gl/layers';
import {TileLayer} from '@deck.gl/geo-layers';
import { MapView, FlyToInterpolator } from '@deck.gl/core';
import { easeCubic } from 'd3-ease';

const INITIAL_VIEW_STATE = {
  longitude: 2.2137,
  latitude: 46.2276,
  zoom: 5,
  pitch: 45,
  bearing: 0
};

const FRENCH_REGIONS = './REGION.json';
const FRENCH_DEPARTEMENTS = './DEPARTEMENT.json';

function App() {
  const [activeLayer, setActiveLayer] = useState('region');
  const [layers, setLayers] = useState([]);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [clickedFeature, setClickedFeature] = useState(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  useEffect(() => {
    const loadLayer = async () => {
      let layerData;

      const commonLayerSettings = {
        stroked: true,
        filled: true,
        lineWidthMinPixels: 2,
        pickable: true,
        onHover: ({ object }) => {
          if (object) setHoveredFeature(object);
          else setHoveredFeature(null); // Reset hover state when not hovering
        },
        onClick: info => {
          if (info.object) {
            setClickedFeature(info.object); // Update clicked feature
            setViewState({
              ...viewState,
              longitude: info.coordinate[0],
              latitude: info.coordinate[1],
              zoom: activeLayer === 'departement' ? 8 : 7, // Higher zoom for departement
              transitionDuration: 1000, // Smooth transition
              transitionInterpolator: new FlyToInterpolator(),
              transitionEasing: easeCubic,
            });
          }
        },
        updateTriggers: {
          getFillColor: [hoveredFeature, clickedFeature],
          getLineColor: [hoveredFeature, clickedFeature], // Update line color on changes
        },
      };

      
      switch (activeLayer) {
        case 'region':
          layerData = new GeoJsonLayer({
            id: 'region-layer',
            data: FRENCH_REGIONS,
            ...commonLayerSettings,
            getLineColor: d => {
              if (hoveredFeature && hoveredFeature.properties.ID === d.properties.ID) return [0, 125, 255, 255]; // Darker on hover for all
              if (clickedFeature && clickedFeature.properties.ID === d.properties.ID) return [0, 150, 255, 255]; // Darker on click
              return [0, 150, 255, 20]; // Default color           
            },
            
            getFillColor: d => {
              if (hoveredFeature && clickedFeature && clickedFeature.properties.ID === d.properties.ID) return [0, 150, 255, 50]; // Darker on hover once clicked but not the one clicked
              if (hoveredFeature && hoveredFeature.properties.ID === d.properties.ID) return [0, 125, 255, 80]; // Darker on hover for all
              if (clickedFeature && clickedFeature.properties.ID !== d.properties.ID) return [0, 150, 255, 0]; // Reset color for all except the one clicked
              return [0, 150, 255, 50]; // Default color
            }
          });
          break;

        case 'departement':
          layerData = new GeoJsonLayer({
            id: 'departement-layer',
            data: FRENCH_DEPARTEMENTS,
            ...commonLayerSettings,
            getLineColor: d => {
              if (hoveredFeature && hoveredFeature.properties.ID === d.properties.ID) return [0, 125, 255, 255]; // Darker on hover for all
              if (clickedFeature && clickedFeature.properties.ID === d.properties.ID) return [0, 150, 255, 255]; // Darker on click
              return [0, 150, 255, 20]; // Default color  
            },
            getFillColor: d => {
              if (hoveredFeature && clickedFeature && clickedFeature.properties.ID === d.properties.ID) return [0, 150, 255, 50]; // Darker on hover once clicked but not the one clicked
              if (hoveredFeature && hoveredFeature.properties.ID === d.properties.ID) return [0, 125, 255, 80]; // Darker on hover for all
              if (clickedFeature && clickedFeature.properties.ID !== d.properties.ID) return [0, 150, 255, 0]; // Reset color for all except the one clicked
              return [0, 150, 255, 50]; // Default color
            },
          });
          break;

        default:
          layerData = null;
      }

      setLayers([layerData]);
    };

    loadLayer();
  }, [activeLayer, hoveredFeature, clickedFeature, viewState]); // Re-run on activeLayer, hoveredFeature, clickedFeature, or viewState change

  const countriesLayer = new TileLayer({
    id: 'tile-layer',
    data: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,
    renderSubLayers: props => {
      const {
        bbox: {west, south, east, north}
      } = props.tile;
      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north]
      });
    }
  });

  return (
    <div>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        controller={true}
        layers={[countriesLayer, ...layers]}
        views={new MapView({ repeat: true })}
        style={{ height: "100vh", width: "100%" }}
      />
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
        <button onClick={() => setActiveLayer('region')}>Show Regions</button>
        <button onClick={() => setActiveLayer('departement')}>Show Departements</button>
      </div>
      {clickedFeature && (
        <div style={{ position: 'absolute', top: '50px', left: '10px', zIndex: 1, background: 'white', padding: '5px' }}>
          <strong>Clicked Feature:</strong> {clickedFeature.properties.NOM || 'Unknown'}
        </div>
      )}
    </div>
  );
}

export default App;

