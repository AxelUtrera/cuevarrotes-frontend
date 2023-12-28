import React from 'react';
import { Button } from 'react-bootstrap';
import '../components/componentsUI.css';

const AcceptButton = ({ buttonText, onClickMethod }) => {
  return (
    <Button variant="primary" onClick={onClickMethod} className='accept-button'>
      {buttonText}
    </Button>
  );
};

const SecondaryButton = ({ buttonText, onClickMethod }) => {
  return (
    <Button variant="primary" onClick={onClickMethod} className='secondary-button'>
      {buttonText}
    </Button>
  );
};


const ExceptionMessage = ({ message }) => {
  return (
    <div className="text-danger">
      <p>{message}</p>
    </div>
  );
};


export { AcceptButton, CancelButton, ExceptionMessage, SecondaryButton };
