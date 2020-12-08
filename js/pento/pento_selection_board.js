$(document).ready(function () {
	this.PentoSelectionBoard = class PentoSelectionBoard {
		/**
		 * Constructor
		 * @param {id of html canvas} canvas_id
		 * @param {name of the board} title
		 * @param {true for visible grid} with_grid
		 * @param {PentoConfig instance} config
		 * @param {true to stop changes. default:false} read_only
		 */
		constructor(canvas_id, title, with_grid, config, read_only=false) {
			this.canvas_id 			= canvas_id;
			this.pento_canvas_ref	= $(canvas_id);
			this.pento_canvas_ref.clearCanvas();

			this.title 				= title;
			this.config				= config;
			this.pento_shapes		= {};

			// board size and grid parameters
			this.pento_grid_cols	= config.n_blocks;
			this.pento_grid_rows	= config.n_blocks;
			this.width				= config.board_size;
			this.height				= config.board_size;
			this.pento_block_size	= config.block_size;
			this.pento_grid_color	= 'gray';
			this.pento_grid_x		= 0;
			this.pento_grid_y		= 0;
			this.source_board_size; // size of source board when board is created from JSON

			// pento game parameters
			this.show_grid 			= with_grid;
			this.pento_read_only	= read_only;
			this.pento_active_shape	= null;

			// event handler
			this.event_handlers		= [];

			this.init_grid(this.show_grid);

			// register event handler
			var self = this;
			$(canvas_id).on('mouseleave', function (event) {
				self.clear_selections();
			});

			// init actions
			this.setup_canvas();
			this.draw();
		}
		
		get canvas() {
			return this.pento_canvas_ref[0];
		}
		

		get shapes() {
			return this.pento_shapes;
		}
		
		/**
		 * @return a shape that has not been selected yet (= is still invisible)
		 */
		get next_shape() {
			for (let l of this.pento_canvas_ref.getLayers()) {
				if (l.name != 'grid' && !l.visible) {
					return l;
				}
			}
			return null;
		}
		
		/**
		 * @return shape with given name
		 */
		get_shape(name) {
			return this.shapes[name];
		}
		
		/**
		 * @return offsets for (x,y) coordinates to position drawing in the middle of the shape area
		 */
		get_offsets(type) {
			switch (type) {
				case 'I':
					return [0, 0]
				case 'T': case 'F':
					return [0, 0]
				default:
					return [0, 0]
			}
		}

		/**
		 * Unselect the currently active shape
		 */
		clear_selections() {
			if (this.pento_active_shape != null){
				this.pento_active_shape.set_deactive();
			}
			this.pento_active_shape = null;
			this.draw();
		}
			
		/**
		 * Adapt the JCanvas to the boards dimension
		 */
		setup_canvas() {
			$(this.canvas_id).prop('width', this.width);
			$(this.canvas_id).prop('height', this.height);
		}

		/**
		 * Draw the canvas contents to the screen
		 */
		draw() {
			this.pento_canvas_ref.drawLayers();
		}

		draw_line(x, y, x2, y2, color, name) {
			if (name == undefined) {
				name = 'line' + Math.random();
			}
			this.pento_canvas_ref.drawLine({
				layer: true,
				name: name,
				groups: ['grid'],
				strokeStyle: color,
				strokeWidth: 1,
				x1: x, y1: y,
				x2: x2, y2: y2
			});
		}
		
		/**
		 * Draw or remove the grid.
		 */
		_update_grid() {
			if (this.show_grid) {
				this.init_grid();
			} else {
				this.remove_grid();
			}
		}
		
		/**
		 * Delete the 'grid' layer from the canvas and redraw
		 */
		remove_grid() {
			this.pento_canvas_ref.removeLayer('grid');
			this.pento_canvas_ref.removeLayerGroup('grid');
			this.draw();
		}
		
		/**
		 * Add a grid layer to the canvas. Does not redraw automatically.
		 */
		init_grid() {
			this.pento_canvas_ref.addLayer({
				type: 'rectangle',
				name: 'grid',
				fillStyle: 'white',
				x: this.pento_grid_x, y: this.pento_grid_y,
				width: this.width, height: this.height
			});

			if (this.show_grid) {
				for (var i = 0; i <= this.pento_grid_rows; i++) {
					this.draw_line(this.pento_grid_x, this.pento_grid_y + i * this.pento_block_size,
						this.pento_grid_x + this.width, this.pento_grid_y + i * this.pento_block_size, this.pento_grid_color);
				}

				for (var i = 0; i <= this.pento_grid_cols; i++) {
					this.draw_line(this.pento_grid_x + i * this.pento_block_size, this.pento_grid_y + 0,
						this.pento_grid_x + i * this.pento_block_size, this.pento_grid_y + this.height, this.pento_grid_color);
				}
			}
		}

		/**
		 * Remove a shape from canvas and internal structure.
		 * @param {shape name or PentoShape object to remove} shape
		 */
		destroy_shape(shape) {
			var name = shape.name || shape;
			this.pento_canvas_ref.removeLayer(name).drawLayers();
			delete this.shapes[name];
		}
		
		/**
		 * Remove all shapes
		 */
		destroy_all_shapes() {
			this.clear_selections();

			for (var index in this.shapes) {
				var shape = this.shapes[index];
				this.destroy_shape(shape);
			}
		}
		
		/**
		 * Move shape to foreground and highlight it
		 * @param {PentoShape to set active} shape
		 */
		set_active(shape) {
			if (this.pento_active_shape != null){
				this.pento_active_shape.set_deactive();
			}
			this.pento_canvas_ref.moveLayer(shape.name, -1);
			this.pento_active_shape = shape;
			shape.set_active();
		}

		/**
		 * Place and draw a shape on the canvas.
		 * {PentoShape to place} shape
		 */
		place_shape(shape) {
			var offsetX = this.get_offsets(shape.type)[0];
			var offsetY = this.get_offsets(shape.type)[1];
			var self = this;

			this.pento_canvas_ref.drawPentoShape({
				layer: true,
				name: shape.name,
				block_size: this.pento_block_size,
				draggable: false,
				x: shape.x, y: shape.y,
				offsetX: offsetX,
				offsetY: offsetY,
				width: this.pento_block_size * shape.get_grid_width(),
				height: this.pento_block_size * shape.get_grid_width(),
				shape: shape,
				fromCenter: true,
				mouseover: function (layer) {
					if (!self.pento_read_only) {
						self.set_active(shape);
					}
				},
				click: function (layer) {
					if (!self.pento_read_only) {
						// remove the shape from the selection board
						//self.destroy_shape(shape);
						self.fire_event('shape_selected', self.pento_active_shape.name, {});
					}
				}
			});
			this.shapes[shape.name] = shape;
			this.draw();
		}
		
		/**
		 * Returns true if shape is present on the board.
		 * @param {shape name to check for} shape
		 */
		_has_shape(shape) {
			return (Object.keys(this.shapes).indexOf(shape) != -1)
		}
		
		/**
		 * For task boards:
		 * check if selected shape is present, if applicable, make it visible on the board
		 * @param {name of selected shape} shape
		 */
		handle_selection(shape) {
			if (this._has_shape(shape)) {
				// show shape on the task board
				this.toggle_visibility(true, shape);
			}
		}
		
		/**
		 * Switch the visibility of a single shape
		 * @param {true = visible, false = invisible} visible
		 * @param {shape name or null for all shapes} shape
		 */
		toggle_visibility(is_visible, shape=null) {
			if (shape == null) {
				this.pento_canvas_ref.setLayers({
					visible: is_visible
				})
				.drawLayers();
			} else {
				this.pento_canvas_ref.setLayer(shape, {
					visible: is_visible
				})
				.drawLayers();
			}
		}
		
		// ----- event functions -----
		
		/**
		 * Add an event handler
		 * @param {handler object with 'handle' attribute: function(event){}} handler
		*/
		register_event_handler(handler) {
			this.event_handlers.push(handler);
		}
		
		/**
		 * Pass event to event handlers
		 * @param {info for event handlers} event_type
		 * @param {info for event handlers} event_object_id
		 * @param {info for event handlers} event_changes
		 */
		fire_event(event_type, event_object_id, event_changes) {
			var event = {
				'type': event_type,
				'object_id': event_object_id,
				'changes': event_changes
			};

			this.event_handlers.forEach(handler => handler.handle(event));
		}
		
		
		/**
		 * @return factor to scale pieces from source JSON size to this board's size
		 */
		scale_to_target_size() { return this.width/this.source_board_size; }
		/**
		 * @return factor to scale this board's pieces to the original JSON's size
		 */
		scale_to_source_size() { return this.source_board_size/this.width; }

		/**
		 * Import canvas config from data read from a json file
		 * @param {json object containing shape objects} shapes
		 * @param {size of canvas described by the json file. default: 400} saved_board_size
		 */
		fromJSON(shapes, saved_board_size=400) {
			this.destroy_all_shapes();
			this.source_board_size = saved_board_size;
			for (var s in shapes) {
				var shape = Object.assign(new document.Shape, shapes[s]);
				// adapt shapes to this board's settings
				shape.scale(this.pento_block_size, this.scale_to_target_size());
				shape.close();
				// apply given rotation
				shape.rotate(shape.rotation);
				this.place_shape(shape);
			}
			this.draw();
		}
	};
})
