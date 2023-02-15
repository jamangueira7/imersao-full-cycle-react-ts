import React from 'react';
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Mapping } from "./components/Mapping";
import theme from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Mapping />
    </ThemeProvider>

  );
}

export default App;
