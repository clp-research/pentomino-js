$(document).ready(function () {
	
	this.DefaultDict = class DefaultDict {
		constructor(default_value) {
			this.dict = {};
			this.default_value = default_value;
		}

		set(key, value) {
			this.dict[key] = value;
		}

		get(key) {
			if (!this.dict.hasOwnProperty(key)) {
				this.dict[key] = this.default_value;
			}
			return this.dict[key];
		}
	};
	
	this.PentoConfig = class PentoConfig {
		constructor() {
			this.color_map = {
				'#EEAAAA': 'light red',
				'#DDBB99': 'beige',
				'#FFFF80': 'yellow',
				'#BFFF80': 'light green',
				'#408000': 'dark green',
				'#DD99BB': 'pink',
				'#CC88CC': 'purple',
				'#99BBDD': 'light blue',
				'#336699': 'dark blue',
				'#5CD6D6': 'turquoise',
				'#FFB366': 'orange'
			};
			
			this.block_size		= 20;
			this.rotation_step	= 45;
		}

		get_pento_shape_actions(){
			return ['move', 'rotate']
		}

		get_pento_colors() {
			// get keys of color map
			let colors = new Array();
			for (let c in this.color_map) {
				colors.push(c);
			}
			return colors
		}

		get_pento_types() {
			return ['F', 'I', 'L', 'N', 'P', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
		}
	};
})

