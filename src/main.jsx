import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Parámetros de demo opcionales: ?demo=carga|error|vacio  y  ?rol=admin|supervisor|vendedor
const params = new URLSearchParams(window.location.search);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App estadoDemo={params.get('demo') || 'normal'} rolInicial={params.get('rol') || 'ninguno'} />
  </StrictMode>,
);
