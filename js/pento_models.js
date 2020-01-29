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
		}

		hits(block) {
			if (block.x >= this.x && block.x <= this.x + this.width
				&& block.y >= this.y && block.y <= this.y + this.height) {
				return true
			}
			return false
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
			this.col = null
			this.row = null
			this.is_mirrored = is_mirrored || false
			this._virtual_grid = (4, 4)

			// generate name
			this.name = this.type + this.id + this.color
			this.blocks = []
			this.block_size = 20

			// center for rotation
			this.center = [0, 0]
		}

		connect_to(other_shape){
			return "group"+this.id+other_shape.id
		}

		rotate(angle) {
			if (this.rotation + angle > 360 || this.rotation + angle < 0) {
				this.rotation = 0
			} else {
				this.rotation += angle
			}

			this._rotate_blocks()
		}

		_rotate_blocks() {

		}

		move_on_grid(col, row) {
			this.col = col
			this.row = row
		}

		move(dx, dy) {
			this.x += dx
			this.y += dy

			this._update_center(dx, dy)
		}

		_calculate_center() {
			this.center[0] = (this._virtual_grid[0] * this.block_size) + this.x
			this.center[1] = (this._virtual_grid[1] * this.block_size) + this.y
		}

		_update_center(dx, dy) {
			this.center[0] += dx
			this.center[1] += dy
		}

		add_block(block) {
			this.blocks.push(block)
			this._calculate_center()
		}

		get_blocks() {
			return this.blocks
		}

		hits(other_shape) {
			for (var index in this.blocks) {
				var current_block = this.blocks[index];
				var other_blocks = other_shape.get_blocks();

				for (var o_index in other_blocks) {
					if (current_block.hits(other_blocks[o_index])) {
						return true
					}
				}
			}
			return false
		}

		make_copy(new_id){
			var shape_copy = document.pento_create_shape(new_id, this.type, this.color,
				this.is_mirrored, this.rotation)
				
			shape_copy.blocks = this.get_blocks()
			shape_copy.x = this.x
			shape_copy.y = this.y
			shape_copy.width = this.width
			shape_copy.height = this.height

			return shape_copy
		}
	}

	this.pento_create_shape = function (id, type, color, is_mirrored, rotation) {
		//create empty shape
		var new_shape = this._new_pento_shape(id, type, color, is_mirrored, rotation)

		switch (type) {
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
		}
		return new_shape
	}

	this._new_pento_shape = function () {
		return new Shape(-1, 'None', 'black', false, 0)
	}

	this._new_pento_shape = function (id, type, color, is_mirrored, rotation) {
		return new Shape(id, type, color, is_mirrored, rotation == null ? 0 : rotation)
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

