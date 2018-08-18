// var Drawer = require('./drawing/drawer');


"use strict";


function onBodyLoad() {

    console.log('body loaded');
    // Reference for "default" application:  https://raw.githubusercontent.com/AnalyticalGraphicsInc/cesium-workshop/master/Source/AppSkeleton.js

    //////////////////////////////////////////////////////////////////////////
    // Creating the Viewer
    //////////////////////////////////////////////////////////////////////////

    var viewer = new Cesium.Viewer('map', {
        sceneMode : Cesium.SceneMode.SCENE2D,
        imageryProvider : new Cesium.ArcGisMapServerImageryProvider({
            url : '//services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
        }),
        baseLayerPicker : false,
        animation: false, // Lower-left clock
        fullscreenButton: false, // This button would make the entire browser full-screen. We don't want that control from here.
        geocoder: false, // Search bar. Requires Bing maps key so we get a warning layer on the map.
        homeButton: true, 
        infoBox: false,
        maximumRenderTimeChange : 60,
        navigationHelpButton: false,
        orderIndependentTranslucency: false,
        requestRenderMode : true,
        selectionIndicator: false, // Green box on Info Box select
        timeline: false,
    });

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(0.0, 0.0, 40000000),
        duration: 0
    });
        

    //////////////////////////////////////////////////////////////////////////
    // Creating the Drawer
    //////////////////////////////////////////////////////////////////////////
    const drawer = new Drawer(viewer);
    drawer.setupHandlers();


    // window.addEventListener('keydown', (e) => {
    //     console.log(e);
    // });

};
