import React, { useEffect, useState, useMemo } from 'react';
import { DeckGL } from '@deck.gl/react';
import { GeoJsonLayer, BitmapLayer } from '@deck.gl/layers';
import {TileLayer} from '@deck.gl/geo-layers';
import { MapView, FlyToInterpolator } from '@deck.gl/core';
import { easeCubic } from 'd3-ease';
// import CircularProgress from '@mui/material/CircularProgress';
import { ButtonGroup, Button, CircularProgress } from '@mui/material';

const INITIAL_VIEW_STATE = {
  longitude: 2.2137,
  latitude: 46.2276,
  zoom: 5,
  pitch: 45,
  bearing: 0
};

const FRENCH_REGIONS = './src/json/REGION.json';
const FRENCH_DEPARTEMENTS = './src/json/DEPARTEMENT.json';
const FRENCH_COMMUNES = './src/json/COMMUNE.json';

function App() {
  const [activeLayer, setActiveLayer] = useState('region');
  const [layers, setLayers] = useState([]);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [clickedFeature, setClickedFeature] = useState(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [loading, setLoading] = useState(false);

  // Monitor zoom level to automatically switch layers
  useEffect(() => {
    if (viewState.zoom >= 11 && activeLayer !== 'commune') {
      setActiveLayer('commune');
    } else if (viewState.zoom >= 8 && viewState.zoom < 11 && activeLayer !== 'departement') {
      setActiveLayer('departement');
    } else if (viewState.zoom < 8 && activeLayer !== 'region') {
      setActiveLayer('region');
    }
  }, [viewState.zoom, activeLayer]);

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
          else setHoveredFeature(null);
        },
        onClick: info => {
          if (info.object) {
            setClickedFeature(info.object);
            setViewState({
              ...viewState,
              longitude: info.coordinate[0],
              latitude: info.coordinate[1],
              zoom: activeLayer === 'departement' ? 9 : 7,
              transitionDuration: 1000,
              transitionInterpolator: new FlyToInterpolator(),
              transitionEasing: easeCubic,
            });
          } else {
            setClickedFeature(null);
          }
        },
        updateTriggers: {
          getFillColor: [hoveredFeature, clickedFeature],
          getLineColor: [hoveredFeature, clickedFeature],
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

          case 'commune':
          layerData = new GeoJsonLayer({
            id: 'commune-layer',
            data: FRENCH_COMMUNES,
            ...commonLayerSettings,
            getLineColor: d => {
              if (hoveredFeature && hoveredFeature.properties.ID === d.properties.ID) return [0, 125, 255, 255];
              if (clickedFeature && clickedFeature.properties.ID === d.properties.ID) return [0, 150, 255, 255];
              return [0, 150, 255, 20];
            },
            getFillColor: d => {
              if (hoveredFeature && clickedFeature && clickedFeature.properties.ID === d.properties.ID) return [0, 150, 255, 50];
              if (hoveredFeature && hoveredFeature.properties.ID === d.properties.ID) return [0, 125, 255, 80];
              if (clickedFeature && clickedFeature.properties.ID !== d.properties.ID) return [0, 150, 255, 0];
              return [0, 150, 255, 50];
            }
          });
          break;

        default:
          layerData = null;
      }

      setLayers([layerData]);
      setLoading(false); // Stop loading once layer is set
    };

    loadLayer();
  }, [activeLayer, hoveredFeature, clickedFeature, viewState]); // Re-run on activeLayer, hoveredFeature, clickedFeature, or viewState change

  const countriesLayer = new TileLayer({
    id: 'tile-layer',
    data: 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', 
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
      {/* <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
        <ButtonGroup orientation="horizontal">
          <Button onClick={() => setActiveLayer('region')} className={activeLayer === 'region' ? 'active' : ''}>
            Show Regions
          </Button>
          <Button onClick={() => setActiveLayer('departement')} className={activeLayer === 'departement' ? 'active' : ''}>
            Show Departements
          </Button>
        </ButtonGroup>
      </div> */}

      {/* Loader overlay */}
      {loading && (
        <div style={{
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 2
        }}>
          <CircularProgress size={60} />
        </div>
      )}
      
      {clickedFeature && (
        <div style={{ position: 'absolute', top: '50px', left: '10px', zIndex: 1, background: 'white', padding: '5px' }}>
          <strong>Clicked Feature:</strong> {clickedFeature.properties.NOM || 'Unknown'}
        </div>
      )}
    </div>
  );
}

export default App;