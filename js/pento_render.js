$(document).ready(function () {

	// draw a block (smallest unit of pentomino shape)
	var draw_block = function (ctx, block, offsetX, offsetY) {

		ctx.fillStyle = block.color;
		ctx.strokeStyle = block.border_color
		
		ctx.moveTo(block.get_vertex(0,0)+ offsetX, block.get_vertex(0,1)+ offsetY);
		ctx.lineTo(block.get_vertex(1,0)+ offsetX, block.get_vertex(1,1)+ offsetY);
		ctx.lineTo(block.get_vertex(2,0)+ offsetX, block.get_vertex(2,1)+ offsetY);
		ctx.lineTo(block.get_vertex(3,0)+ offsetX, block.get_vertex(3,1)+ offsetY);
		ctx.lineTo(block.get_vertex(0,0)+ offsetX, block.get_vertex(0,1)+ offsetY)
		ctx.fill();
	}

	var draw_shape = function (ctx, shape, params) {
		ctx.beginPath();

		// Draw blocks
		for (var i = 0; i < shape.get_blocks().length; i++) {
			var block = shape.get_blocks()[i]
			draw_block(ctx, block, shape.x + params.offsetX, shape.y + params.offsetY);
		}
	}

	// Create a drawPentoShape() method
	$.jCanvas.extend({
		name: 'drawPentoShape',
		type: 'quadratic',
		props: {
			offsetX: 0,
			offsetY: 0,
			shape: null
		},
		fn: function (ctx, params) {
			// Enable layer transformations like scale and rotate
			$.jCanvas.transformShape(this, ctx, params);

			// drawing
			draw_shape(ctx, params.shape, params)

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