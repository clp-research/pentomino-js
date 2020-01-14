$(document).ready(function () {
	var cols = 20;
	var rows = 10;
	var block_size = 20;
	var grid_color = '#000';
	var grid_x = 40;
	var grid_y = 40;

	var width = block_size * cols;
	var height = block_size * rows;

	var canvas_ref = $("#board");
	var read_only = false
	var lock_on_grid = true;
	var prevent_collision = true;
	var active_shape = null;
	var instruction_limit = 5;

	var draw_line = function (x, y, x2, y2, color) {

		canvas_ref.drawLine({
			layer: true,
			strokeStyle: color,
			strokeWidth: 1,
			x1: x, y1: y,
			x2: x2, y2: y2
		});
	}

	var draw_text = function (x, y, text) {
		canvas_ref.drawText({
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

	var init_board = function () {
		draw_text(40, 10, "Game board")
		draw_line(0, 400, 600, 400, 'black')
		draw_text(40, 410, "Tray")
	}

	var init_grid = function () {
		canvas_ref.addLayer({
			type: 'rectangle',
			name: 'grid',
			fillStyle: 'white',
			x: grid_x, y: grid_y,
			width: width, height: height
		})

		for (var i = 0; i <= rows; i++) {
			draw_line(grid_x, grid_y + i * block_size, grid_x + width, grid_y + i * block_size, grid_color);
		}

		for (var i = 0; i <= cols; i++) {
			draw_line(grid_x + i * block_size, grid_y + 0, grid_x + i * block_size, grid_y + height, grid_color);
		}
	}

	var get_shapes = function () {
		//return []
		return [
			{ 'shape_id': 1, type: 'F', color: 'red' },
			{ 'shape_id': 2, type: 'T', color: 'green' },
			{ 'shape_id': 3, type: 'F', color: 'yellow', mirror: true },
			{ 'shape_id': 4, type: 'I', color: 'blue' }
		]
	}

	var lock_shape_on_grid = function (layer) {

		new_x = Math.floor((layer.x - grid_x + layer.offsetX) / block_size) * block_size
		new_y = Math.floor((layer.y - grid_y + layer.offsetY) / block_size) * block_size
		layer.x = new_x + grid_x - layer.offsetX
		layer.y = new_y + grid_y - layer.offsetY
		canvas_ref.drawLayers()
	}

	var is_over_grid = function (x, y) {
		return x >= grid_x && x <= grid_x + width && y >= grid_y && y <= grid_y + height
	}

	var is_over_shape = function (layer) {
		var layers = canvas_ref.getLayers();
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

	var rotate_shape = function (angle) {
		active_shape.rotate += angle
		if (active_shape.rotate > 360 || active_shape.rotate < 0) {
			active_shape.rotate = 0
		}

		canvas_ref.drawLayers()
	}

	var get_offsets = function (type) {
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

	var redraw_arrows = function (canvas_ref, layer) {
		if (active_shape != null) {
			remove_arrows();
		}

		var offsetX = get_offsets(layer.type)[0];
		var offsetY = get_offsets(layer.type)[1];

		var x = layer.x + offsetX
		var y = layer.y + offsetY
		var width = layer.block_size
		var strokeWidth = 4
		var rounding = layer.block_size / 2

		canvas_ref.drawPath({
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
				rotate_shape(90)
			}
		});

		canvas_ref.drawPath({
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
				rotate_shape(-90)
			}
		});
	}

	var remove_arrows = function () {
		canvas_ref.removeLayer("arrow_left");
		canvas_ref.removeLayer("arrow_right");
	}

	var update_arrows = function (layer, is_drag) {
		var dx = layer.dx
		var dy = layer.dy
		var arrow_left = canvas_ref.getLayer("arrow_left");
		arrow_left.x += dx;
		arrow_left.y += dy;

		var arrow_right = canvas_ref.getLayer("arrow_right");
		arrow_right.x += dx;
		arrow_right.y += dy;

		if (is_drag) {
			active_shape.shadowColor = 'black'
			active_shape.shadowX = 1
			active_shape.shadowY = -1
			active_shape.shadowBlur = 3
		} else {
			active_shape.shadowColor = 'transparent'
		}
	}

	var set_active = function (layer) {
		canvas_ref.moveLayer(layer.name, -1);
		active_shape = layer
		redraw_arrows(canvas_ref, layer)
	}

	var place_randomly = function (shape) {
		var rand_x = 100 + Math.floor((Math.random() * 200));
		var rand_y = 400 + Math.floor((Math.random() * 100));

		var offsetX = get_offsets(shape.type)[0];
		var offsetY = get_offsets(shape.type)[1];
		var last_x;
		var last_y;

		canvas_ref.drawPentoShape({
			layer: true,
			name: shape.type + shape.shape_id + shape.color,
			type: shape.type,
			mirror: shape.mirror,
			color: shape.color,
			block_size: block_size,
			draggable: !read_only,
			x: rand_x, y: rand_y,
			parent: canvas_ref,
			isPento: true,
			fromCenter: true,
			offsetX: offsetX,
			offsetY: offsetY,
			width: 80,
			height: 80,
			mouseover: function (layer) {
				set_active(layer)
			},
			click: function (layer) {
				set_active(layer)
			},
			dragstart: function (layer) {
				// code to run when dragging starts
				update_arrows(layer, true)
				last_x = layer.x;
				last_y = layer.y;
			},
			drag: function (layer) {
				// code to run as layer is being dragged
				update_arrows(layer, true)
			},
			dragstop: function (layer) {

				// code to run when dragging stops
				var layer_x = layer.x + layer.width / 2
				var layer_y = layer.y + layer.height / 2

				if (is_over_grid(layer_x, layer_y) && lock_on_grid) {
					lock_shape_on_grid(layer)
				}

				if (is_over_shape(layer) && prevent_collision) {
					layer.x = last_x;
					layer.y = last_y;	
				}
				update_arrows(layer, false)
				set_active(layer)

			}
		});
	}

	// draw grid for placement of shapes
	init_grid();

	// draw board frames/headers
	init_board();

	// deploy shapes
	var shapes = get_shapes();
	for (var shape in shapes) {
		place_randomly(shapes[shape]);
	}

	// register event handler
	$('body').on('dblclick', function (event) {
		active_shape = null
		remove_arrows();
	});

	$('#add_instr').click(function () {
		if ($('.instruction-input').length < instruction_limit) {
			var input_widget = '<input class="u-full-width instruction-input" type="text"></input>'
			$(input_widget).insertAfter('.instruction-input:last');
		}
	})
})
