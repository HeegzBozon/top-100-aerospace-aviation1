import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// A browser notification, not a fault: a ResizeObserver callback wrote layout in the
// same frame it was notified in, so the round of notifications that followed never
// made it out. Nothing on the page is wrong and nothing failed to render. The
// observers we own are coalesced to a frame (see ModuleSlideDeck, ColonyGameCanvas),
// so this keeps the notification from being raised as an app error in the meantime.
window.addEventListener(
  'error',
  (event) => {
    const message = event.message || '';
    if (message.includes('ResizeObserver loop')) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  },
  true
);

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>,
)

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:beforeUpdate' }, '*');
  });
  import.meta.hot.on('vite:afterUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:afterUpdate' }, '*');
  });
}