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

			_update_center(dx, dy)
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
	}

	this.pento_create_shape = function (id, type, color, is_mirrored, rotation) {
		switch (type) {
			case "I":
				return this.pento_I(color, is_mirrored, rotation)
			default:
				return this.pento_I(color, is_mirrored, rotation)
		}
	}


	this._new_pento_shape = function (id, type, color, is_mirrored, rotation) {
		return new Shape(id, type, color, is_mirrored, rotation == null ? 0 : rotation)
	}

	this.pento_I = function (color, is_mirrored, rotation) {

		I_shape = this._new_pento_shape(0, 'I', color, is_mirrored, rotation)

		// Draw blocks
		for (var i = 0; i < 4; i++) {
			var block = this.pento_create_block(0, i * I_shape.block_size, I_shape.block_size, color);
			I_shape.add_block(block)
		}

		return I_shape
	}

	this.pento_Y = function (color, mirror, rotation) {

		Y_shape = this._new_pento_shape(0, 'Y', color, is_mirrored, rotation)

		// Draw blocks
		for (var i = 0; i < 4; i++) {
			var block = this.pento_create_block(x, y + i * block_size, block_size, color);
			Y_shape.add_block(block)
		}

		if (mirror) {
			var block = this.pento_create_block(x + block_size, y + block_size, block_size, color);
		} else {
			var block = this.pento_create_block(x - block_size, y + block_size, block_size, color);
		}
		Y_shape.add_block(block)
		return Y_shape
	}

	this.pento_L = function (ctx, L_shape, x, y, block_size, color, mirror) {
		L_shape = this.pento_create_shape(0, 'L', color, is_mirrored)

		// Draw blocks
		for (var i = 0; i < 4; i++) {
			var block = this.pento_create_block(ctx, x, y + i * block_size, block_size, color);
			L_shape.add_block(block)
		}

		if (mirror) {
			var block = this.pento_create_block(ctx, x + block_size, y + 3 * block_size, block_size, color);
		} else {
			var block = this.pento_create_block(ctx, x - block_size, y + 3 * block_size, block_size, color);
		}
		L_shape.add_block(block)
	}

	// draw N
	var draw_N = function (ctx, N_shape, x, y, block_size, color, mirror) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = this.pento_create_block(ctx, x, y + i * block_size, block_size, color);
			N_shape.add_block(block)
		}

		for (var i = 2; i < 4; i++) {
			if (mirror) {
				var block = this.pento_create_block(ctx, x + block_size, y + i * block_size, block_size, color);
			} else {
				var block = this.pento_create_block(ctx, x - block_size, y + i * block_size, block_size, color);
			}
			N_shape.add_block(block)
		}
	}

	// draw P
	var draw_P = function (ctx, P_shape, x, y, block_size, color, mirror) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = this.pento_create_block(ctx, x, y + i * block_size, block_size, color);
			P_shape.add_block(block)
		}

		for (var i = 0; i < 2; i++) {
			if (mirror) {
				var block = this.pento_create_block(ctx, x + block_size, y + i * block_size, block_size, color);
			} else {
				var block = this.pento_create_block(ctx, x - block_size, y + i * block_size, block_size, color);
			}
			P_shape.add_block(block)
		}
	}

	// draw U
	var draw_U = function (ctx, U_shape, x, y, block_size, color) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = this.pento_create_block(ctx, x + i * block_size, y + block_size, block_size, color);
			U_shape.add_block(block)
		}


		var block = this.pento_create_block(ctx, x, y, block_size, color);
		U_shape.add_block(block)

		var block = this.pento_create_block(ctx, x + 2 * block_size, y, block_size, color);
		U_shape.add_block(block)
	}

	// draw V
	var draw_V = function (ctx, V_shape, x, y, block_size, color) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = this.pento_create_block(ctx, x + i * block_size, y + 2 * block_size, block_size, color);
			V_shape.add_block(block)
		}

		for (var i = 0; i < 2; i++) {
			var block = this.pento_create_block(ctx, x + 2 * block_size, y + i * block_size, block_size, color);
			V_shape.add_block(block)
		}
	}

	// draw W
	var draw_W = function (ctx, W_shape, x, y, block_size, color) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 2; i++) {
			var block = this.pento_create_block(ctx, x + i * block_size, y + 2 * block_size, block_size, color);
			W_shape.add_block(block)
		}

		for (var i = 1; i < 3; i++) {
			var block = this.pento_create_block(ctx, x + i * block_size, y + 1 * block_size, block_size, color);
			W_shape.add_block(block)
		}

		var block = this.pento_create_block(ctx, x + 2 * block_size, y, block_size, color);
		W_shape.add_block(block)
	}

	// draw F 
	var draw_F = function (ctx, F_shape, x, y, block_size, color, mirror) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = this.pento_create_block(ctx, x, y + i * block_size, block_size, color);
			F_shape.add_block(block)
		}

		if (mirror) {
			F_shape.add_block(this.pento_create_block(ctx, x + block_size, y + block_size, block_size, color));
			F_shape.add_block(this.pento_create_block(ctx, x - block_size, y, block_size, color));
		} else {
			F_shape.add_block(this.pento_create_block(ctx, x - block_size, y + block_size, block_size, color));
			F_shape.add_block(this.pento_create_block(ctx, x + block_size, y, block_size, color));
		}

	}


	// draw X 
	var draw_X = function (ctx, X_shape, x, y, block_size, color) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = this.pento_create_block(ctx, x, y + i * block_size, block_size, color);
			X_shape.add_block(block)
		}

		X_shape.add_block(this.pento_create_block(ctx, x - block_size, y + block_size, block_size, color));
		X_shape.add_block(this.pento_create_block(ctx, x + block_size, y + block_size, block_size, color));

	}

	// draw Z
	var draw_Z = function (ctx, X_shape, x, y, block_size, color, mirror) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = this.pento_create_block(ctx, x, y + i * block_size, block_size, color);
			X_shape.add_block(block)
		}

		if (mirror) {
			X_shape.add_block(this.pento_create_block(ctx, x + block_size, y + 2 * block_size, block_size, color));
			X_shape.add_block(this.pento_create_block(ctx, x - block_size, y, block_size, color));
		} else {
			X_shape.add_block(this.pento_create_block(ctx, x + block_size, y, block_size, color));
			X_shape.add_block(this.pento_create_block(ctx, x - block_size, y + 2 * block_size, block_size, color));
		}

	}


	// draw T
	var draw_T = function (ctx, T_shape, x, y, block_size, color) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = this.pento_create_block(ctx, x, y + i * block_size, block_size, color);
			T_shape.add_block(block)
		}

		T_shape.add_block(this.pento_create_block(ctx, x - block_size, y, block_size, color));
		T_shape.add_block(this.pento_create_block(ctx, x + block_size, y, block_size, color));

	}
})

