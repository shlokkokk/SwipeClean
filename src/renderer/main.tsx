import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

const RootWrapper = import.meta.env.DEV ? React.Fragment : React.StrictMode;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RootWrapper>
    <App />
  </RootWrapper>
);
