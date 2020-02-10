$(document).ready(function () {

	class DefaultDict {
		constructor(default_value) {
			this.dict = {}
			this.default_value = default_value
		}

		set(key, value) {
			this.dict[key] = value
		}

		get(key) {
			if (!this.dict.hasOwnProperty(key)) {
				this.dict[key] = this.default_value
			}
			return this.dict[key]
		}
	}

	class PentoConfig {

		constructor() { }

		get_pento_colors() {
			return ['#EEAAAA', '#DDBB99', '#CCCC88', '#BBDD99', '#AAEEAA', '#DD99BB', '#CC88CC', '#99BBDD', '#AAAAEE', '#88CCCC', '#99DDBB']
		}

		get_pento_types() {
			return ['F', 'I', 'L', 'N', 'P', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
		}

	}

	this.PentoConfig = PentoConfig
})

