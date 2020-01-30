$(document).ready(function () {

	// draw a block (smallest unit of pentomino shape)
	var draw_block = function (ctx, block, offsetX, offsetY) {

		ctx.fillStyle = block.color;
		ctx.strokeStyle = block.border_color
		
		ctx.moveTo(block.vertices[0][0]+ offsetX, block.vertices[0][1]+ offsetY);
		ctx.lineTo(block.vertices[1][0] + offsetX, block.vertices[1][1]+ offsetY);
		ctx.lineTo(block.vertices[2][0]+ offsetX, block.vertices[2][1]+ offsetY);
		ctx.lineTo(block.vertices[3][0]+ offsetX, block.vertices[3][1]+ offsetY);
		ctx.lineTo(block.vertices[0][0]+ offsetX, block.vertices[0][1]+ offsetY)
		ctx.fill();
	}

	var draw_shape = function (ctx, shape, params) {
		ctx.beginPath();

		// Draw blocks
		for (var i = 0; i < shape.get_blocks().length; i++) {
			var block = shape.get_blocks()[i]
			draw_block(ctx, block, shape.x + params.offsetX, shape.y + params.offsetY);
		}

		ctx.closePath()
	}

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
			// set rotation
			//params.rotate = params.shape.rotation
			
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