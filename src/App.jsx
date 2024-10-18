import React, { useEffect, useState, useMemo } from 'react';
import { DeckGL } from '@deck.gl/react';
import { GeoJsonLayer, TextLayer, BitmapLayer } from '@deck.gl/layers';
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

const COUNTRIES = 'https://r2.datahub.io/clvyjaryy0000la0cxieg4o8o/main/raw/data/countries.geojson';
const FRENCH_REGIONS = './REGION.json';
const FRENCH_DEPARTEMENTS = './DEPARTEMENT.json';
const FRENCH_COMMUNES_URL = './COMMUNE.json';

function App() {
  const [activeLayer, setActiveLayer] = useState('region');
  const [layers, setLayers] = useState([]);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [clickedFeature, setClickedFeature] = useState(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [frenchCommunes, setFrenchCommunes] = useState(null);


  useEffect(() => {
    fetch(FRENCH_COMMUNES_URL)
      .then(response => response.json())
      .then(data => setFrenchCommunes(data));
  }, []);

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

  const countriesLayer = new GeoJsonLayer({
    id: 'countries',
    data: COUNTRIES,
    stroked: true,
    filled: true,
    lineWidthMinPixels: 2,
    getLineColor: [255, 255, 255],
    getFillColor: [200, 200, 200, 100],
  });

  // const countriesLayer = new TileLayer({
  //   id: 'tile-layer',
  //   data: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
  //   minZoom: 0,
  //   maxZoom: 19,
  //   tileSize: 256,
  //   renderSubLayers: props => {
  //     const {
  //       bbox: {west, south, east, north}
  //     } = props.tile;
  //     return new BitmapLayer(props, {
  //       data: null,
  //       image: props.data,
  //       bounds: [west, south, east, north]
  //     });
  //   }
  // });

  const filteredCities = useMemo(() => {
    if (!frenchCommunes) return [];

    return frenchCommunes.features.filter(d => {
      if (viewState.zoom <= 5) {
        return d.properties.STATUT === "Capitale d'état"; // Show only capitals
      } else if (viewState.zoom > 5 && viewState.zoom <= 7) {
        return d.properties.POPULATION > 200000;
      } else if (viewState.zoom > 7 && viewState.zoom <= 9) {
        return d.properties.POPULATION > 100000;
      } else if (viewState.zoom > 9 && viewState.zoom <= 11) {
        return d.properties.POPULATION > 30000;
      } else if (viewState.zoom > 11) {
        return d.properties.POPULATION > 10000;
      }
    });
  }, [frenchCommunes, viewState.zoom]);

  const cityLayer = new GeoJsonLayer({
    id: 'city-layer',
    data: {
      type: "FeatureCollection",
      features: filteredCities,
    },
    pointRadiusMinPixels: 3, // Minimal point size for low zoom levels
    getPointRadius: d => viewState.zoom > 7 ? 5 : 3, // Increase point size as zoom increases
    getFillColor: [50, 50, 50], // Grey color for minimalist point style
    getPosition: d => d.geometry.coordinates, // Coordinates for cities
  });

  // Data example : {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[2.22422,48.85352],[2.25077,48.84553],[2.25514,48.83481],[2.26279,48.83392],[2.26763,48.82797],[2.27905,48.83249],[2.28941,48.82833],[2.30132,48.82513],[2.31415,48.82229],[2.3319,48.81701],[2.35623,48.81594],[2.3642,48.8164],[2.39007,48.82569],[2.40224,48.82959],[2.41996,48.82408],[2.42796,48.8239],[2.43733,48.81818],[2.46121,48.81836],[2.46573,48.82623],[2.46732,48.8391],[2.44785,48.84486],[2.43718,48.84089],[2.42758,48.84157],[2.42214,48.8358],[2.41225,48.83454],[2.41634,48.84923],[2.41529,48.85518],[2.41343,48.87314],[2.41082,48.87844],[2.40151,48.88263],[2.39894,48.88953],[2.39552,48.89826],[2.38933,48.90116],[2.36562,48.90176],[2.35198,48.90148],[2.31989,48.90046],[2.30377,48.89415],[2.28446,48.88564],[2.27749,48.87797],[2.25847,48.88039],[2.25482,48.87408],[2.2457,48.87646],[2.23174,48.86907],[2.22567,48.8594],[2.22422,48.85352]]]},"properties":{"ID":"COMMUNE_0000000009736048","NOM":"Paris","NOM_M":"PARIS","INSEE_COM":"75056","STATUT":"Capitale d'état","POPULATION":2133111,"INSEE_CAN":"NR","INSEE_ARR":"1","INSEE_DEP":"75","INSEE_REG":"11","SIREN_EPCI":"200054781"}},

  const cityLabels = new TextLayer({
    id: 'city-labels',
    data: filteredCities,
    getPosition: d => {
      const coordinates = d.geometry.coordinates[0];
      const centroid = coordinates.reduce((acc, coord) => {
        acc[0] += coord[0];
        acc[1] += coord[1];
        return acc;
      }, [0, 0]).map(coord => coord / coordinates.length);
      return centroid;
    },
    getText: d => d.properties.NOM,
    getSize: d => viewState.zoom > 7 ? 14 : 16,
    getColor: [0, 0, 0, 200],
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
    billboard: true,
    getPixelOffset: [0, -40],
  });

  return (
    <div>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        controller={true}
        layers={[countriesLayer, cityLayer, ...layers, cityLabels]}
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

