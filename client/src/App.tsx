import { Global, css } from "@emotion/react";
import { AuthProvider } from "./contexts/AuthContext";
import RouterProvider from "./routes/RouterProvider";

const globalStyles = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  body {
    background-color: #f8fafc;
  }

  #root {
    min-height: 100vh;
    min-width: 100%;
    display: flex;
    flex-direction: column;
  }
`;

function App() {
  return (
    <AuthProvider>
      <>
        <Global styles={globalStyles} />
        <RouterProvider />
      </>
    </AuthProvider>
  );
}

export default App;
