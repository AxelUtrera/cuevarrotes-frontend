import React from 'react';
import "./styles/BackButton.css";

const BackButton = ({ method }) => (
  <div className="back-button">
    <a onClick={method}>← Registrate!</a>
  </div>
);

export default BackButton;
