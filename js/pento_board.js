$(document).ready(function () {


	this.PentoBoard = class PentoBoard {

		constructor(canvas_id, title, with_tray, with_grid) {
			this.canvas_id = canvas_id
			this.pento_canvas_ref = $(canvas_id);
			this.pento_canvas_ref.clearCanvas();

			this.title = title
			this.config = new document.PentoConfig()
			this.pento_shapes = {}

			// pento grid parameters
			this.pento_grid_cols = 20;
			this.pento_grid_rows = 20;
			this.pento_block_size = 20;
			this.pento_grid_color = 'gray';
			this.pento_grid_x = 0;
			this.pento_grid_y = 0;

			// pento game parameters
			this.show_grid = with_grid
			this.pento_read_only = false
			this.pento_lock_on_grid = true;
			this.pento_prevent_collision = false;
			this.pento_active_shape = null;
			this.pento_with_tray = with_tray;

			// event handler
			this.event_handlers = []

			// actions
			//this.actions = ["move", "rotate", "connect", "flip"]
			this.actions = ["move", "rotate"]

			this.init_board()
			this.init_grid(this.show_grid)

			// register event handler
			var self = this
			$(canvas_id).on('mouseleave', function (event) {
				self.pento_active_shape = null
				self.remove_arrows();
			});

			// init actions
			this.setup_canvas()
			this.draw()

		}

		clear_selections(){
			this.pento_active_shape = null
			this.remove_arrows()

			this.draw()
		}

		setup_canvas() {
			$(this.canvas_id).prop("width", this.pento_grid_cols * this.pento_block_size)
			$(this.canvas_id).prop("height", this.pento_grid_cols * this.pento_block_size)
		}

		set(key, value) {
			switch (key) {
				case "readonly":
					this.pento_read_only = value
					this.clear_selections()
					break;
				case "showgrid":
					this.show_grid = value
					this._update_grid();
					break;
				default:
					console.log("unknown config option: " + key)
			}
		}

		draw() {
			this.pento_canvas_ref.drawLayers()
		}

		draw_line(x, y, x2, y2, color, name) {
			if (name == undefined) {
				name = "line" + Math.random()
			}
			this.pento_canvas_ref.drawLine({
				layer: true,
				name: name,
				groups:['grid'],
				strokeStyle: color,
				strokeWidth: 1,
				x1: x, y1: y,
				x2: x2, y2: y2
			});
		}

		draw_text(x, y, text) {
			this.pento_canvas_ref.drawText({
				layer: true,
				name: text.replace(" ", "_"),
				fillStyle: 'black',
				strokeWidth: 2,
				x: x, y: y,
				fontSize: 16,
				text: text,
				fromCenter: false
			})
		}

		destroy_board() {
			this.pento_canvas_ref.removeLayer("game_board");
			this.pento_canvas_ref.removeLayer("tray")
			this.pento_canvas_ref.removeLayer("separator")
		}

		init_board() {
			this.destroy_board();

			if (this.pento_with_tray) {
				this.pento_canvas_ref.attr("height", 600);
				this.draw_line(0, 400, 600, 400, 'black', 'separator')
				this.draw_text(40, 410, "Tray")
			} else {
				this.pento_canvas_ref.attr("height", 400);
			}
			this.pento_canvas_ref.drawLayers()
		}

		_update_grid(){
			if(this.show_grid){
				this.init_grid()
			}else{
				this.remove_grid();
			}
		}

		remove_grid() {
			this.pento_canvas_ref.removeLayer('grid')
			this.pento_canvas_ref.removeLayerGroup('grid');
			this.draw()
		}

		init_grid() {
			this.pento_grid_width = this.pento_block_size * this.pento_grid_cols;
			this.pento_grid_height = this.pento_block_size * this.pento_grid_rows;

			this.pento_canvas_ref.addLayer({
				type: 'rectangle',
				name: 'grid',
				fillStyle: 'white',
				x: this.pento_grid_x, y: this.pento_grid_y,
				width: this.pento_board_width, height: this.pento_board_height
			})

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

		lock_shape_on_grid(layer) {
			var new_x = Math.floor((layer.x - this.pento_grid_x + layer.offsetX) / this.pento_block_size) * this.pento_block_size
			var new_y = Math.floor((layer.y - this.pento_grid_y + layer.offsetY) / this.pento_block_size) * this.pento_block_size
			layer.x = new_x + this.pento_grid_x - layer.offsetX
			layer.y = new_y + this.pento_grid_y - layer.offsetY
			this.pento_canvas_ref.drawLayers()
		}

		is_over_grid(x, y) {
			return x >= this.pento_grid_x && x <= this.pento_grid_x + this.pento_grid_width && y >= this.pento_grid_y && y <= this.pento_grid_y + this.pento_grid_height
		}

		check_collisions_of_shape(shape) {
			return this.get_collisions(shape) > 0
		}

		get_collisions(shape) {
			var hits = []
			for (var key in this.pento_shapes) {
				var other_shape = this.pento_shapes[key]

				if (other_shape.name != shape.name) {
					if (shape.hits(other_shape)) {
						hits.push(other_shape)
					}
				}

			}
			return hits
		}

		rotate_shape(angle) {
			this.pento_active_shape.rotate(angle)
			this.pento_canvas_ref.drawLayers()
		}

		destroy_shape(shape) {
			var name = shape.name
			this.pento_canvas_ref.removeLayer(name).drawLayers()
			delete this.pento_shapes[name]
		}

		destroy_all_shapes() {
			this.clear_selections()

			for (var index in this.pento_shapes) {
				var shape = this.pento_shapes[index]
				this.destroy_shape(shape)
			}	
		}

		redraw_arrows(pento_canvas_ref, layer) {
			if (this.pento_active_shape != null) {
				this.remove_arrows();
			}

			var offsetX = this.get_offsets(layer.type)[0];
			var offsetY = this.get_offsets(layer.type)[1];

			var x = layer.x + offsetX
			var y = layer.y + offsetY
			var width = layer.block_size
			var strokeWidth = 4
			var rounding = layer.block_size / 2
			var self = this

			pento_canvas_ref.drawPath({
				layer: true,
				name: "arrow_left",
				strokeStyle: '#000',
				fillStyle: 'transparent',
				strokeWidth: strokeWidth,
				p1: {
					type: 'quadratic',
					x1: x + width, y1: y + width / 2,
					cx1: x + width + rounding, cy1: y - rounding + width / 2,
					x2: x + width * 2, y2: y + width / 2,
					endArrow: true,
					rounded: true,
					arrowAngle: 60,
					arrowRadius: 10
				},
				click: function () {
					self.rotate_shape(5)
				},
				mousedown: async function(){
					self._multi_rotation = true
					var reduction = 0.1
					var sleep_time = 400
					while(self._multi_rotation){
						self.rotate_shape(5)
						await new Promise(r => setTimeout(r, sleep_time));

						if (sleep_time>=80){
							sleep_time -= sleep_time*reduction
						}	
					}
				},
				mouseup: function(){
					self._multi_rotation = false
				}
			});

			pento_canvas_ref.drawPath({
				layer: true,
				name: "arrow_right",
				strokeStyle: '#000',
				fillStyle: 'transparent',
				strokeWidth: strokeWidth,
				p1: {
					type: 'quadratic',
					x1: x, y1: y + width / 2,
					cx1: x + rounding - width, cy1: y - rounding + width / 2,
					x2: x - width, y2: y + width / 2,
					endArrow: true,
					arrowAngle: -60,
					arrowRadius: 10
				},
				click: function () {
					self.rotate_shape(-5)
				},
				mousedown: function(){

				},
				mouseup: function(){
					
				}
			});
		}

		remove_arrows = function () {
			this.pento_canvas_ref.removeLayer("arrow_left");
			this.pento_canvas_ref.removeLayer("arrow_right");
		}

		update_arrows = function (layer, is_drag) {
			var dx = layer.dx
			var dy = layer.dy
			var arrow_left = this.pento_canvas_ref.getLayer("arrow_left");
			arrow_left.x += dx;
			arrow_left.y += dy;

			var arrow_right = this.pento_canvas_ref.getLayer("arrow_right");
			arrow_right.x += dx;
			arrow_right.y += dy;

			if (is_drag) {
				this.pento_active_shape.shadowColor = 'black'
				this.pento_active_shape.shadowX = 1
				this.pento_active_shape.shadowY = -1
				this.pento_active_shape.shadowBlur = 3
			} else {
				this.pento_active_shape.shadowColor = 'transparent'
			}
		}

		set_active(layer) {
			this.pento_canvas_ref.moveLayer(layer.name, -1);
			this.pento_active_shape = layer
			this.redraw_arrows(this.pento_canvas_ref, layer)
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
			var self = this

			this.pento_canvas_ref.drawPentoShape({
				layer: true,
				name: shape.name,
				block_size: this.pento_block_size,
				draggable: !this.pento_read_only,
				x: shape.x, y:shape.y,
				offsetX: offsetX,
				offsetY: offsetY,
				width: 80,
				height: 80,
				shape: shape,
				fromCenter: true,
				mouseover: function (layer) {
					if (!self.pento_read_only) {
						self.set_active(shape)
					}
				},
				click: function (layer) {
					if (!self.pento_read_only) {
						self.set_active(shape)
					}
				},
				dragstart: function (layer) {
					// code to run when dragging starts
					if (!self.pento_read_only) {
						self.update_arrows(layer, true)
						last_x = layer.x;
						last_y = layer.y;
					}
				},
				drag: function (layer) {
					// code to run as layer is being dragged
					if (!self.pento_read_only) {
						self.update_arrows(layer, true)
						shape.x = layer.x
						shape.y = layer.y
					}
				},
				dragstop: function (layer) {
					if (!self.pento_read_only) {
						// code to run when dragging stops
						var layer_x = layer.x + layer.width / 2
						var layer_y = layer.y + layer.height / 2

						if (self.is_over_grid(layer_x, layer_y) && self.pento_lock_on_grid) {
							self.lock_shape_on_grid(layer)
						}

						if (self.check_collisions_of_shape(layer["shape"]) && self.pento_prevent_collision) {
							layer.x = last_x;
							layer.y = last_y;
						}else{
							shape.x = layer.x
							shape.y = layer.y
						}
						self.update_arrows(layer, false)
						self.set_active(layer.shape)
						
						self.fire_event("shape_moved", shape.name, { "x": layer.x, "y": layer.y })
					}
				}
			});

			this.pento_shapes[shape.name] = shape
		}

		grid_cell_to_coordinates(col, row) {
			return [col * this.pento_block_size, row * this.pento_block_size]
		}

		get_actions() {
			return this.actions
		}

		/**
		 * Checks if action and shape are valid considering the current board state
		 * @param {*} action_name 
		 * @param {*} shape 
		 * @param {*} params 
		 */
		isValidAction(action_name, shape, params) {
			// make extra check for place as this is a one time action
			if ( (this.get_actions().indexOf(action_name) != -1 || action_name == "place" ) && 
				shape.is_inside(this.pento_grid_x, this.pento_grid_y, 400, 400)) {
				switch (action_name) {
					case "connect":
						if (!params['other_shape'].is_connected(shape) && shape.name != params['other_shape']) {
							return true
						}
						break;
					case "place":
						if (!this.check_collisions_of_shape(shape)) {
							return true
						}
						break;
					case "move":
						if (!this.check_collisions_of_shape(shape) && !shape.has_connections()) {
							return true
						}
						break;
					case "rotate":
						if (!this.check_collisions_of_shape(shape) && !shape.has_connections()) {
							return true
						}
						break;
					case "flip":
						if (!this.check_collisions_of_shape(shape) && !shape.has_connections()) {
							return true
						}
						break;
				}
			}
			return false
		}

		execute_action(action_name, shape, params) {
			//["move","rotate","connect"]
			switch (action_name) {
				case "move":
					shape.moveTo(params["x"], params["y"])
					this.fire_event("shape_moved", shape.name, { "x": params["x"], "y": params["y"] })
					break
				case "rotate":
					shape.rotate(params["rotation"])
					this.fire_event("shape_rotated", shape.name, { "rotation": params["rotation"] })
					break
				case "connect":
					var group_id = shape.connect_to(params["other_shape"])
					this.fire_event("shape_connected", shape.name, {
						"other_shape": params["other_shape"].name,
						"group_id": group_id
					})
					break
				default:
					console.log("Unknown action: " + action_name)
			}
		}

		// event functions
		register_event_handler(handler) {
			this.event_handlers.push(handler)
		}

		fire_event(event_type, event_object_id, event_changes) {
			var event = {
				"type": event_type,
				"object_id": event_object_id,
				"changes": event_changes
			}

			this.event_handlers.forEach(handler => handler.handle(event))
		}

		// utility
		saveBoard() {
			var self = this
			this.pento_canvas_ref[0].toBlob(function (data) {
				saveAs(data, self.title + '.png')
			})
		}

		toJSON() {
			return this.pento_shapes
		}

		fromJSON(shapes){
			this.destroy_all_shapes();

			for(var s in shapes){
				var shape = Object.assign(new document.Shape, shapes[s])

				var blocks = []
				for(var b in shape.get_blocks()){
					var block_data = shape.get_blocks()[b]
					var block = Object.assign(new document.Block, block_data)
					blocks.push(block)
				}
				shape.blocks = blocks
				shape.close()
				
				this.place_shape(shape)
			}
			
			this.pento_canvas_ref.drawLayers()
		}
	}

})