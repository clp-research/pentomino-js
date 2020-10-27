$(document).ready(function () {
	this.PentoSelectionBoard = class PentoSelectionBoard {
		/**
		 *
		 * @param {id of html canvas} canvas_id
		 * @param {} title
		 * @param {*} with_tray
		 * @param {*} with_grid
		 */
		constructor(canvas_id, title, with_grid) {
			this.canvas_id = canvas_id;
			this.pento_canvas_ref = $(canvas_id);
			this.pento_canvas_ref.clearCanvas();

			this.title = title;
			this.config = new document.PentoConfig();
			this.pento_shapes = {};

			// pento grid parameters
			this.pento_grid_cols = 20;
			this.pento_grid_rows = 20;
			this.pento_block_size = document.config.block_size;
			this.pento_grid_color = 'gray';
			this.pento_grid_x = 0;
			this.pento_grid_y = 0;

			// pento game parameters
			this.show_grid = with_grid;
			this.pento_read_only = false;
			this.pento_active_shape = null;

			// event handler
			this.event_handlers = [];

			this.init_board();
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

		clear_selections() {
			if (this.pento_active_shape != null){
				this.pento_active_shape.set_deactive();
			}
			this.pento_active_shape = null;
			this.draw();
		}

		setup_canvas() {
			$(this.canvas_id).prop('width', this.pento_grid_cols * this.pento_block_size);
			$(this.canvas_id).prop('height', this.pento_grid_cols * this.pento_block_size);
		}

//		set(key, value) {
//			switch (key) {
//				case 'readonly':
//					this.pento_read_only = value;
//					this.clear_selections();
//					break;
//				case 'showgrid':
//					this.show_grid = value;
//					this._update_grid();
//					break;
//				default:
//					console.log('unknown config option: ' + key);
//			}
//		}

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
//
//		destroy_board() {
//			this.pento_canvas_ref.removeLayer('game_board');
//		}

		init_board() {
			//this.destroy_board();
			//this.pento_canvas_ref.attr('height', 400);
			this.pento_canvas_ref.drawLayers();
		}

		_update_grid() {
			if (this.show_grid) {
				this.init_grid();
			} else {
				this.remove_grid();
			}
		}

		remove_grid() {
			this.pento_canvas_ref.removeLayer('grid');
			this.pento_canvas_ref.removeLayerGroup('grid');
			this.draw();
		}

		init_grid() {
			this.pento_grid_width = this.pento_block_size * this.pento_grid_cols;
			this.pento_grid_height = this.pento_block_size * this.pento_grid_rows;

			this.pento_canvas_ref.addLayer({
				type: 'rectangle',
				name: 'grid',
				fillStyle: 'white',
				x: this.pento_grid_x, y: this.pento_grid_y,
				width: this.pento_grid_width, height: this.pento_grid_height
			});

			if (this.show_grid) {
				for (var i = 0; i <= this.pento_grid_rows; i++) {
					this.draw_line(this.pento_grid_x, this.pento_grid_y + i * this.pento_block_size,
						this.pento_grid_x + this.pento_grid_width, this.pento_grid_y + i * this.pento_block_size, this.pento_grid_color);
				}

				for (var i = 0; i <= this.pento_grid_cols; i++) {
					this.draw_line(this.pento_grid_x + i * this.pento_block_size, this.pento_grid_y + 0,
						this.pento_grid_x + i * this.pento_block_size, this.pento_grid_y + this.pento_grid_height, this.pento_grid_color);
				}
			}
		}

		destroy_shape(shape) {
			var name = shape.name;
			this.pento_canvas_ref.removeLayer(name).drawLayers();
			delete this.pento_shapes[name];
		}

		destroy_all_shapes() {
			this.clear_selections();

			for (var index in this.pento_shapes) {
				var shape = this.pento_shapes[index];
				this.destroy_shape(shape);
			}
		}

		set_active(shape) {
			if (this.pento_active_shape != null){
				this.pento_active_shape.set_deactive();
			}
			this.pento_canvas_ref.moveLayer(shape.name, -1);
			this.pento_active_shape = shape;
			shape.set_active();
		}

		get_offsets(type) {
			// returns offsets for (x,y) coordinates to position
			// drawing in the middle of the shape area
			switch (type) {
				case 'I':
					return [0, 0]
				case 'T': case 'F':
					return [0, 0]
				default:
					return [0, 0]
			}
		}

		place_shape(shape) {
			var offsetX = this.get_offsets(shape.type)[0];
			var offsetY = this.get_offsets(shape.type)[1];
			var last_x;
			var last_y;
			var self = this;

			this.pento_canvas_ref.drawPentoShape({
				layer: true,
				name: shape.name,
				block_size: this.pento_block_size,
				draggable: false,
				x: shape.x, y: shape.y,
				offsetX: offsetX,
				offsetY: offsetY,
				width: 80,
				height: 80,
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
						//TODO: verbal confirmation + build task board
						self.destroy_shape(shape);
					}
				}
			});
			this.pento_shapes[shape.name] = shape;
			this.draw();
		}

		// event functions
		register_event_handler(handler) {
			this.event_handlers.push(handler);
		}

		fire_event(event_type, event_object_id, event_changes) {
			var event = {
				'type': event_type,
				'object_id': event_object_id,
				'changes': event_changes
			};

			this.event_handlers.forEach(handler => handler.handle(event));
		}

		fromJSON(shapes) {
			this.destroy_all_shapes();

			for (var s in shapes) {
				var shape = Object.assign(new document.Shape, shapes[s]);

				var blocks = [];
				for (var b in shape.get_blocks()) {
					var block_data = shape.get_blocks()[b];
					var block = Object.assign(new document.Block, block_data);
					blocks.push(block);
				}
				shape.blocks = blocks;

				shape.close();
				this.place_shape(shape);
			}
			this.draw();
		}

		hashCode() {
			var s = this.toJSON().toString();
			for (var i = 0, h = 0; i < s.length; i++)
				h = Math.imul(31, h) + s.charCodeAt(i) | 0;
			return h
		}
	};
})
