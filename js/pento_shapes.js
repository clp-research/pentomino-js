// draw a block (smallest unit of pentomino shape)
var draw_block = function (ctx, x, y, block_size, color) {

	ctx.fillStyle = color;
	ctx.rect(x, y, block_size, block_size)

	ctx.strokeStyle = 'black'
	ctx.strokeRect(x, y, block_size, block_size)

}

// draw I 
var draw_I = function (ctx, x, y, block_size, color) {

	ctx.beginPath();
	ctx.moveTo(x, y);

	// Draw blocks
	for (var i = 0; i < 4; i++) {
		draw_block(ctx, x, y + i * block_size, block_size, color);
	}
}

// draw F 
var draw_F = function (ctx, x, y, block_size, color, mirror) {

	ctx.beginPath();
	ctx.moveTo(x, y);

	// Draw blocks
	for (var i = 0; i < 3; i++) {
		draw_block(ctx, x, y + i * block_size, block_size, color);
	}

	if (mirror) {
		draw_block(ctx, x + block_size, y + block_size, block_size, color);
		draw_block(ctx, x - block_size, y, block_size, color);
	} else {
		draw_block(ctx, x - block_size, y + block_size, block_size, color);
		draw_block(ctx, x + block_size, y, block_size, color);
	}
}

// Create a drawPentoShape() method
$.jCanvas.extend({
	name: 'drawPentoShape',
	type: 'quadratic',
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

		// execute corresponding drawing
		switch (params.type) {
			case 'I':
				draw_I(ctx, params.x, params.y, params.block_size, params.color)
				break;
			case 'F':
				draw_F(ctx, params.x, params.y, params.block_size, params.color, params.mirror)
				break;
			default:
				console.log("Unknown pento shape " + params.type)
				break;
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
