import { createContext, useContext } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const GoogleMapsContext = createContext({ isLoaded: false, loadError: undefined });

// Keep this array reference stable across renders — @react-google-maps/api
// warns (and can reload the script) if a new array is passed every render.
const LIBRARIES = ["geometry"];

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

export function GoogleMapsProvider({ children }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "roadsaathi-google-maps",
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError, hasApiKey: Boolean(apiKey) }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}
