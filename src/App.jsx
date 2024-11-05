import React, { useEffect, useState, useRef } from 'react';
import { DeckGL } from '@deck.gl/react';
import { GeoJsonLayer, BitmapLayer } from '@deck.gl/layers';
import {TileLayer} from '@deck.gl/geo-layers';
import { MapView, FlyToInterpolator } from '@deck.gl/core';
import { easeCubic } from 'd3-ease';
import { ButtonGroup, Button } from '@mui/material';


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
  const [isLoading, setIsLoading] = useState(false);
  const [showWindLayer, setShowWindLayer] = useState(false);
  const [windData, setWindData] = useState(null);


  const previousLayer = useRef(activeLayer);

  useEffect(() => {
    const { zoom } = viewState;

    if (zoom >= 11 && activeLayer !== 'commune') {
      setActiveLayer('commune');
    } else if (zoom >= 8 && zoom < 10 && activeLayer !== 'departement') {
      setActiveLayer('departement');
    } else if (zoom < 8 && activeLayer !== 'region') {
      setActiveLayer('region');
    }
  }, [viewState.zoom, activeLayer]);

  useEffect(() => {
    if (previousLayer.current !== activeLayer) {
      setIsLoading(true);
      previousLayer.current = activeLayer;
    }

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
              zoom: activeLayer === 'commune' ? 12 : activeLayer === 'departement' ? 9 : 8,
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
              return [0, 150, 255, 40]; // Default color  
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
      setTimeout(() => setIsLoading(false), 1000);
    };

    loadLayer();
  }, [activeLayer, hoveredFeature, clickedFeature, viewState]);

  useEffect(() => {
    const fetchWindData = async () => {
      const response = await fetch('URL_DE_VOTRE_API_DE_VITESSE_DU_VENT');
      const data = await response.json();
      setWindData(data);
    };

    if (showWindLayer) {
      fetchWindData();
    }
  }, [showWindLayer]);

  useEffect(() => {
    if (windData) {
      const windLayer = new GeoJsonLayer({
        id: 'wind-layer',
        data: windData,
        stroked: false,
        filled: true,
        getFillColor: [255, 0, 0, 100],
        getRadius: 100,
        pointRadiusMinPixels: 2,
        pointRadiusScale: 2000,
      });

      setLayers(prevLayers => [...prevLayers, windLayer]);
    }
  }, [windData]);

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
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
      <ButtonGroup orientation="horizontal">
          <Button onClick={() => setShowWindLayer(!showWindLayer)} className={showWindLayer ? 'active' : ''}>
            {showWindLayer ? 'Hide Wind Layer' : 'Show Wind Layer'}
          </Button>
        </ButtonGroup>
      </div>
      {isLoading && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 99999 }}>
          <div className="loader"></div> {/* Loader CSS */}
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