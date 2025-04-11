import React from 'react';
import { Global, css } from '@emotion/react';
import { WarehouseDashboard } from './components/warehouse/WarehouseDashboard';

const globalStyles = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  body {
    background-color: #f8fafc;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;

function App() {
  return (
    <div className="w-screen max-w-screen overflow-x-hidden">
      <Global styles={globalStyles} />
      <WarehouseDashboard />
    </div>
  );
}

export default App;
