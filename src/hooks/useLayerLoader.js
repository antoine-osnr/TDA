import { useState, useEffect } from "react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { FlyToInterpolator } from "@deck.gl/core";
import { easeCubic } from "d3-ease";
import {
  FRENCH_REGIONS,
  FRENCH_DEPARTEMENTS,
  FRENCH_COMMUNES,
} from "../config";

/**
 * Custom hook to manage the loading and interaction of map layers.
 *
 * @param {Object} params - The parameters for the hook.
 * @param {string} params.activeLayer - The currently active layer.
 * @param {Object} params.hoveredFeature - The feature currently being hovered over.
 * @param {Object} params.clickedFeature - The feature currently being clicked.
 * @param {Object} params.viewState - The current view state of the map.
 * @param {Function} params.setHoveredFeature - Function to set the hovered feature.
 * @param {Function} params.setClickedFeature - Function to set the clicked feature.
 * @param {Function} params.setViewState - Function to set the view state of the map.
 * @param {Object} params.previousLayer - Ref object to keep track of the previous layer.
 *
 * @returns {Object} - An object containing the layers and the loading state.
 * @returns {Array} layers - The array of layers to be rendered on the map.
 * @returns {boolean} isLoading - The loading state of the layers.
 */
const useLayerLoader = ({
  activeLayer,
  hoveredFeature,
  clickedFeature,
  viewState,
  setHoveredFeature,
  setClickedFeature,
  setViewState,
  previousLayer,
}) => {
  const [layers, setLayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
        onHover: ({ object }) => setHoveredFeature(object || null),
        onClick: (info) => {
          if (info.object) {
            setClickedFeature(info.object);
            setViewState({
              ...viewState,
              longitude: info.coordinate[0],
              latitude: info.coordinate[1],
              zoom:
                activeLayer === "commune"
                  ? 12
                  : activeLayer === "departement"
                  ? 9
                  : 8,
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
        case "region":
          layerData = new GeoJsonLayer({
            id: "region-layer",
            data: FRENCH_REGIONS,
            ...commonLayerSettings,
            getLineColor: [255, 255, 255, 255],
            lineWidthMaxPixels: 0.75,
            getFillColor: (d) => {
              if (
                hoveredFeature &&
                hoveredFeature.properties.ID === d.properties.ID
              )
                return [62, 68, 145, 230];
              return [62, 68, 145, 255];
            },
          });
          break;

        case "departement":
          layerData = new GeoJsonLayer({
            id: "departement-layer",
            data: FRENCH_DEPARTEMENTS,
            ...commonLayerSettings,
            getLineColor: [255, 255, 255, 255],
            lineWidthMaxPixels: 0.75,
            getFillColor: (d) => {
              if (
                hoveredFeature &&
                hoveredFeature.properties.ID === d.properties.ID
              )
                return [62, 68, 145, 230];
              return [62, 68, 145, 255];
            },
          });
          break;

        case "commune":
          layerData = new GeoJsonLayer({
            id: "commune-layer",
            data: FRENCH_COMMUNES,
            ...commonLayerSettings,
            getLineColor: [255, 255, 255, 255],
            lineWidthMaxPixels: 0.75,
            getFillColor: (d) => {
              if (
                hoveredFeature &&
                hoveredFeature.properties.ID === d.properties.ID
              )
                return [62, 68, 145, 230];
              return [62, 68, 145, 255];
            },
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

  return { layers, isLoading };
};

export default useLayerLoader;
