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
		constructor(id, type, color) {
			this.id = id
			this.x = 0
			this.y = 0
			this.type = type
			this.color = color
			this.rotation = 0
			this.col = null
			this.row = null

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