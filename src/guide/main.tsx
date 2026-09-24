import React from 'react';
import ReactDOM from 'react-dom/client';
import GuideApp from './GuideApp';
import ErrorBoundary from '../sidepanel/components/ErrorBoundary';
import './guide.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GuideApp />
    </ErrorBoundary>
  </React.StrictMode>,
);
