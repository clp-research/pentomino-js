$(document).ready(function () {

	// draw a block (smallest unit of pentomino shape)
	var draw_block = function (ctx, block, offsetX, offsetY) {

		ctx.fillStyle = block.color;
		ctx.rect(block.x + offsetX, block.y + offsetY, block.width, block.height)

		ctx.strokeStyle = block.border_color
		ctx.strokeRect(block.x + offsetX, block.y + offsetY, block.width, block.height)
	}

	var draw_shape = function (ctx, shape, params) {
		ctx.beginPath();
		ctx.moveTo(shape.x, shape.y);

		// Draw blocks
		for (var i = 0; i < shape.get_blocks().length; i++) {
			var block = shape.get_blocks()[i]
			draw_block(ctx, block, shape.x + params.offsetX, shape.y + params.offsetY);
		}
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
			type: '',
			block_size: 20,
			mirror: false,
			shape: null
		},
		fn: function (ctx, params) {
			// Enable layer transformations like scale and rotate
			$.jCanvas.transformShape(this, ctx, params);

			// drawing
			var shape = params.shape;
			draw_shape(ctx, shape, params)

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