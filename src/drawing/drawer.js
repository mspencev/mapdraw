


// Pattern:  constructor function
function Drawer(viewer) {
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

    

    this.setupHandlers = () => {

        Cesium.ScreenSpaceEventHandler.mouseEmulationIgnoreMilliseconds = 1600; // default = 800

        var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        
        handler.setInputAction(this.ctrlLeftDown, Cesium.ScreenSpaceEventType.LEFT_DOWN, Cesium.KeyboardEventModifier.CTRL);
        handler.setInputAction(this.ctrlLeftUp, Cesium.ScreenSpaceEventType.LEFT_UP, Cesium.KeyboardEventModifier.CTRL);
        handler.setInputAction(this.ctrlMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE, Cesium.KeyboardEventModifier.CTRL);

    };

    this.setRectangleCoord = (nesw) => {
        this.rectangleEntity.rectangle.coordinates = Cesium.Rectangle.fromDegrees(
            nesw.west,
            nesw.south,
            nesw.east,
            nesw.north,
        );
    };


    this.suspendPanZoom = () => {
        this.viewer.scene.screenSpaceCameraController.enableInputs = false;
    };

    this.resumePanZoom = () => {
        this.viewer.scene.screenSpaceCameraController.enableInputs = true;
    };
  
    this.getLatLon = (cartesian) => {
        const cartographic = this.ellipsoid.cartesianToCartographic(cartesian); // cartographic is in radians
        const lon = parseFloat(Cesium.Math.toDegrees(cartographic.longitude).toFixed(5));
        const lat = parseFloat(Cesium.Math.toDegrees(cartographic.latitude).toFixed(5));
        return {
            latitude: lat,
            longitude: lon,
        };
    }

    this.startDrag = (position) => {

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

    this.ctrlLeftDown = (click) => {
        this.startDragPosition = click.position;

        this.startDrag(this.startDragPosition);
    };

    this.ctrlLeftUp = (click) => {
        this.endDrag(click.position);
    };

    this.endDrag = (position) => {
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

    this.move = (movement) => {
        const position = movement.endPosition;

        if (this.isDragging) {
            this.updateDrag(position);
        }
    };

    this.updateDrag = (position) => {
        const cartesian = this.getCartesian(position);
        if (!cartesian || !this.startDragPosition) {
            return;
        }

        const loc = this.getLatLon(cartesian);
        const nesw = this.getBoundingBox(this.startDragPosition, loc);

        this.setRectangleCoord(nesw);
    };

    this.ctrlMove = (movement) => {
        this.move(movement);
    };

    this.getCartesian = (position) => {
        return viewer.camera.pickEllipsoid(position, this.ellipsoid);
    }

    this.getBoundingBox = (position1, position2) => {

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


