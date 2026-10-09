import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initPwaInstallListeners } from './lib/pwaInstall';

initPwaInstallListeners();

createRoot(document.getElementById('root')!).render(<App />);
