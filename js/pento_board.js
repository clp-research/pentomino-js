$(document).ready(function () {
	// reference to canvas for drawing
	this.pento_canvas_ref = $("#board");

	// pento grid parameters
	this.pento_grid_cols = 20;
	this.pento_grid_rows = 10;
	this.pento_block_size = 20;
	this.pento_grid_color = '#000';
	this.pento_grid_x = 40;
	this.pento_grid_y = 40;

	// pento game parameters
	this.pento_read_only = false
	this.pento_lock_on_grid = false;
	this.pento_prevent_collision = false;
	this.pento_active_shape = null;

	this.draw_line = function (x, y, x2, y2, color) {

		this.pento_canvas_ref.drawLine({
			layer: true,
			strokeStyle: color,
			strokeWidth: 1,
			x1: x, y1: y,
			x2: x2, y2: y2
		});
	}

	this.draw_text = function (x, y, text) {
		this.pento_canvas_ref.drawText({
			layer: true,
			name: text.replace(" ", "_"),
			fillStyle: 'black',
			strokeWidth: 2,
			x: x, y: y,
			fontSize: 16,
			text: text,
			fromCenter: false
		})
	}

	this.init_board = function () {
		this.draw_text(40, 10, "Game board")
		this.draw_line(0, 400, 600, 400, 'black')
		this.draw_text(40, 410, "Tray")
	}

	this.remove_grid = function(){
		this.pento_canvas_ref.removeLayer('grid')
	}

	this.init_grid = function () {
		this.pento_grid_width = this.pento_block_size * this.pento_grid_cols;
		this.pento_grid_height = this.pento_block_size * this.pento_grid_rows;

		this.pento_canvas_ref.addLayer({
			type: 'rectangle',
			name: 'grid',
			fillStyle: 'white',
			x: this.pento_grid_x, y: this.pento_grid_y,
			width: this.pento_board_width , height: this.pento_board_height
		})

		for (var i = 0; i <= this.pento_grid_rows; i++) {
			this.draw_line(this.pento_grid_x, this.pento_grid_y + i * this.pento_block_size, 
				this.pento_grid_x + this.pento_grid_width, this.pento_grid_y + i * this.pento_block_size, this.pento_grid_color);
		}

		for (var i = 0; i <= this.pento_grid_cols; i++) {
			this.draw_line(this.pento_grid_x + i * this.pento_block_size, this.pento_grid_y + 0, 
				this.pento_grid_x + i * this.pento_block_size, this.pento_grid_y + this.pento_grid_height, this.pento_grid_color);
		}
	}

	this.lock_shape_on_grid = function (layer) {

		new_x = Math.floor((layer.x - this.pento_grid_x + layer.offsetX) / block_size) * block_size
		new_y = Math.floor((layer.y - this.pento_grid_y + layer.offsetY) / block_size) * block_size
		layer.x = new_x + this.pento_grid_x - layer.offsetX
		layer.y = new_y + this.pento_grid_y - layer.offsetY
		this.pento_canvas_ref.drawLayers()
	}

	this.is_over_grid = function (x, y) {
		return x >= this.pento_grid_x && x <= this.pento_grid_x + this.pento_grid_width && y >= this.pento_grid_y && y <= this.pento_grid_y + this.pento_grid_height
	}

	this.is_over_shape = function (layer) {
		var layers = this.pento_canvas_ref.getLayers();
		for (var i = 0; i < layers.length; i++) {
			var placed_layer = layers[i];
			if (placed_layer.name && placed_layer.isPento && placed_layer.name != layer.name) {

				if ($.jCanvas.shape_dict[layer.name].hits($.jCanvas.shape_dict[placed_layer.name])) {
					return true
				}
			}
		}
		return false
	}

	this.rotate_shape = function (angle) {
		this.pento_active_shape.rotate += angle
		if (this.pento_active_shape.rotate > 360 || this.pento_active_shape.rotate < -360) {
			this.pento_active_shape.rotate = 0
		}

		this.pento_canvas_ref.drawLayers()
	}

	this.get_pento_types = function(){
		return ['F','I','L','N','P','T','U','V','W','X','Y','Z']
	}

	this.get_offsets = function (type) {
		// returns offsets for (x,y) coordinates to position
		// drawing in the middle of the shape area
		switch (type) {
			case 'I':
				return [30, 0]
			case 'T': case 'F':
				return [30, 0]
		}
		return [30, 0]
	}

	this.create_pento_shape = function(id, type, color){
		var Shape = this.Shape
		return new Shape(id, type, color)
	}

	this.destroy_all_shapes = function(){
		var keys = Object.keys($.jCanvas.shape_dict)
		for(var key in keys){
			this.destroy_shape(keys[key])
		}
		this.pento_canvas_ref.drawLayers()
	}

	this.destroy_shape = function(name){
		delete $.jCanvas.shape_dict[name]
		this.pento_canvas_ref.removeLayer(name)
	}

	this.redraw_arrows = function (pento_canvas_ref, layer) {
		if (this.pento_active_shape != null) {
			this.remove_arrows();
		}

		var offsetX = this.get_offsets(layer.type)[0];
		var offsetY = this.get_offsets(layer.type)[1];

		var x = layer.x + offsetX
		var y = layer.y + offsetY
		var width = layer.block_size
		var strokeWidth = 4
		var rounding = layer.block_size / 2

		pento_canvas_ref.drawPath({
			layer: true,
			name: "arrow_left",
			strokeStyle: '#000',
			fillStyle: 'transparent',
			strokeWidth: strokeWidth,
			p1: {
				type: 'quadratic',
				x1: x + width, y1: y + width / 2,
				cx1: x + width + rounding, cy1: y - rounding + width / 2,
				x2: x + width * 2, y2: y + width / 2,
				endArrow: true,
				rounded: true,
				arrowAngle: 60,
				arrowRadius: 10
			},
			click: function () {
				document.rotate_shape(90)
			}
		});

		pento_canvas_ref.drawPath({
			layer: true,
			name: "arrow_right",
			strokeStyle: '#000',
			fillStyle: 'transparent',
			strokeWidth: strokeWidth,
			p1: {
				type: 'quadratic',
				x1: x, y1: y + width / 2,
				cx1: x + rounding - width, cy1: y - rounding + width / 2,
				x2: x - width, y2: y + width / 2,
				endArrow: true,
				arrowAngle: -60,
				arrowRadius: 10
			},
			click: function () {
				document.rotate_shape(-90)
			}
		});
	}

	this.remove_arrows = function () {
		this.pento_canvas_ref.removeLayer("arrow_left");
		this.pento_canvas_ref.removeLayer("arrow_right");
	}

	this.update_arrows = function (layer, is_drag) {
		var dx = layer.dx
		var dy = layer.dy
		var arrow_left = this.pento_canvas_ref.getLayer("arrow_left");
		arrow_left.x += dx;
		arrow_left.y += dy;

		var arrow_right = this.pento_canvas_ref.getLayer("arrow_right");
		arrow_right.x += dx;
		arrow_right.y += dy;

		if (is_drag) {
			this.pento_active_shape.shadowColor = 'black'
			this.pento_active_shape.shadowX = 1
			this.pento_active_shape.shadowY = -1
			this.pento_active_shape.shadowBlur = 3
		} else {
			this.pento_active_shape.shadowColor = 'transparent'
		}
	}

	this.set_active = function (layer) {
		this.pento_canvas_ref.moveLayer(layer.name, -1);
		this.pento_active_shape = layer
		this.redraw_arrows(this.pento_canvas_ref, layer)
	}

	this.place_shape = function(shape){
		var offsetX = this.get_offsets(shape.type)[0];
		var offsetY = this.get_offsets(shape.type)[1];
		var last_x;
		var last_y;

		var x; var y;
		if (shape.col){
			var coords = this.grid_cell_to_coordinates(shape)
			x = coords[0]
			y = coords[1]
		}else{
			x = shape.x
			y = shape.y
		}

		this.pento_canvas_ref.drawPentoShape({
			layer: true,
			name: shape.name,
			type: shape.type,
			mirror: shape.mirror,
			color: shape.color,
			block_size: this.pento_block_size,
			draggable: !this.pento_read_only,
			x: x, y: y,
			parent: this.pento_canvas_ref,
			isPento: true,
			fromCenter: true,
			offsetX: offsetX,
			offsetY: offsetY,
			width: 80,
			height: 80,
			rotate: shape.rotation,
			shape: shape,
			mouseover: function (layer) {
				if (!document.pento_read_only){
					document.set_active(layer)
				}	
			},
			click: function (layer) {
				if (!document.pento_read_only){
					document.set_active(layer)
				}	
			},
			dragstart: function (layer) {
				// code to run when dragging starts
				if (!document.pento_read_only){
					document.update_arrows(layer, true)
					last_x = layer.x;
					last_y = layer.y;
				}
			},
			drag: function (layer) {
				// code to run as layer is being dragged
				if (!document.pento_read_only){
					document.update_arrows(layer, true)
				}
			},
			dragstop: function (layer) {
				if (!document.pento_read_only){
					// code to run when dragging stops
					var layer_x = layer.x + layer.width / 2
					var layer_y = layer.y + layer.height / 2

					if (document.is_over_grid(layer_x, layer_y) && lock_on_grid) {
						document.lock_shape_on_grid(layer)
					}

					if (document.is_over_shape(layer) && prevent_collision) {
						layer.x = last_x;
						layer.y = last_y;	
					}
					document.update_arrows(layer, false)
					document.set_active(layer)
				}
			}
		});
	}

	this.grid_cell_to_coordinates = function(shape){
		var col = Math.max(shape["col"]-1,0)
		var row = Math.max(shape["row"]-1,0)
		var offsets = this.get_offsets(shape.type)

		return [(this.pento_grid_x + col * this.pento_block_size)-offsets[0], 
			(this.pento_grid_y + row * this.pento_block_size)-offsets[1]]
	}


	this.place_randomly = function (shape) {
		shape["position"] = {}
		shape["position"]["x"] = 100 + Math.floor((Math.random() * 200));
		shape["position"]["y"] = 400 + Math.floor((Math.random() * 100));
	
		this.place_shape(shape)
	}

	// register event handler
	$('body').on('dblclick', function (event) {
		document.pento_active_shape = null
		document.remove_arrows();
	});
})
