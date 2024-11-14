import React, { useEffect, useState } from "react";
import EnergyType from './EnergyType';
import ThermiqueIcon from '../assets/icons/thermique.png';
import NucleaireIcon from '../assets/icons/nucleaire.png';
import EolienIcon from '../assets/icons/eolien.png';
import SolaireIcon from '../assets/icons/solaire.png';
import HydrauliqueIcon from '../assets/icons/hydraulique.png';
import BioenergiesIcon from '../assets/icons/bioenergies.png';
import '../styles/productionInformation.css';

const fetchProductionData = async (feature) => {
  if (!feature) return null;

  // Mock data for production values, replace with actual data fetching using the feature ID
  // const { ID, name } = feature.properties;
  return {
    Thermique: Math.floor(Math.random() * 1000),
    Nucleaire: Math.floor(Math.random() * 1000),
    Eolien: Math.floor(Math.random() * 1000),
    Solaire: Math.floor(Math.random() * 1000),
    Hydraulique: Math.floor(Math.random() * 1000),
    Bioenergies: Math.floor(Math.random() * 1000),
    // Total is the sum of all energy types
    Total: Math.floor(Math.random() * 6000),
  };
};

const ProductionInformation = ({ clickedFeature }) => {
  const [productionData, setProductionData] = useState(null);

  useEffect(() => {
    const loadProductionData = async () => {
      const data = await fetchProductionData(clickedFeature);
      setProductionData(data);
    };

    loadProductionData();
  }, [clickedFeature]);

  if (!productionData) return <div className="block production-information">Select an area to view production data.</div>;

  const energyData = [
    { icon: ThermiqueIcon, label: 'Thermique', value: productionData.Thermique },
    { icon: NucleaireIcon, label: 'Nucléaire', value: productionData.Nucleaire },
    { icon: EolienIcon, label: 'Éolien', value: productionData.Eolien },
    { icon: SolaireIcon, label: 'Solaire', value: productionData.Solaire },
    { icon: HydrauliqueIcon, label: 'Hydraulique', value: productionData.Hydraulique },
    { icon: BioenergiesIcon, label: 'Bioénergies', value: productionData.Bioenergies },
  ];

  return (
    <div className="block production-information">
      <div className="energy-container">
        {energyData.map((energy, index) => (
          <EnergyType key={index} icon={energy.icon} label={energy.label} value={energy.value} />
        ))}
        <div className="energy-total">
          <span className="energy-label">Total</span>
          <span className="energy-value">{productionData.Total} MW</span>
        </div>
      </div>
    </div>
  );
};

export default ProductionInformation;
