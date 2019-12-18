$(document).ready(function () {
	var cols = 20;
	var rows = 10;
	var block_size = 20;
	var grid_color = '#000';
	var grid_x = 50;
	var grid_y = 50;

	var width = block_size * cols;
	var height = block_size * rows;

	var canvas_ref = $("#board");
	var active_shape = null;
	var read_only = false

	var draw_line = function (x, y, x2, y2, color) {

		canvas_ref.drawLine({
			layer: true,
			strokeStyle: color,
			strokeWidth: 1,
			x1: x, y1: y,
			x2: x2, y2: y2
		});
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
			{ 'shape_id': 1, type: 'F', color: 'red'},
			{ 'shape_id': 1, type: 'F', color: 'red', mirror: true},
			{ 'shape_id': 2, type: 'I', color: 'blue'}
		]
	}

	var lock_shape_on_grid = function (layer) {
		console.log("Locking shape " + layer)
		new_x = Math.floor((layer.x - grid_x) / block_size) * block_size
		new_y = Math.floor((layer.y - grid_y) / block_size) * block_size
		layer.x = new_x + grid_x
		layer.y = new_y + grid_y
		canvas_ref.drawLayers()
	}

	var rotate_shape = function (angle) {
		if (active_shape) {
			active_shape.rotate += angle
			canvas_ref.drawLayers()
		}
	}

	var is_over_grid = function (x, y) {
		return x >= grid_x && x <= grid_x + width && y >= grid_y && y <= grid_y + height
	}

	var place_randomly = function (shape) {
		var rand_x = grid_x + width + Math.floor((Math.random() * 300) + 1);
		var rand_y = grid_y + height + Math.floor((Math.random() * 200) + 1);

		canvas_ref.drawPentoShape({
			layer: true,
			type: shape.type,
			mirror: shape.mirror,
			color: '#c33',
			block_size: block_size,
			draggable: !read_only,
			x: rand_x, y: rand_y,
			click: function (layer) {
				active_shape = layer
			},
			dragstart: function () {
				// code to run when dragging starts

			},
			drag: function (layer) {
				// code to run as layer is being dragged

			},
			dragstop: function (layer) {
				// code to run when dragging stops
				var layer_x = layer.x + layer.width / 2
				var layer_y = layer.y + layer.height / 2

				if (is_over_grid(layer_x, layer_y)) {
					lock_shape_on_grid(layer)
				}
			}
		});
	}

	// keys for rotation
	$("body").keyup(function (event) {
		switch (event.key) {
			case "ArrowRight":
				rotate_shape(90)
				break;
			case "ArrowLeft":
				rotate_shape(-90)
				break;
			default:
				break;
		}
	})

	// main 
	console.log("Drawing board...")

	init_grid();

	var shapes = get_shapes();
	for (var shape in shapes) {
		place_randomly(shapes[shape]);
	}
})
