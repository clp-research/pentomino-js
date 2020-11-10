$(document).ready(function () {

	this.InstructionManager = class InstructionManager {
		constructor(selection_board, task_board, savefile) {
			this.selection_board		= selection_board;
			this.task_board 			= task_board;
			this.savefile 				= savefile;
			// for each instruction, log mouse movement, time, selected piece
			this.follower_data 			= {};
			// for current instruction
			this.shape; // shape name
			this.current_start_time 	= Date.now();
			this.track 					= false;
			this.current_mouse_movement = [];
		}
		
//		init_audio() {
//			// insertAdjacentElement um audios hinzuzufügen
//			var audio_container = document.getElementById('audio_container');
//			console.log(this.task_board.get_shapes());
//			for (const s in this.task_board.get_shapes()) {
//				let audio_name = `./resources/audio/${s}.wav`;
//				let audio_element =
//				audio_container.insertAdjacentElement('beforeend', new Audio(audio_name));
//			}
//			//setAttribute um src hinzuzufügen, abhängig von shape names auf dem Task board
//		}
		
		give_instruction(audio=true) {
			// generate / speak/write instruction
			let next_shape = this.task_board.get_next_shape();
			if (!next_shape) {
				console.log("Done");
				return false;
			} else {
				this.shape = next_shape.name;
				this.current_start_time = Date.now();
				this._start_mouse_track();
				if (audio) {
					// get audio for instruction and play it
					console.log(this.shape);
				} else {
					console.log(this.shape);
				}
				return true;
			}
		}
		
		complete_instruction(selected_shape) {
			this.follower_data[this.shape] = {selected: selected_shape};
			this._stop_mouse_track(); // saves mouse movement
			// correct shape selected
			if (this.shape == selected_shape) {
				this.follower_data[this.shape]['correct'] = true;
			// incorrect shape selected, correct one is removed anyway
			} else {
				this.follower_data[this.shape]['correct'] = false;
				console.log('That was not the correct shape. Let me select the right one for you.')
				// remove shape from selection board
				this.selection_board.destroy_shape(this.shape);
				// handle the incorrectly selected shape
				this.task_board.handle_selection(selected_shape);
			}
			this.task_board.handle_selection(this.shape);
		}
		
		save_data() {
			// Create a blob of the data
			let file_contents = new Blob([JSON.stringify(this.follower_data, null, 2)], {type: 'application/json'});
			// Save to file
			saveAs(file_contents, this.savefile);
		}
		
		track_mouse(mousePos) {
			if (this.track) {
				this.current_mouse_movement.push({time: this._time_passed(),
												x: mousePos.x,
												y: mousePos.y});
			}
		}

		_time_passed() {
			return Date.now() - this.current_start_time;
		}
		
		_start_mouse_track() {
			// log mouse position at time 0
			//let start_mousePos = document.get_mouse_pos();
			//this.current_mouse_movement = [{time: 0, start_mousePos.x, start_mousePos.y}];
			this.current_mouse_movement = [];
			this.track_mouse(document.get_mouse_pos());
			this.track = true;
		}
		
		_stop_mouse_track(){
			this.track = false;
			if (!this.shape) {
				console.log('Error: No shape selected in instruction manager at stop_mouse_track');
			} else {
				this.follower_data[this.shape]['movement'] = this.current_mouse_movement;
			}
		}
		
	};
})
