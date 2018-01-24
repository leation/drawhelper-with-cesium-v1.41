var center = [110.98, 30.83];
var viewer = null;
var scene = null;
var canvas = null;
var clock = null;
var camera = null;

$(function () {
    var timer = null;

    $(document).ready(function () {
        initialGlobeView();
        initDrawHelper();
    });

    function initialGlobeView() {
        var terrainProvider = new Cesium.CesiumTerrainProvider({
            url: 'https://assets.agi.com/stk-terrain/world',
            requestVertexNormals: true,
        });
        var image_googleSource = new Cesium.UrlTemplateImageryProvider({
            url: 'http://mt0.google.cn/vt/lyrs=s@702&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Ga',
            credit: ''
        });
        viewer = new Cesium.Viewer('cesiumContainer', {
            geocoder: false,
            homeButton: true,
            sceneModePicker: true,
            fullscreenButton: false,
            vrButton: false,
            baseLayerPicker: false,
            animation: false,
            infoBox: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
            mapProjection: new Cesium.WebMercatorProjection(),
            imageryProvider: image_googleSource,
            terrainProvider: terrainProvider  //有时候访问不了高程数据，可暂时注释掉或者访问离线数据
        });
        viewer.scene.globe.enableLighting = false; //太阳光

        var layers = viewer.scene.imageryLayers;
        var label_googleSource = new Cesium.UrlTemplateImageryProvider({
            url: 'http://mt0.google.cn/vt/imgtp=png32&lyrs=h@365000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil',
            credit: ''
        });
        layers.addImageryProvider(label_googleSource);

        scene = viewer.scene;
        canvas = viewer.canvas;
        clock = viewer.clock;
        camera = viewer.scene.camera;

        setTimeout(function () {
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(center[0], center[1], 100000),
                duration: 5,
                orientation: {
                    heading: Cesium.Math.toRadians(0.0),
                    pitch: Cesium.Math.toRadians(-90.0),
                    roll: 0.0
                }
            });
        }, 3000);
    }

    function initDrawHelper() {
        var drawHelper = new DrawHelper(viewer);
        var toolbar = drawHelper.addToolbar(document.getElementById("toolbar"), {
            buttons: ['marker', 'polyline', 'polygon', 'circle', 'extent']
        });
        toolbar.addListener('markerCreated', function (event) {
            loggingMessage('Marker created at ' + event.position.toString());
            // create one common billboard collection for all billboards
            var b = new Cesium.BillboardCollection();
            scene.primitives.add(b);
            var billboard = b.add({
                show: true,
                position: event.position,
                pixelOffset: new Cesium.Cartesian2(0, 0),
                eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0),
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                scale: 1.0,
                image: './img/glyphicons_242_google_maps.png',
                color: new Cesium.Color(1.0, 1.0, 1.0, 1.0)
            });
            billboard.setEditable();
        });
        toolbar.addListener('polylineCreated', function (event) {
            loggingMessage('Polyline created with ' + event.positions.length + ' points');
            var polyline = new DrawHelper.PolylinePrimitive({
                positions: event.positions,
                width: 5,
                geodesic: true
            });
            scene.primitives.add(polyline);
            polyline.setEditable();
            polyline.addListener('onEdited', function (event) {
                loggingMessage('Polyline edited, ' + event.positions.length + ' points');
            });

        });
        toolbar.addListener('polygonCreated', function (event) {
            loggingMessage('Polygon created with ' + event.positions.length + ' points');
            var polygon = new DrawHelper.PolygonPrimitive({
                positions: event.positions,
                material: Cesium.Material.fromType('Checkerboard')
            });
            scene.primitives.add(polygon);
            polygon.setEditable();
            polygon.addListener('onEdited', function (event) {
                loggingMessage('Polygon edited, ' + event.positions.length + ' points');
            });

        });
        toolbar.addListener('circleCreated', function (event) {
            loggingMessage('Circle created: center is ' + event.center.toString() + ' and radius is ' + event.radius.toFixed(1) + ' meters');
            var circle = new DrawHelper.CirclePrimitive({
                center: event.center,
                radius: event.radius,
                material: Cesium.Material.fromType(Cesium.Material.RimLightingType)
            });
            scene.primitives.add(circle);
            circle.setEditable();
            circle.addListener('onEdited', function (event) {
                loggingMessage('Circle edited: radius is ' + event.radius.toFixed(1) + ' meters');
            });
        });
        toolbar.addListener('extentCreated', function (event) {
            var extent = event.extent;
            loggingMessage('Extent created (N: ' + extent.north.toFixed(3) + ', E: ' + extent.east.toFixed(3) + ', S: ' + extent.south.toFixed(3) + ', W: ' + extent.west.toFixed(3) + ')');
            var extentPrimitive = new DrawHelper.ExtentPrimitive({
                extent: extent,
                material: Cesium.Material.fromType(Cesium.Material.StripeType)
            });
            scene.primitives.add(extentPrimitive);
            extentPrimitive.setEditable();
            extentPrimitive.addListener('onEdited', function (event) {
                loggingMessage('Extent edited: extent is (N: ' + event.extent.north.toFixed(3) + ', E: ' + event.extent.east.toFixed(3) + ', S: ' + event.extent.south.toFixed(3) + ', W: ' + event.extent.west.toFixed(3) + ')');
            });
        });

        var logging = document.getElementById('logging');
        function loggingMessage(message) {
            logging.innerHTML = message;
        }
    }
});