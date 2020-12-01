$(document).ready(function () {
	/**
	 * Class to generate instructions and collect data of the task following process.
	 *
	 * @author clpresearch / Karla Friedrichs
	 */
	 
	this.InstructionManager = class InstructionManager {
		/**
		 * Constructor
		 * Tasks can be created using the 'task creator' interface.
		 *
		 * @param {board pieces are selected from} selection_board
		 * @param {board to represent task} task_board
		 */
		constructor(selection_board, task_board, track_interval=200) {
			this.selection_board		= selection_board;
			this.task_board 			= task_board;
			// for each task and each instruction, log mouse movement, time, selected piece
			this.follower_data 			= {};
			this.task_name; // name of current task (e.g. file name)
			// for current instruction
			this.shape; // shape name
			this.instruction; // audio of current instruction
			this.current_start_time 	= Date.now();
			this.track_id; // interval id if tracking is running
			this.track_interval			= track_interval; // how often is mouse position checked (milliseconds)
			this.current_mouse_movement = [];
		}
		
		/**
		 * Registers the start of a new task
		 * @param {optional task name, number is used otherwise} name
		 */
		new_task(name=null) {
			this.task_name = name || Object.keys(this.follower_data).length.toString();
			this.follower_data[this.task_name] = {};
		}

		/**
		 * Generate a new instruction.
		 * @param {true to play instruction as audio, false for console output. default: true} audio
		 * @return true if instruction was generated, false if task is complete
		 */
		generate_instruction(audio=true) {
			// generate / speak/write instruction
			let next_shape = this.task_board.next_shape;
			if (!next_shape) {
				return false;
			} else {
				this.shape = next_shape.name;
				// save the target shape coordinates
				let target = this.selection_board.get_shape(this.shape);
				this.follower_data[this.task_name][this.shape] = {
					'target_x': target.x,
					'target_y': target.y
				}
				if (audio) {
					// get audio for instruction and play it
					// remove '#' from shape name to get file name
					let instr_file = `./resources/audio/${this.shape.slice(0,2)}${this.shape.slice(3)}.mp3`;
					this.instruction = new Audio(instr_file);
					// start instruction as soon as audio is loaded sufficiently
					this.instruction.oncanplaythrough = (event) => {
						this.instruction.play();
						this._start_instruction(); // start tracking etc.
					};
				} else {
					console.log(`Please select ${this.shape}`);
					this._start_instruction(); // start tracking etc.
				}
				return true;
			}
		}
		
		/**
		 * Start data collection for current instruction
		 */
		_start_instruction() {
			this.current_start_time = Date.now();
			this._start_mouse_track();
		}
		
		/**
		 Stop data collection for current instruction and handle the follower action.
		 @param {name of shape selected by follower} selected_shape
		 */
		complete_instruction(selected_shape) {
			this.follower_data[this.task_name][this.shape]['selected'] = selected_shape;
			this._stop_mouse_track(); // saves mouse movement
			this.instruction.pause(); // stop audio
			// correct shape selected
			if (this.shape == selected_shape) {
				this.follower_data[this.task_name][this.shape]['correct'] = true;
			// incorrect shape selected, correct one is removed anyway
			} else {
				this.follower_data[this.task_name][this.shape]['correct'] = false;
				console.log('That was not the correct shape. Let me select the right one for you.')
				// remove shape from selection board
				this.selection_board.destroy_shape(this.shape);
				// handle the incorrectly selected shape
				this.task_board.handle_selection(selected_shape);
			}
			this.task_board.handle_selection(this.shape);
		}
		
		/**
		 * Play an example audiofile
		 */
		audiotest() {
			let test_file = './resources/audio/audiotest.mp3';
			let test_audio = new Audio(test_file);
			test_audio.oncanplaythrough = (event) => {test_audio.play();};
		}
		
		/**
		 * Emit a 'well done' message
		 * @param {pass true to enable audio. default: true} audio
		 */
		well_done(audio=true) {
			if (audio) {
				let well_done_file = './resources/audio/done.mp3';
				let well_done_audio = new Audio(well_done_file);
				well_done_audio.oncanplaythrough = (event) => {
					well_done_audio.play();
				}
			} else {
				console.log("Well done!");
			}
		}
		
		/**
		 * Save additional info to current follower data.
		 * Data can be added at three levels:
		 * 		'global': add to root of info dictionary
		 *		'task': add to current task
		 *		'shape': add to current shape of the running task
		 * @param {a descriptive name for the new information} key
		 * @param {content to assign to key} value
		 * @param {one of ['global', 'task', 'shape']. Defines insertion point to the data.}
		 */
		add_info(key, value, level='global') {
			switch(level) {
				case 'global':
					this.follower_data[key] = value;
					break;
				case 'task':
					if (!this.task_name) {
						console.log("Error: Trying to save info with no running task.")
					} else {
						this.follower_data[this.task_name][key] = value;
					}
					break;
				case 'shape':
					if (!this.task_name || !this.shape) {
						console.log("Error: Trying to save info, but no task running or no target shape.")
					} else {
						this.follower_data[this.task_name][this.shape][key] = value;
					}
					break;
				default:
					// Don't save anything, emit error message
					console.log(`Error: Undefined insertion level to save data ${key} = ${value}: ${level}`)
			}
		}
		
		/**
		 * @return collected data as a JSON string
		 */
		data_to_JSON() {
			return JSON.stringify(this.follower_data, null, 2);
		}
		
		/**
		 * Write collected data to savefile
		 * @param {file to save to} filename
		 */
		save_data(filename) {
			// Create a blob of the data
			let file_contents = new Blob([JSON.stringify(this.follower_data, null, 2)], {type: 'application/json'});
			// Save to file
			saveAs(file_contents, filename);
		}
	
		/**
		 * @return time passed since start of current instruction in milliseconds
		 */
		_time_passed() {
			return Date.now() - this.current_start_time;
		}
		
		/**
		 * Start tracking mouse coordinates as it is moved
		 */
		_start_mouse_track() {
			// log mouse position at time 0
			//let start_mousePos = document.get_mouse_pos();
			//this.current_mouse_movement = [{time: 0, start_mousePos.x, start_mousePos.y}];
			this.current_mouse_movement = [];
			// start tracking loop
			var self = this;
			this.track_id = setInterval(function() {
				let mousePos = document.get_mouse_pos();
				// save a single time-coordinate pair of the current mouse position
				self.current_mouse_movement.push({time: self._time_passed(),
												x: mousePos.x,
												y: mousePos.y});
				}, this.track_interval);
		}
		
		/**
		 * Stop mouse tracking and store tracking info for current piece
		 */
		_stop_mouse_track() {
			if (this.track_id) {
				this.track_id = clearInterval(this.track_id);
			}
			if (!this.shape) {
				console.log('Error: No shape selected in instruction manager at stop_mouse_track');
			} else {
				this.follower_data[this.task_name][this.shape]['movement'] = this.current_mouse_movement;
			}
		}
		
	};
})
