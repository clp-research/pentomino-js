$(document).ready(function () {

	class Block {
		constructor(x, y, width, height) {
			this.x = x
			this.y = y
			this.width = width
			this.height = height
		}

		hits(block) {
			if (block.x >= this.x && block.x <= this.x + this.width
				&& block.y >= this.y && block.y <= this.y + this.height) {
				return true
			}
			return false
		}
	}

	class Shape {
		constructor(id, type, color, is_mirrored) {
			this.id = id
			this.x = 0
			this.y = 0
			this.type = type
			this.color = color
			this.rotation = 0
			this.col = null
			this.row = null	
			this.is_mirrored = is_mirrored || false

			// generate name
			this.name = this.type + this.id + this.color
			this.blocks = []
		}

		rotate(angle) {
			if (this.rotation + angle > 360 || this.rotation + angle < 0) {
				this.rotation = 0
			} else {
				this.rotation += angle
			}
		}

		move_on_grid(col, row) {
			this.col = col
			this.row = row
		}

		move(dx, dy) {
			x += dx
			y += dy
		}

		add_block(block) {
			this.blocks.push(block)
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

	// make classes accesible in other scripts
	this.Block = Block
	this.Shape = Shape

	// draw a block (smallest unit of pentomino shape)
	var draw_block = function (ctx, x, y, block_size, color) {

		ctx.fillStyle = color;
		ctx.rect(x, y, block_size, block_size)

		ctx.strokeStyle = 'black'
		ctx.strokeRect(x, y, block_size, block_size)

		return new Block(x, y, block_size, block_size)
	}

	// draw I 
	var draw_I = function (ctx, I_shape, x, y, block_size, color) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 4; i++) {
			var block = draw_block(ctx, x, y + i * block_size, block_size, color);
			I_shape.add_block(block)
		}

	}

	// draw Y 
	var draw_Y = function (ctx, Y_shape, x, y, block_size, color, mirror) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 4; i++) {
			var block = draw_block(ctx, x, y + i * block_size, block_size, color);
			Y_shape.add_block(block)
		}

		if (mirror) {
			var block = draw_block(ctx, x + block_size, y + block_size, block_size, color);
		} else {
			var block = draw_block(ctx, x - block_size, y + block_size, block_size, color);
		}
		Y_shape.add_block(block)
	}

	// draw L
	var draw_L = function (ctx, L_shape, x, y, block_size, color, mirror) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 4; i++) {
			var block = draw_block(ctx, x, y + i * block_size, block_size, color);
			L_shape.add_block(block)
		}

		if (mirror) {
			var block = draw_block(ctx, x + block_size, y + 3 * block_size, block_size, color);
		} else {
			var block = draw_block(ctx, x - block_size, y + 3 * block_size, block_size, color);
		}
		L_shape.add_block(block)
	}

	// draw N
	var draw_N = function (ctx, N_shape, x, y, block_size, color, mirror) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = draw_block(ctx, x, y + i * block_size, block_size, color);
			N_shape.add_block(block)
		}

		for (var i = 2; i < 4; i++) {
			if (mirror) {
				var block = draw_block(ctx, x + block_size, y + i * block_size, block_size, color);
			} else {
				var block = draw_block(ctx, x - block_size, y + i * block_size, block_size, color);
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
			var block = draw_block(ctx, x, y + i * block_size, block_size, color);
			P_shape.add_block(block)
		}

		for (var i = 0; i < 2; i++) {
			if (mirror) {
				var block = draw_block(ctx, x + block_size, y + i * block_size, block_size, color);
			} else {
				var block = draw_block(ctx, x - block_size, y + i * block_size, block_size, color);
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
			var block = draw_block(ctx, x + i * block_size, y + block_size, block_size, color);
			U_shape.add_block(block)
		}


		var block = draw_block(ctx, x, y, block_size, color);
		U_shape.add_block(block)

		var block = draw_block(ctx, x + 2 * block_size, y, block_size, color);
		U_shape.add_block(block)
	}

	// draw V
	var draw_V = function (ctx, V_shape, x, y, block_size, color) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = draw_block(ctx, x + i * block_size, y + 2 * block_size, block_size, color);
			V_shape.add_block(block)
		}

		for (var i = 0; i < 2; i++) {
			var block = draw_block(ctx, x + 2 * block_size, y + i * block_size, block_size, color);
			V_shape.add_block(block)
		}
	}

	// draw W
	var draw_W = function (ctx, W_shape, x, y, block_size, color) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 2; i++) {
			var block = draw_block(ctx, x + i * block_size, y + 2 * block_size, block_size, color);
			W_shape.add_block(block)
		}

		for (var i = 1; i < 3; i++) {
			var block = draw_block(ctx, x + i * block_size, y + 1 * block_size, block_size, color);
			W_shape.add_block(block)
		}

		var block = draw_block(ctx, x + 2 * block_size, y, block_size, color);
		W_shape.add_block(block)
	}

	// draw F 
	var draw_F = function (ctx, F_shape, x, y, block_size, color, mirror) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = draw_block(ctx, x, y + i * block_size, block_size, color);
			F_shape.add_block(block)
		}

		if (mirror) {
			F_shape.add_block(draw_block(ctx, x + block_size, y + block_size, block_size, color));
			F_shape.add_block(draw_block(ctx, x - block_size, y, block_size, color));
		} else {
			F_shape.add_block(draw_block(ctx, x - block_size, y + block_size, block_size, color));
			F_shape.add_block(draw_block(ctx, x + block_size, y, block_size, color));
		}

	}


	// draw X 
	var draw_X = function (ctx, X_shape, x, y, block_size, color) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = draw_block(ctx, x, y + i * block_size, block_size, color);
			X_shape.add_block(block)
		}

		X_shape.add_block(draw_block(ctx, x - block_size, y + block_size, block_size, color));
		X_shape.add_block(draw_block(ctx, x + block_size, y + block_size, block_size, color));

	}

	// draw Z
	var draw_Z = function (ctx, X_shape, x, y, block_size, color, mirror) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = draw_block(ctx, x, y + i * block_size, block_size, color);
			X_shape.add_block(block)
		}

		if (mirror) {
			X_shape.add_block(draw_block(ctx, x + block_size, y + 2 * block_size, block_size, color));
			X_shape.add_block(draw_block(ctx, x - block_size, y, block_size, color));
		} else {
			X_shape.add_block(draw_block(ctx, x + block_size, y, block_size, color));
			X_shape.add_block(draw_block(ctx, x - block_size, y + 2 * block_size, block_size, color));
		}

	}


	// draw T
	var draw_T = function (ctx, T_shape, x, y, block_size, color) {

		ctx.beginPath();
		ctx.moveTo(x, y);

		// Draw blocks
		for (var i = 0; i < 3; i++) {
			var block = draw_block(ctx, x, y + i * block_size, block_size, color);
			T_shape.add_block(block)
		}

		T_shape.add_block(draw_block(ctx, x - block_size, y, block_size, color));
		T_shape.add_block(draw_block(ctx, x + block_size, y, block_size, color));

	}

	// define a place for storing shape data
	$.jCanvas.shape_dict = {};

	// Create a drawPentoShape() method
	$.jCanvas.extend({
		name: 'drawPentoShape',
		type: 'quadratic',
		fromCenter: true,
		width: 80,
		height: 80,
		props: {
			/*
			* I
			* F/F'
			* 
			*/
			type: 'F',
			block_size: 20,
			mirror: false,
			shape: null
		},
		fn: function (ctx, params) {
			// Enable layer transformations like scale and rotate
			$.jCanvas.transformShape(this, ctx, params);

			// drawing
			var shape = params.shape;
			switch (params.type) {
				case 'I':
					draw_I(ctx, shape, params.x + params.offsetX, params.y + params.offsetY, params.block_size, params.color)
					break;
				case 'F':
					draw_F(ctx, shape, params.x + params.offsetX, params.y + params.offsetY, params.block_size, params.color, params.mirror)
					break;
				case 'T':
					draw_T(ctx, shape, params.x + params.offsetX, params.y + params.offsetY, params.block_size, params.color, params.mirror)
					break;
				case 'L':
					draw_L(ctx, shape, params.x + params.offsetX, params.y + params.offsetY, params.block_size, params.color, params.mirror)
					break;
				case 'N':
					draw_N(ctx, shape, params.x + params.offsetX, params.y + params.offsetY, params.block_size, params.color, params.mirror)
					break;
				case 'P':
					draw_P(ctx, shape, params.x + params.offsetX, params.y + params.offsetY, params.block_size, params.color, params.mirror)
					break;
				case 'U':
					draw_U(ctx, shape, params.x + params.offsetX, params.y + params.offsetY, params.block_size, params.color)
					break;
				case 'V':
					draw_V(ctx, shape, params.x + params.offsetX, params.y + params.offsetY, params.block_size, params.color)
					break;
				case 'W':
					draw_W(ctx, shape, params.x + params.offsetX, params.y + params.offsetY, params.block_size, params.color)
					break;
				case 'X':
					draw_X(ctx, shape, params.x + params.offsetX, params.y + params.offsetY, params.block_size, params.color)
					break;
				case 'Y':
					draw_Y(ctx, shape, params.x + params.offsetX, params.y + params.offsetY, params.block_size, params.color, params.mirror)
					break;
				case 'Z':
					draw_Z(ctx, shape, params.x + params.offsetX, params.y + params.offsetY, params.block_size, params.color, params.mirror)
					break;
				default:
					shape = null;
					console.log("Unknown pento shape " + params.type)
					break;
			}

			if (shape != null) {
				$.jCanvas.shape_dict[params.name] = shape;
			}

			// Call the detectEvents() function to enable jCanvas events
			// Be sure to pass it these arguments, too!
			$.jCanvas.detectEvents(this, ctx, params);

			// Call the closePath() functions to fill, stroke, and close the path
			// This function also enables masking support and events
			// It accepts the same arguments as detectEvents()
			$.jCanvas.closePath(this, ctx, params);
		}
	});
})