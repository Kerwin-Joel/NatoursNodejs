
// const locations = JSON.parse(document.getElementById('map').dataset.locations)

export const displayMap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoia2Vyd2luZGV2IiwiYSI6ImNrdm5hZ25rcDNtODcydW55aTdkMDJ3cnEifQ.BaqHcKD6FX61n6nhDRhGOQ';
    let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/kerwindev/ckvnayzmy27i615rzjcg3k7x0',
        scrollZoom:false
    });

    const bounds  = new mapboxgl.LngLatBounds()

    locations.forEach(loc=>{
        //Create marker 
        const el = document.createElement('div');
        el.className = 'marker'
        
        //Add marker
        new mapboxgl.Marker({
            element : el,
            anchor  :'bottom'
        }).setLngLat(loc.coordinates).addTo(map)

        //Add PopUp
        new mapboxgl.Popup({
            offset:30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`).addTo(map)
            

        //Extend map bounds to include current location
        bounds.extend(loc.coordinates)
    })

    map.fitBounds(bounds, {
        padding:{
            top:200,
            bottom:150,
            left:100,
            right:100,
        }
    })
}

