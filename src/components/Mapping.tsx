import {
  Button,
  Grid,
  MenuItem,
  Select
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Loader } from "google-maps";
import
  React,
{
  FormEvent, FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { sample, shuffle } from "lodash";
import { RouteExistsError } from "../errors/route-exists.error";
import { makeCarIcon, makeMarkerIcon, Map } from "../util/map";
import { Route } from "../util/models";
import { getCurrentPosition } from "../util/geolocations";
import { Navibar } from "./Navibar";
import io from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL as string;
const googleMapsLoader = new Loader(process.env.REACT_APP_GOOGLE_API_KEY);

const colors = [
  "#b71c1c",
  "#4a148c",
  "#2e7d32",
  "#e65100",
  "#2962ff",
  "#c2185b",
  "#FFCD00",
  "#3e2723",
  "#03a9f4",
  "#827717",
];

const useStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
  },
  form: {
    margin: "16px",
  },
  btnSubmitWrapper: {
    textAlign: "center",
    marginTop: "8px",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export function Mapping () {
  const classes = useStyles();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeIdSelected, setRouteIdSelected] = useState<string>("");
  const mapRef = useRef<Map>();
  const socketIORef = useRef<SocketIOClient.Socket>();

  useEffect(() => {
   socketIORef.current = io.connect(API_URL);
   socketIORef.current.on('connect', () => console.log('conectou'));
  }, []);

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
      mapRef.current = new Map(divMap, {
        zoom: 15,
        center: position
      });
    })();
  }, []);

  const startRoute = useCallback((event: FormEvent) => {
    event.preventDefault();
    const route = routes.find(route => route._id === routeIdSelected);

    const color = sample(shuffle(colors)) as string;

    try {
      mapRef.current?.addRoute(routeIdSelected, {
        currentMarkerOptions: {
          position: route?.startPosition,
          icon: makeCarIcon(color),
        },
        endMarkerOptions: {
          position: route?.endPosition,
          icon: makeMarkerIcon(color),
        }

      });

      socketIORef.current?.emit('new-direction', {
        routeId: routeIdSelected
      });

    } catch (error) {
      if (error instanceof RouteExistsError) {
        // enqueueSnackbar(`${route?.title} j?? adicionado, espere finalizar`, {
        //   variant: "error"
        // });
        return;
      }
      throw error;
    }

  }, [routeIdSelected, routes]);

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} sm={3}>
        <Navibar />
        <form onSubmit={startRoute} className={classes.form}>
          <Select
            fullWidth
            displayEmpty
            value={routeIdSelected}
            onChange={(event) => setRouteIdSelected(event.target.value + "")}
            style={{ color: "#FFCD00"}}
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
          <div className={classes.btnSubmitWrapper}>
            <Button
              type="submit"
              color="primary"
              variant="contained"
            >
              Iniciar uma corrida
            </Button>
          </div>
        </form>
      </Grid>
      <Grid item xs={12} sm={9}>
        <div id="map" className={classes.map} />
      </Grid>
    </Grid>
  );
}
