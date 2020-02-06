$(document).ready(function () {
	class PentoConfig {

		constructor() { }

		get_pento_colors() {
			return ['#EEAAAA', '#DDBB99', '#CCCC88', '#BBDD99', '#AAEEAA', '#DD99BB', '#CC88CC', '#99BBDD', '#AAAAEE', '#88CCCC', '#99DDBB']
		}

		get_pento_types() {
			return ['F', 'I', 'L', 'N', 'P', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
		}

	}

	this.PentoConfig = PentoConfig

	class Block {
		constructor(x, y, width, height, color) {
			this.x = x
			this.y = y
			this.width = width
			this.height = height
			this.color = color
			this.border_color = 'black'
			this.rotation = 0

			this.center_x = 0
			this.center_y = 0

			this.create_vertices();
		}

		/**
		 * Returs a deepcopy of this block
		 */
		copy() {
			var block_copy = Block(this.x, this.y, this.width, this.height, this.color)
			return block_copy
		}

		create_vertices() {
			this._vertices = [
				[this.x, this.y],
				[this.x + this.width, this.y],
				[this.x + this.width, this.y + this.height],
				[this.x, this.y + this.height]
			]
		}

		get_vertex(row, col) {
			return this._vertices[row][col]
		}

		set_vertex(row, col, value) {
			this._vertices[row][col] = value
		}

		rotate(angle) {
			for (var i = 0; i < this._vertices.length; i++) {
				var vertex = this._vertices[i]
				var x = vertex[0] + this.center_x / 2
				var y = vertex[1] + this.center_y / 2
				this.set_vertex(i, 0, Math.cos(angle * Math.PI / 180) * x - Math.sin(angle * Math.PI / 180) * y)
				this.set_vertex(i, 1, Math.sin(angle * Math.PI / 180) * x + Math.cos(angle * Math.PI / 180) * y)
			}
			this.rotation = 360 % (this.rotation + angle)
		}

		/**
		 * Calculates an overlap of two polygons using their vertices and the SAT method (Separating Axis Theorem)
		 * @param {block for comparison} block 
		 * @param {delta of shapes x coord} dx 
		 * @param {delta of shapes y coord} dy 
		 */
		hits(block, dx, dy) {
			// create a copy of own vertices
			var a = []
			for (var vi in this._vertices.slice()) {
				a.push([this._vertices[vi][0] + 0, this._vertices[vi][1] + 0])
			}
			var b = block._vertices.slice()

			// apply delta of shapes positions
			for (var i = 0; i < a.length; i++) {
				var vertex = a[i]
				vertex[0] += dx
				vertex[1] += dy
			}

			var rectangles = [a, b];
			var minA, maxA, projected, i, i1, j, minB, maxB;

			for (i = 0; i < rectangles.length; i++) {

				// for each polygon, look at each edge of the polygon, and determine if it separates
				// the two shapes
				var rectangle = rectangles[i];
				for (i1 = 0; i1 < rectangle.length; i1++) {

					// grab 2 vertices to create an edge
					var i2 = (i1 + 1) % rectangle.length;
					var p1 = rectangle[i1];
					var p2 = rectangle[i2];

					// find the line perpendicular to this edge
					var normal = { x: p2[1] - p1[1], y: p1[0] - p2[0] };

					minA = maxA = undefined;
					// for each vertex in the first shape, project it onto the line perpendicular to the edge
					// and keep track of the min and max of these values
					for (j = 0; j < a.length; j++) {
						projected = normal.x * a[j][0] + normal.y * a[j][1];
						if (minA == undefined || projected < minA) {
							minA = projected;
						}
						if (maxA == undefined || projected > maxA) {
							maxA = projected;
						}
					}

					// for each vertex in the second shape, project it onto the line perpendicular to the edge
					// and keep track of the min and max of these values
					minB = maxB = undefined;
					for (j = 0; j < b.length; j++) {
						projected = normal.x * b[j][0] + normal.y * b[j][1];
						if (minB == undefined || projected < minB) {
							minB = projected;
						}
						if (maxB == undefined || projected > maxB) {
							maxB = projected;
						}
					}

					// if there is no overlap between the projects, the edge we are looking at separates the two
					// polygons, and we know there is no overlap
					if (maxA < minB || maxB < minA) {
						return false;
					}
				}
			}
			return true;
		}

	}

	this.pento_create_block = function (x, y, block_size, color) {
		return new Block(x, y, block_size, block_size, color)
	}

	class Shape {
		constructor(id, type, color, is_mirrored, rotation) {
			this.id = id
			this.x = 0
			this.y = 0
			this.type = type
			this.color = color
			this.rotation = rotation
			this.is_mirrored = is_mirrored || false

			// shape internal grid and bounding box
			this._internal_grid_size = [4, 4]
			this._internal_grid_shifts = [1, 0]
			this._internal_virtual_grid = []

			this._init_grid()

			// generate name
			this.name = this.type + this.id + this.color
			this.blocks = []
			this.block_size = 20

			// conntected shapes
			this.connected = []
		}

		is_connected(other_shape) {
			return this.connected.indexOf(other_shape.name) != -1
		}

		has_connections() {
			return this.connected.length > 0
		}

		get_internal_grid() {
			return this._internal_virtual_grid
		}

		get_direction(other_shape) {
			var delta_x = other_shape.x - this.x
			var delta_y = other_shape.y - this.y
			var directions = ["top", "left", "bottom", "right"]

			// select direction based on relativ position difference
			if (delta_x >= 0 && delta_y <= 0) {
				return directions[0]
			} else if (delta_x <= 0 && delta_y >= 0) {
				return directions[1]
			} else if (delta_x >= 0 && delta_y >= 0) {
				return directions[2]
			} else {
				return directions[3]
			}
		}

		/**
		 * Copy matrix
		 * @param {Creates a deepcopy of a matrix} matrix 
		 */
		copy_matrix(matrix){
			var new_matrix = []
			for(var i = 0; i < matrix.length; i++){
				var row = []
				for (var e=0; e < matrix[i].length; e++){
					row.push(matrix[i][e])
				}
				new_matrix.push(row)
			}
			return new_matrix
		}


		/**
		 * Copy and rotate matrix 90 degrees clockwise
		 * @param {*} matrix 
		 */
		copy_and_rotate(matrix){
			// copy
			var a = this.copy_matrix(matrix)

			// rotate
			var N = a.length
			for (var i = 0; i < (N / 2 | 0); i++) {
				for (var j = i; j < N - i - 1; j++) {
					var temp = a[i][j];
					a[i][j] = a[N - 1 - j][i];
					a[N - 1 - j][i] = a[N - 1 - i][N - 1 - j];
					a[N - 1 - i][N - 1 - j] = a[j][N - 1 - i];
					a[j][N - 1 - i] = temp;
				}
			}

			return a
		}

		get_right_fbc(matrix){
			for(var i=matrix.length-1; i >= 0; i--){
				if (matrix[i].indexOf(1) != -1)
					break;
			}
			return i
		}

		get_left_fbc(matrix){
			for(var i=0; i < matrix.length; i++){
				if (matrix[i].indexOf(1) != -1)
					break;
			}
			return i;
		}

		get_movement(look_left, fbc, fbc2, matrix){


			return [0,0]
		}

		/**
		 * Connects to shapes
		 * @param {shape to connect to} other_shape 
		 * @param {direction of connection} direction 
		 */
		align_and_connect(other_shape, direction){
			// get copy of matrix for inplace operations and rotate if necessary
			if (direction == "top" || direction == "bottom"){
				var matrix = this.copy_and_rotate(other_shape.get_internal_grid())
			}else{
				var matrix = this.copy_matrix(other_shape.get_internal_grid())
			}

			// index of left or right first blocking column respectively
			var look_left = (direction == "top" || direction == "right") 
			var fbc = look_left ? this.get_right_fbc(matrix) : this.get_left_fbc(matrix)
			var fbc2 = look_left ? this.get_left_fbc(matrix) : this.get_right_fbc(matrix)

			// move other shape to new position
			var new_positions = this.get_movement(look_left, fbc, fbc2, matrix)
			other_shape.moveTo(new_positions[0], new_positions[1])
		}

		connect_to(other_shape) {
			// align internal grids
			other_shape.rotate(this.rotation - other_shape.rotation)

			// connect grids so that the resulting matrix doesnt contain a two (after adding both together)
			// move shapes close together
			var direction = this.get_direction(other_shape)
			this.align_and_connect(other_shape, direction)

			// register connection
			//this.connected.push(other_shape.name)
			//other_shape.connected.push(this.name)

			return "group" + this.id + other_shape.id
		}

		_init_grid() {
			for (var i = 0; i < this._internal_grid_size[0]; i++) {
				this._internal_virtual_grid.push([])
				for (var e = 0; e < this._internal_grid_size[1]; e++) {
					this._internal_virtual_grid[i].push(0)
				}
			}
		}

		_set_grid_value(row, col, value) {
			this._internal_virtual_grid[row][col] = value
		}

		_get_grid_value(row, col) {
			return this._internal_virtual_grid[row][col]
		}

		_update_grid(block_x, block_y) {
			var row = (block_x / this.block_size) + this._internal_grid_shifts[0]
			var col = (block_y / this.block_size) + this._internal_grid_shifts[0]

			this._set_grid_value(row, col, 1)
		}

		_get_true_angle(angle) {
			return (this.rotation + angle) % 360
		}

		/**
		 * Rotates the shape by delta angle
		 * @param {*} angle 
		 */
		rotate(angle) {
			this.rotation = this._get_true_angle(angle)
			this._rotate_blocks()
		}

		/**
		 * Helper that updates the rotation of internal block model
		 */
		_rotate_blocks() {
			for (var i = 0; i < this.get_blocks().length; i++) {
				var block = this.get_blocks()[i]
				block.rotate(this.rotation)
			}
		}

		moveTo(x, y) {
			this.x = x
			this.y = y
		}

		add_block(block) {
			this.blocks.push(block)
			//this._update_grid(block.x, block.y)
		}

		get_blocks() {
			return this.blocks
		}

		hits(other_shape) {
			// calculate delta between shapes
			var dx = this.x - other_shape.x
			var dy = this.y - other_shape.y

			for (var index in this.blocks) {
				var current_block = this.blocks[index];
				var other_blocks = other_shape.get_blocks();

				for (var o_index in other_blocks) {
					var other_block = other_blocks[o_index]
					if (current_block.hits(other_block, dx, dy)) {
						return true
					}
				}
			}
			return false
		}

		/**
		 * Returns a deep copy of the shape with the new id assigned
		 * @param {id} new_id 
		 */
		copy(new_id) {
			var shape_copy = document.pento_create_shape(new_id, this.x, this.y, this.type, this.color,
				this.is_mirrored, this.rotation)
			shape_copy.width = this.width
			shape_copy.height = this.height
			return shape_copy
		}
	}

	this.pento_create_shape = function (id, x, y, type, color, is_mirrored, rotation) {
		//create empty shape
		var new_shape = this._new_pento_shape(id, type, color, is_mirrored)

		switch (type) {
			case "point":
				this.pento_point(new_shape)
				break
			case "F":
				this.pento_F(new_shape)
				break
			case "I":
				this.pento_I(new_shape)
				break
			case "L":
				this.pento_L(new_shape)
				break
			case "N":
				this.pento_N(new_shape)
				break
			case "P":
				this.pento_P(new_shape)
				break
			case "T":
				this.pento_T(new_shape)
				break;
			case "U":
				this.pento_U(new_shape)
				break;
			case "V":
				this.pento_V(new_shape)
				break
			case "W":
				this.pento_W(new_shape)
				break
			case "X":
				this.pento_X(new_shape)
				break
			case "Y":
				this.pento_Y(new_shape)
				break
			case "Z":
				this.pento_Z(new_shape)
				break
			default:
				console.log("Unsupported shape type: " + type)
				return;
		}

		// move and rotate
		new_shape.moveTo(x, y)
		new_shape.rotate(rotation)

		return new_shape
	}

	Shape.prototype.toString = function shapeToString() {
		return this.name
	}

	this._new_pento_shape = function (id, type, color, is_mirrored, rotation) {
		return new Shape(id, type, color, is_mirrored, rotation == null ? 0 : rotation)
	}

	// Draw point
	this.pento_point = function (shape) {
		var block = this.pento_create_block(0, 0, shape.block_size, shape.color);
		shape.add_block(block)
	}


	// draw F 
	this.pento_F = function (shape) {

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = this.pento_create_block(0, + i * shape.block_size, shape.block_size, shape.color);
			shape.add_block(block)
		}

		if (shape.is_mirrored) {
			shape.add_block(this.pento_create_block(shape.block_size, + shape.block_size, shape.block_size, shape.color));
			shape.add_block(this.pento_create_block(- shape.block_size, 0, shape.block_size, shape.color));
		} else {
			shape.add_block(this.pento_create_block(- shape.block_size, + shape.block_size, shape.block_size, shape.color));
			shape.add_block(this.pento_create_block(shape.block_size, 0, shape.block_size, shape.color));
		}

	}

	// Draw I
	this.pento_I = function (shape) {
		// Draw blocks
		for (var i = 0; i < 4; i++) {
			var block = this.pento_create_block(0, i * shape.block_size, shape.block_size, shape.color);
			shape.add_block(block)
		}

	}

	// Draw L
	this.pento_L = function (shape) {
		// Draw blocks
		for (var i = 0; i < 4; i++) {
			var block = this.pento_create_block(0, i * shape.block_size, shape.block_size, shape.color);
			shape.add_block(block)
		}

		if (shape.is_mirrored) {
			var block = this.pento_create_block(shape.block_size, 3 * shape.block_size, shape.block_size, shape.color);
		} else {
			var block = this.pento_create_block(- shape.block_size, 3 * shape.block_size, shape.block_size, shape.color);
		}
		shape.add_block(block)
	}

	// draw N
	this.pento_N = function (shape) {

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = this.pento_create_block(0, + i * shape.block_size, shape.block_size, shape.color);
			shape.add_block(block)
		}

		for (var i = 2; i < 4; i++) {
			if (shape.is_mirrored) {
				var block = this.pento_create_block(shape.block_size, + i * shape.block_size, shape.block_size, shape.color);
			} else {
				var block = this.pento_create_block(shape.block_size, + i * shape.block_size, shape.block_size, shape.color);
			}
			shape.add_block(block)
		}
	}

	// draw P
	this.pento_P = function (shape) {

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = this.pento_create_block(0, i * shape.block_size, shape.block_size, shape.color);
			shape.add_block(block)
		}

		for (var i = 0; i < 2; i++) {
			if (shape.is_mirrored) {
				var block = this.pento_create_block(shape.block_size, + i * shape.block_size, shape.block_size, shape.color);
			} else {
				var block = this.pento_create_block(- shape.block_size, + i * shape.block_size, shape.block_size, shape.color);
			}
			shape.add_block(block)
		}
	}

	// Draw T
	this.pento_T = function (shape) {
		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = this.pento_create_block(0, + i * shape.block_size, shape.block_size, shape.color);
			shape.add_block(block)
		}

		shape.add_block(this.pento_create_block(- shape.block_size, 0, shape.block_size, shape.color));
		shape.add_block(this.pento_create_block(shape.block_size, 0, shape.block_size, shape.color));

	}

	// draw U
	this.pento_U = function (shape) {


		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = this.pento_create_block(i * shape.block_size, + shape.block_size, shape.block_size, shape.color);
			shape.add_block(block)
		}


		var block = this.pento_create_block(0, 0, shape.block_size, shape.color);
		shape.add_block(block)

		var block = this.pento_create_block(2 * shape.block_size, 0, shape.block_size, shape.color);
		shape.add_block(block)
	}

	// draw V
	this.pento_V = function (shape) {

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = this.pento_create_block(i * shape.block_size, 2 * shape.block_size, shape.block_size, shape.color);
			shape.add_block(block)
		}

		for (var i = 0; i < 2; i++) {
			var block = this.pento_create_block(2 * shape.block_size, i * shape.block_size, shape.block_size, shape.color);
			shape.add_block(block)
		}
	}

	// draw W
	this.pento_W = function (shape) {

		// Draw blocks
		for (var i = 0; i < 2; i++) {
			var block = this.pento_create_block(i * shape.block_size, 2 * shape.block_size, shape.block_size, shape.color);
			shape.add_block(block)
		}

		for (var i = 1; i < 3; i++) {
			var block = this.pento_create_block(i * shape.block_size, 1 * shape.block_size, shape.block_size, shape.color);
			shape.add_block(block)
		}

		var block = this.pento_create_block(2 * shape.block_size, 0, shape.block_size, shape.color);
		shape.add_block(block)
	}

	// Draw X
	this.pento_X = function (shape) {
		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = this.pento_create_block(0, i * shape.block_size, shape.block_size, shape.color);
			shape.add_block(block)
		}

		shape.add_block(this.pento_create_block(- shape.block_size, shape.block_size, shape.block_size, shape.color));
		shape.add_block(this.pento_create_block(shape.block_size, shape.block_size, shape.block_size, shape.color));
	}

	// Draw Y
	this.pento_Y = function (shape) {
		// Draw blocks
		for (var i = 0; i < 4; i++) {
			var block = this.pento_create_block(0, i * shape.block_size, shape.block_size, shape.color);
			shape.add_block(block)
		}

		if (shape.is_mirrored) {
			var block = this.pento_create_block(shape.block_size, shape.block_size, shape.block_size, shape.color);
		} else {
			var block = this.pento_create_block(- shape.block_size, shape.block_size, shape.block_size, shape.color);
		}
		shape.add_block(block)
	}

	// draw Z
	this.pento_Z = function (shape) {
		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = this.pento_create_block(0, i * shape.block_size, shape.block_size, shape.color);
			shape.add_block(block)
		}

		if (shape.is_mirrored) {
			shape.add_block(this.pento_create_block(shape.block_size, 2 * shape.block_size, shape.block_size, shape.color));
			shape.add_block(this.pento_create_block(-shape.block_size, 0, shape.block_size, shape.color));
		} else {
			shape.add_block(this.pento_create_block(shape.block_size, 0, shape.block_size, shape.color));
			shape.add_block(this.pento_create_block(- shape.block_size, 2 * shape.block_size, shape.block_size, shape.color));
		}

	}
})

