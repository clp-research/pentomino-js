$(document).ready(function () {

	class Shape {
		constructor(id, type, color, is_mirrored, rotation) {
			this.id = id
			this.x = 0
			this.y = 0
			this.type = type
			this.color = color
			this.rotation = rotation
			this.is_mirrored = is_mirrored || false
			this.writable = true

			// shape internal grid and bounding box
			this._internal_grid_size = [4, 4]
			this._internal_grid_shifts = [1, 0]
			this._internal_grid = []
			this._init_grid()

			// log changes for rollback
			this.changes = []

			// generate name
			this.name = this.type + this.id + this.color
			this.blocks = []
			this.block_size = 20

			// conntected shapes
			this.connected = []
		}

		/**
		 * Checks whether the shape is inside the bounding box or has overlaps (returns false if any part of the shape is
		 * outside the bounding box)
		 * @param {Bound Box x} bb_x 
		 * @param {Bounding Box y} bb_y 
		 * @param {Bounding Box Width} bb_width 
		 * @param {Bounding Box Height} bb_height 
		 */
		is_inside(bb_x, bb_y, bb_width, bb_height) {
			var bounding_box = [bb_x, bb_y, bb_width, bb_height]
			for (var block_index in this.blocks) {
				var block = this.blocks[block_index]
				if (!block.is_inside(bounding_box, this.x, this.y)) {
					return false
				}
			}
			return true
		}

		is_connected(other_shape) {
			return this.connected.indexOf(other_shape.name) != -1
		}

		has_connections() {
			return this.connected.length > 0
		}

		get_internal_grid() {
			return this._internal_grid
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
		copy_matrix(matrix) {
			var new_matrix = []
			for (var i = 0; i < matrix.length; i++) {
				var row = []
				for (var e = 0; e < matrix[i].length; e++) {
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
		copy_and_rotate(matrix) {
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

		get_right_fbc(matrix) {
			for (var i = matrix.length - 1; i >= 0; i--) {
				if (matrix[i].indexOf(1) != -1)
					break;
			}
			return i
		}

		get_left_fbc(matrix) {
			for (var i = 0; i < matrix.length; i++) {
				if (matrix[i].indexOf(1) != -1)
					break;
			}
			return i;
		}

		get_movement(look_left, fbc, fbc2, matrix) {


			return [0, 0]
		}

		/**
		 * Connects to shapes
		 * @param {shape to connect to} other_shape 
		 * @param {direction of connection} direction 
		 */
		align_and_connect(other_shape, direction) {
			// get copy of matrix for inplace operations and rotate if necessary
			if (direction == "top" || direction == "bottom") {
				var matrix = this.copy_and_rotate(other_shape.get_internal_grid())
			} else {
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
				this._internal_grid.push([])
				for (var e = 0; e < this._internal_grid_size[1]; e++) {
					this._internal_grid[i].push(0)
				}
			}
		}

		_set_grid_value(row, col, value) {
			this._internal_grid[row][col] = value
		}

		_get_grid_value(row, col) {
			return this._internal_grid[row][col]
		}

		_update_grid(block_x, block_y) {
			var row = (block_x / this.block_size) + this._internal_grid_shifts[0]
			var col = (block_y / this.block_size) + this._internal_grid_shifts[0]

			this._set_grid_value(row, col, 1)
		}

		/**
		 * Rolls back N steps of modifications done to the shape (except initial placement) 
		 * @param {int} steps 
		 */
		rollback(steps) {
			if (this.changes.length > 0) {
				for (var i = (this.changes.length - 1); i >= Math.max(0, this.changes.length - steps); i--) {
					this.undo_action(this.changes[i])
				}
				this.changes = this.changes.slice(0, Math.max(0, this.changes.length - steps))
			}
		}

		/**
		 * Restores the state of the shape before the modification
		 * @param {action object} action 
		 */
		undo_action(action) {
			switch (action["name"]) {
				case "move":
					this.moveTo(action["x"], action["y"], false)
					break;
				case "rotate":
					this.rotate(action["angle"], false)
					break;
			}
		}

		/**
		 * Returns the true angle for rotation
		 * @param {degree} angle 
		 */
		_get_true_angle(angle) {
			var true_angle = (this.rotation + angle) % 360
			return true_angle
		}

		/**
		 * Helper that updates the rotation of internal block model
		 */
		_rotate_blocks(delta_angle) {
			for (var i = 0; i < this.get_blocks().length; i++) {
				var block = this.get_blocks()[i]
				block.rotate(delta_angle, this.rotation)
			}
		}

		/**
		 * Rotates the shape by delta angle
		 * @param {*} angle 
		 */
		rotate(angle, track) {
			if (track != false) {
				this.changes.push({ "name": "rotate", "angle": 360 - angle })
			}
			this.rotation = this._get_true_angle(angle)
			this._rotate_blocks(angle)
		}

		moveTo(x, y, track) {
			if (track != false) {
				this.changes.push({ "name": "move", "x": this.x + 0, "y": this.y + 0 })
			}
			this.x = x
			this.y = y
		}

		close() {
			this.writable = false

			var x_sum = 0
			var y_sum = 0

			for (var block_index in this.blocks) {
				var block_center = this.blocks[block_index].get_center()
				x_sum += block_center[0]
				y_sum += block_center[1]
			}

			var center_x = x_sum / this.blocks.length
			var center_y = y_sum / this.blocks.length

			// update blocks
			for (var block_index in this.blocks) {
				var block = this.blocks[block_index]
				block.set_shape_center(40,40)
			}
		}

		add_block(block) {
			if (this.writable) {
				this.blocks.push(block)
				this._update_grid(block.x, block.y)
			}
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

		// Important: Closing the shapes disabled editing and 
		// calculates center point for rotations
		new_shape.close()

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

