


// Pattern:  constructor function
class Drawer {

    constructor(viewer){
        this.viewer = viewer;
        this.isDragging = false;
        // Ellipsoid:  A quadratic surface defined in Cartesian coordinates by the equation (x / a)^2 + (y / b)^2 + (z / c)^2 = 1.
        // Primarily used by Cesium to represent the shape of planetary bodies.
        this.ellipsoid = viewer.scene.globe.ellipsoid;
        this.startDragPosition;
        this.startPos = {};
    
        // Add a rectangle entity
        
        this.rectangleEntity = viewer.entities.add({
            id: 'selection_rectangle',
            rectangle: {
                fill: false,
                outline: true,
                outlineColor: Cesium.Color.RED, //  .fromCssColorString(getSelectedColor()),
                show: false,
            },
        });    
    }
    
    

    setupHandlers() {

        Cesium.ScreenSpaceEventHandler.mouseEmulationIgnoreMilliseconds = 1600; // default = 800

        var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        
        handler.setInputAction(this.ctrlLeftDown.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOWN, Cesium.KeyboardEventModifier.CTRL);
        handler.setInputAction(this.ctrlLeftUp.bind(this), Cesium.ScreenSpaceEventType.LEFT_UP, Cesium.KeyboardEventModifier.CTRL);
        handler.setInputAction(this.ctrlMove.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE, Cesium.KeyboardEventModifier.CTRL);

    }

    setRectangleCoord(nesw){
        this.rectangleEntity.rectangle.coordinates = Cesium.Rectangle.fromDegrees(
            nesw.west,
            nesw.south,
            nesw.east,
            nesw.north,
        );
    };


    suspendPanZoom() {
        this.viewer.scene.screenSpaceCameraController.enableInputs = false;
    };

    resumePanZoom() {
        this.viewer.scene.screenSpaceCameraController.enableInputs = true;
    };
  
    getLatLon(cartesian) {
        const cartographic = this.ellipsoid.cartesianToCartographic(cartesian); // cartographic is in radians
        const lon = parseFloat(Cesium.Math.toDegrees(cartographic.longitude).toFixed(5));
        const lat = parseFloat(Cesium.Math.toDegrees(cartographic.latitude).toFixed(5));
        return {
            latitude: lat,
            longitude: lon,
        };
    }

    startDrag(position) {

        this.suspendPanZoom();

        this.isDragging = true;

        const cartesian = this.getCartesian(position);
        if (!cartesian) {
            return;
        }

        const loc = this.getLatLon(cartesian);

        this.startDragPosition = {
            latitude: loc.latitude + 2,
            longitude: loc.longitude - 2,
        };

        const nesw = this.getBoundingBox(this.startDragPosition, loc);

        this.setRectangleCoord(nesw);

        this.rectangleEntity.show = true;
        this.rectangleEntity.rectangle.show = true;
    };

    ctrlLeftDown(click) {
        this.startDragPosition = click.position;

        this.startDrag(this.startDragPosition);
    };

    ctrlLeftUp(click) {
        this.endDrag(click.position);
    };

    endDrag(position) {
        this.resumePanZoom();

        this.isDragging = false;
        const cartesian = this.getCartesian(position);
        if (!cartesian || !this.startDragPosition) {
            return;
        }

        const loc = this.getLatLon(cartesian);
        const nesw = this.getBoundingBox(this.startDragPosition, loc);

        this.setRectangleCoord(nesw);

        this.startDragPosition = undefined;

    };

    move(movement) {
        const position = movement.endPosition;

        if (this.isDragging) {
            this.updateDrag(position);
        }
    };

    updateDrag(position) {
        const cartesian = this.getCartesian(position);
        if (!cartesian || !this.startDragPosition) {
            return;
        }

        const loc = this.getLatLon(cartesian);
        const nesw = this.getBoundingBox(this.startDragPosition, loc);

        this.setRectangleCoord(nesw);
    };

    ctrlMove(movement) {
        this.move(movement);
    };

    getCartesian(position) {
        return this.viewer.camera.pickEllipsoid(position, this.ellipsoid);
    }

    getBoundingBox(position1, position2) {

        const east = Math.max(position1.longitude, position2.longitude);
        const west = Math.min(position1.longitude, position2.longitude);

        const north = Math.max(position1.latitude, position2.latitude);
        const south = Math.min(position1.latitude, position2.latitude);

        return {
            east,
            north,
            south,
            west,
        };
    };

};


