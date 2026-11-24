        mapboxgl.accessToken= mapToken;

        console.log("Title:", listing.title);
console.log("Geometry:", listing.geometry);
console.log("Coordinates:", listing.geometry?.coordinates);

    const map = new mapboxgl.Map({
        container: 'map', // container ID
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9 // starting zoom
    });

    map.addControl(new mapboxgl.NavigationControl());
    map.scrollZoom.disable();

    map.on('style.load', () => {
        map.setFog({}); // Set the default atmosphere style
    });



    // create a marker at a coordinate
   const marker = new mapboxgl.Marker({ color: "red"})
    .setLngLat(listing.geometry.coordinates)
    .setPopup( new mapboxgl.Popup({offset: 25})
    .setHTML(
        `<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`
    )
    .addTo(map))
    .addTo(map);