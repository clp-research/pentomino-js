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
	constructor(name) {
		this.name = name
		this.blocks = []
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

// draw a block (smallest unit of pentomino shape)
var draw_block = function (ctx, x, y, block_size, color) {

	ctx.fillStyle = color;
	ctx.rect(x, y, block_size, block_size)

	ctx.strokeStyle = 'black'
	ctx.strokeRect(x, y, block_size, block_size)

	return new Block(x, y, block_size, block_size)
}

// draw I 
var draw_I = function (ctx, x, y, block_size, color) {

	ctx.beginPath();
	ctx.moveTo(x, y);
	var I_shape = new Shape('I')

	// Draw blocks
	for (var i = 0; i < 4; i++) {
		var block = draw_block(ctx, x, y + i * block_size, block_size, color);
		I_shape.add_block(block)
	}

	return I_shape
}

// draw F 
var draw_F = function (ctx, x, y, block_size, color, mirror) {

	ctx.beginPath();
	ctx.moveTo(x, y);
	var F_shape = new Shape('F')

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

	return F_shape
}

// draw T
var draw_T = function (ctx, x, y, block_size, color) {

	ctx.beginPath();
	ctx.moveTo(x, y);
	var T_shape = new Shape('T')

	// Draw blocks
	for (var i = 0; i < 3; i++) {
		var block = draw_block(ctx, x, y + i * block_size, block_size, color);
		T_shape.add_block(block)
	}

	T_shape.add_block(draw_block(ctx, x - block_size, y, block_size, color));
	T_shape.add_block(draw_block(ctx, x + block_size, y, block_size, color));

	return T_shape
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
		mirror: false
	},
	fn: function (ctx, params) {
		// Enable layer transformations like scale and rotate
		$.jCanvas.transformShape(this, ctx, params);

		// drawing
		var shape = null;
		switch (params.type) {
			case 'I':
				shape = draw_I(ctx, params.x + params.offsetX, params.y + params.offsetY, params.block_size, params.color)
				break;
			case 'F':
				shape = draw_F(ctx, params.x + params.offsetX, params.y + params.offsetY, params.block_size, params.color, params.mirror)
				break;
			case 'T':
				shape = draw_T(ctx, params.x + params.offsetX, params.y + params.offsetY, params.block_size, params.color, params.mirror)
				break;
			default:
				console.log("Unknown pento shape " + params.type)
				break;
		}

		if (shape != null){
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
