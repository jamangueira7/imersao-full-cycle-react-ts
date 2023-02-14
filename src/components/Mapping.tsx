import { Button, Grid, MenuItem, Select } from "@mui/material";
import { Loader } from "google-maps";
import
  React,
{
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState
}
  from 'react';
import { Route } from "../util/models";
import { getCurrentPosition } from "../util/geolocations";

const API_URL = process.env.REACT_APP_API_URL as string;
const googleMapsLoader = new Loader(process.env.REACT_APP_GOOGLE_API_KEY);

export function Mapping() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeIdSelected, setRouteIdSelected] = useState<string>("");
  const mapRef = useRef<google.maps.Map>();

  useEffect(() => {
    fetch(`${API_URL}/routes`)
      .then((data) => data.json())
      .then((data) => setRoutes(data));
  }, []);

  useEffect(() => {
    (async () => {
      const [, position] = await Promise.all([
        googleMapsLoader.load(),
        getCurrentPosition({ enableHighAccuracy: true })
      ]);
      const divMap = document.getElementById('map') as HTMLElement;
      mapRef.current = new google.maps.Map<Element>(divMap, {
        zoom: 15,
        center: position
      });
    })();
  }, []);

  const startRoute = useCallback((event: FormEvent) => {
    event.preventDefault();

  }, [routeIdSelected]);

  return (
    <Grid container style={{ width: '100%', height: '100%' }}>
      <Grid item xs={12} sm={3}>
        <form onSubmit={startRoute}>
          <Select
            fullWidth
            displayEmpty
            value={routeIdSelected}
            onChange={(event) => setRouteIdSelected(event.target.value + "")}
          >
            <MenuItem value="">
              <em>Selecionar uma corrida</em>
            </MenuItem>
            {
              routes.map((route, key) => (
                <MenuItem key={key} value={route._id}>
                  <em>{route.title}</em>
                </MenuItem>
              ))
            }

          </Select>
          <Button
            type="submit"
            color="primary"
            variant="contained"
          >
            Iniciar uma corrida
          </Button>
        </form>
      </Grid>
      <Grid item xs={12} sm={9}>
        <div id="map" style={{ width: '100%', height: '100%' }}></div>
      </Grid>
    </Grid>
  );
}
