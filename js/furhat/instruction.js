$(document).ready(function () {

	this.Instruction = class Instruction {
		constructor(shape, type, params, config) {
			this.shape_name	= shape;
			this.type		= type;
			this.params		= params;
			this.config		= config;
		}
		
		// to string / to_speech function?
	
		toString() {
			if (this.type == 'move')
				return `Move the ${this._get_color()} ${this._get_shape()} ${this._get_distance()} ${this._get_move_direction()}`
			if (this.type == 'rotate')
				return `Rotate the ${this._get_color()} ${this._get_shape()} ${this._get_rotation()}`
			return 'unknown instruction type'
		}
		
		
		// helper function to describe shape to move and action to take
		_get_color() {
			// last 7 digits of the name are a hex color code
			let color_str = this.shape_name.slice(-7);
			return this.config.color_map[color_str]
		}
		
		_get_shape() {
			// first letter of the name is the shape
			return this.shape_name[0]
		}
		
		//TODO: improve
		_get_distance() {
			let block_size = this.config.block_size;
			if (this.params.x > 0) return this.params.x / block_size
			if (this.params.x < 0) return (-this.params.x) / block_size
			if (this.params.y > 0) return this.params.y / block_size
			if (this.params.y < 0) return (-this.params.y) / block_size
			return 'error'
		}
		
		_get_move_direction() {
			if (this.params.x > 0) return 'to the right'
			if (this.params.x < 0) return 'to the left'
			if (this.params.y > 0) return 'down'
			if (this.params.y < 0) return 'up'
			return 'far away'
		}

		_get_rotation() {
			if (this.params.angle > 180) return `${360-this.params.angle} degrees to the right`
			else if (this.params.angle > 0) return `${this.params.angle} degrees to the left`
			else if (this.params.angle > -180) return `${Math.abs(this.params.angle)} degrees to the left`
			else return `${360 + this.params.angle} degrees to the right`
		}
	};
})

