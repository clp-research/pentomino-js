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
	$.jCanvas.defaults.fromCenter = false;

	var draw_line = function (x, y, x2, y2, color) {

		canvas_ref.drawLine({
			strokeStyle: color,
			strokeWidth: 1,
			x1: x, y1: y,
			x2: x2, y2: y2
		});
	}

	var init_grid = function () {
		for (var i = 0; i <= rows; i++) {
			draw_line(grid_x, grid_y + i * block_size, grid_x + width, grid_y + i * block_size, grid_color);
		}

		for (var i = 0; i <= cols; i++) {
			draw_line(grid_x + i * block_size, grid_y + 0, grid_x + i * block_size, grid_y + height, grid_color);
		}
	}

	var get_shapes = function(){
		return [
			{'shape_id': 1, type: 'rect', width: 100, height: 100}
		]
	}

	var place_randomly = function(shape){
		var rand_x = grid_x + width + Math.floor((Math.random() * 300) + 1);
		var rand_y = grid_y + height + Math.floor((Math.random() * 200) + 1);
		
		canvas_ref.drawPolygon({
			draggable: true,
			fillStyle: "blue",
			x: rand_x, y: rand_y,
			radius: 50, sides: 4,
			dragstart: function () {
				// code to run when dragging starts
			},
			drag: function (layer) {
				// code to run as layer is being dragged
			},
			dragstop: function (layer) {
				// code to run when dragging stops
			}
		});
	}

	console.log("Drawing board...")

	init_grid();

	var shapes = get_shapes();
	for (var shape in shapes){
		place_randomly(shapes[shape]);
	}

	console.log("Done!")

	this.download_img = function (el) {
		var image_string = $('canvas').getCanvasImage('png');
		el.href = image_string;
	};
})
