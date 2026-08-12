// A dark map theme approximating the CARTO "dark_all" tiles the app used
// with Leaflet, so switching to Google Maps doesn't change the app's look.
export const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#14181d" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#14181d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#626b76" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#2a313a" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1c2128" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#262d36" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1c2128" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3a4451" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9aa2ad" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1c2128" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0d1013" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3a4451" }],
  },
];

export const defaultMapOptions = {
  styles: darkMapStyle,
  disableDefaultUI: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  clickableIcons: false,
};
