import React from "react";
import EnergyType from './EnergyType';
import ThermiqueIcon from '../assets/icons/thermique.png';
import NucleaireIcon from '../assets/icons/nucleaire.png';
import EolienIcon from '../assets/icons/eolien.png';
import SolaireIcon from '../assets/icons/solaire.png';
import HydrauliqueIcon from '../assets/icons/hydraulique.png';
import BioenergiesIcon from '../assets/icons/bioenergies.png';
import '../styles/productionInformation.css';

const ProductionInformation = ({ productionData }) => {
  const defaultData = { Thermique: 'XXXX', Nucléaire: 'XXXX', Éolien: 'XXXX', Solaire: 'XXXX', Hydraulique: 'XXXX', Bioénergies: 'XXXX', Total: 'XXXXXX' };
  const data = productionData || defaultData;

  const energyData = [
    { icon: ThermiqueIcon, label: 'Thermique', value: data.Thermique },
    { icon: NucleaireIcon, label: 'Nucléaire', value: data.Nucléaire },
    { icon: EolienIcon, label: 'Éolien', value: data.Éolien },
    { icon: SolaireIcon, label: 'Solaire', value: data.Solaire },
    { icon: HydrauliqueIcon, label: 'Hydraulique', value: data.Hydraulique },
    { icon: BioenergiesIcon, label: 'Bioénergies', value: data.Bioénergies },
  ];

  return (
    <div className="block production-information">
      <div className="energy-container">
        {energyData.map((energy, index) => (
          <EnergyType key={index} icon={energy.icon} label={energy.label} value={energy.value} />
        ))}
        <div className="energy-total">
          <span className="energy-label">Total</span>
          <span className="energy-value">{data.Total} MW</span>
        </div>
      </div>
    </div>
  );
};

export default ProductionInformation;
