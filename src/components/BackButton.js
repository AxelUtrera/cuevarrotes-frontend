import React from 'react';
import "./styles/BackButton.css";

const BackButton = ({ href }) => (
  <div className="back-button">
    <a href={href}>← Regresar</a>
  </div>
);

export default BackButton;
