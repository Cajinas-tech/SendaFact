import React from 'react';
import { createRoot } from 'react-dom/client';
import POSApp from './Pages/POS/Index';

const rootElement = document.getElementById('pos-root');
if (rootElement) {
    let initialProps = {};
    try {
        const raw = rootElement.getAttribute('data-props');
        if (raw) {
            initialProps = JSON.parse(raw);
        }
    } catch (e) {
        console.error('Error parsing POS initial props:', e);
    }

    createRoot(rootElement).render(
        <React.StrictMode>
            <POSApp {...initialProps} />
        </React.StrictMode>
    );
}
