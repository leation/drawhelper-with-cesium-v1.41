1、在原https://github.com/leforthomas/cesium-drawhelper基础上，修改了DrawHelper.js部分地方，从而能够支持最新的cesium v1.41，具体修改说明如下：

2、294行
	lineWidth: Math.min(this.strokeWidth || 4.0, context._aliasedLineWidthRange[1])
改为:
	lineWidth: 1.0

3、977行开始
	function updateExtent(value) {
        if (extent == null) {
            extent = new Cesium.RectanglePrimitive();
            extent.asynchronous = false;
            primitives.add(extent);
        }
        extent.rectangle = value;
        // update the markers
        var corners = getExtentCorners(value);
        // create if they do not yet exist
        if (markers == null) {
            markers = new _.BillboardGroup(_self, defaultBillboard);
            markers.addBillboards(corners);
        } else {
            markers.updateBillboardsPositions(corners);
        }
    }

    // Now wait for start
    mouseHandler.setInputAction(function (movement) {
        if (movement.position != null) {
            var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
            if (cartesian) {
                if (extent == null) {
                    // create the rectangle
                    firstPoint = ellipsoid.cartesianToCartographic(cartesian);
                    var value = getExtent(firstPoint, firstPoint);
                    updateExtent(value);
                } else {
                    _self.stopDrawing();
                    if (typeof options.callback == 'function') {
                        options.callback(getExtent(firstPoint, ellipsoid.cartesianToCartographic(cartesian)));
                    }
                }
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    mouseHandler.setInputAction(function (movement) {
        var position = movement.endPosition;
        if (position != null) {
            if (extent == null) {
                tooltip.showAt(position, "<p>Click to start drawing rectangle</p>");
            } else {
                var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                if (cartesian) {
                    var value = getExtent(firstPoint, ellipsoid.cartesianToCartographic(cartesian));
                    updateExtent(value);
                    tooltip.showAt(position, "<p>Drag to change rectangle extent</p><p>Click again to finish drawing</p>");
                }
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

替换为：
    // Now wait for start
    mouseHandler.setInputAction(function (movement) {
        if (movement.position != null) {
            var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
            if (cartesian) {
                if (extent == null) {
                    // create the rectangle
                    firstPoint = ellipsoid.cartesianToCartographic(cartesian);
                    var value = getExtent(firstPoint, firstPoint);
                    extent = new _.ExtentPrimitive({
                        extent: value,
                        asynchronous: false,
                        material: options.material
                    });
                    primitives.add(extent);
                    markers = new _.BillboardGroup(_self, defaultBillboard);
					var corners = getExtentCorners(value);
                    markers.addBillboards(corners);
                } else {
                    _self.stopDrawing();
                    if (typeof options.callback == 'function') {
                        options.callback(getExtent(firstPoint, ellipsoid.cartesianToCartographic(cartesian)));
                    }
                }
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    mouseHandler.setInputAction(function (movement) {
        var position = movement.endPosition;
        if (position != null) {
            if (extent == null) {
                tooltip.showAt(position, "<p>Click to start drawing rectangle</p>");
            } else {
                var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                if (cartesian) {
                    var value = getExtent(firstPoint, ellipsoid.cartesianToCartographic(cartesian));
                    extent.setExtent(value);
					var corners = getExtentCorners(value);
                    markers.updateBillboardsPositions(corners);
                    tooltip.showAt(position, "<p>Drag to change rectangle extent</p><p>Click again to finish drawing</p>");
                }
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}