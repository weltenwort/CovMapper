
import React, { useState, Component }  from 'react'
import ReactMapGl, { Source, Layer } from 'react-map-gl'
import { states as geoCountryStates, FederalState } from "../../data/geo_de";
import { PostCodeAreas } from '../PostCodeAreas';


export function CovMapp() {
    const [viewport, setViewport] = useState({
        width: '100vw',
        height: '100vh',
        latitude: 50.7577,
        longitude: 11.4376,
        zoom: 6
    });


    return <div>
            <ReactMapGl {...viewport}
            mapboxApiAccessToken = {"pk.eyJ1IjoidGhlcmVzYXRvYiIsImEiOiJjazhvZGVxY2UwMDRzM2ZwbHA2Z2FuOGVyIn0.hSWPSl7jZ2qIzDBoFAjZ_A"}
            onViewportChange={setViewport}>
            </ReactMapGl>
    </div>;
}