import {createMuiTheme, PaletteOptions} from "@mui/material";

const palette: PaletteOptions = {
  primary: {
    main: "#FFCD00",
    contrastText: "#242526",
  },
  background: {
    default: "#242526",
  },
};

const theme = createMuiTheme({
  palette,
});

export default theme;