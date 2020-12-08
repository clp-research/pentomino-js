$(document).ready(function() {
	// --- Boards ---
	var WITH_GRID				= false;
	var SELECTION_BOARD_NAME	= 'selection_board';
	var TASK_BOARD_NAME			= 'task_board';
	
	var FILES					= ['./resources/tasks_single_piece/2077_pento_task.json',
								   './resources/tasks_single_piece/2909_pento_task.json',
								   './resources/tasks_single_piece/3060_pento_task.json',
								   './resources/tasks_single_piece/5234_pento_task.json']
	// for testing
//	var FILES					= ['./resources/tasks_single_piece/2077_pento_task.json']
//	var FILES					= ['./resources/tasks_multiple_pieces/4271_pento_task.json']
	var current_file = 0; // increment as tasks are loaded
	
	
	let selboard_size_str = $(`#${SELECTION_BOARD_NAME}`).css('width');
	let selboard_size = Number(selboard_size_str.slice(0, selboard_size_str.length-2));
	this.selection_board = new document.PentoSelectionBoard(`#${SELECTION_BOARD_NAME}`, SELECTION_BOARD_NAME, WITH_GRID, new document.PentoConfig(board_size=selboard_size));
	// board which is automatically filled as pieces are selected
	let taskboard_size_str = $(`#${TASK_BOARD_NAME}`).css('width');
	let taskboard_size = Number(taskboard_size_str.slice(0, taskboard_size_str.length-2));
	this.task_board = new document.PentoSelectionBoard(`#${TASK_BOARD_NAME}`, TASK_BOARD_NAME, WITH_GRID, new document.PentoConfig(board_size=taskboard_size), read_only=true,);
	
	this.instruction_manager = new document.InstructionManager(this.selection_board, this.task_board);
	
	// Helper function to pause the study for a moment
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	// --- Mouse tracking at mouse move ---
	// Browsers seem to use variables layerX/layerY differently. For consistent
	// coordinates, pageX/pageY is now used, but this requires the total top/left
	// offset of the canvas from the page
	this.mouse_pos			= {x: -1, y: -1};
	var canvas_offset_top	= getTotalOffsetTop(this.selection_board.canvas);
	var	canvas_offset_left	= getTotalOffsetLeft(this.selection_board.canvas);
	
	/**
	 * Computes the offset of an object from the page top in pixels.
	 * @param {some object to check offset for} obj
	 * @return offset from page top in pixels
	 */
	function getTotalOffsetTop(obj) {
		if (!obj.offsetParent) { return obj.offsetTop; }
		// recursively add up current and parent's offset
		else { return obj.offsetTop + getTotalOffsetTop(obj.offsetParent); }
	}
	/**
	 * Computes the offset of an object from the left page side in pixels.
	 * @param {some object to check offset for} obj
	 * @return offset from left page edge in pixels
	 */
	function getTotalOffsetLeft(obj) {
		if (!obj.offsetParent) { return obj.offsetLeft; }
		// recursively add up current and parent's offset
		else { return obj.offsetLeft + getTotalOffsetLeft(obj.offsetParent); }
	}
	
	/**
	 * Updates the current mouse position.
	 * If the mouse is not on the selection board, the coordinates will be set to (-1, -1).
	 */
	function handle_mouse_move(event) {
		if (event.target.id == SELECTION_BOARD_NAME) {
			this.mouse_pos = { x: event.pageX - canvas_offset_left,
							   y: event.pageY - canvas_offset_top};
		} else { // -1 signifies the mouse is of the board
			this.mouse_pos = {x: -1, y: -1};
		}
	}
	/**
	 * @return current mouse coordinates
	 */
	this.get_mouse_pos = function() {
		return this.mouse_pos;
	};
	// Update the mouse position every time the mouse is moved
	this.onmousemove = handle_mouse_move;

	/**
	 * Read next file if unprocessed file is left. Parse contents as JSON, construct boards and start task.
	 * @return true if a file was processed, false if no file left
	 */
	function loadNewFile() {
		if (FILES.length > current_file) {
			// load new task
			$.ajax({url:FILES[current_file],
					dataType:'json',
					complete: function(data, msg) {
						let json = data.responseJSON;
						document.selection_board.fromJSON(json['initial']);
						document.task_board.fromJSON(json['task']);
						// enable selecting pieces on the board
						document.selection_board.pento_read_only = false;
						// make all pieces on task board invisible
						document.task_board.toggle_visibility(false);
						// register new task
						document.instruction_manager.new_task(FILES[current_file -1]);
						// give first instruction
						document.instruction_manager.generate_instruction();
						}
					});
			startTimer();
			// increment file counter
			current_file += 1;
			return true;
		}
		return false;
	}
	
	// --- Timer ---
	var timerId;
	/**
	 * Sets up a timer and starts an update loop
	 * Saves the id of timer loop in global timerId; use stopTimer(id) to stop the timer
	 */
	function startTimer() {
		var start_time = Date.now()
		var m; // minutes since start
		var s; // seconds since start
		// id is used to stop timer later
		document.timerId = setInterval(updateTimer, 500, start_time);
	}
	
	/**
	 * Stops the update loop for a timer
	 * @param {id returned by startTimer function} timerId
	 */
	function stopTimer() {
		clearInterval(document.timerId);
	}
	
	/**
	 * Updates the timer to depict the time passed since some start_time
	 * @param {point of time in milliseconds since 01/01/1970 00:00:00 UTC} start_time
	 */
	function updateTimer(start_time) {
		let time_passed = Date.now() - start_time;
		m = Math.floor(time_passed / 60000);
		s = Math.floor((time_passed % 60000) / 1000);
		$('#timer').html(`${_timeToString(m)}:${_timeToString(s)}`);
	}
	
	/**
	 * Converts number of hours/minutes/seconds to printable string
	 * @param {hours, minutes or seconds as int} time
	 * @return string with 0 added to numbers below 10
	 */
	function _timeToString(time){
		// add zero in front of numbers < 10
		if (time < 10) {
			return "0" + time.toString();
		}
		return time.toString();
	}
	
	// --- Correct counter ---
	
	/**
	 * Update the display of correct guesses
	 */
	this.updateCorrectCounter = function() {
		if (document.instruction_manager) {
			$('#correct_counter').html(`Correct: ${document.instruction_manager.correct_counter}`);
		}
	}
	
	// --- Progress bar ---
	/**
	 * Updates the displayed progress bar
	 * @param {Completion in percent (int)} completion
	 */
	function updateProgressBar(completion) {
		// update width
		$('#progress_bar').css('width', `${completion}%`);
		// update number
		$('#progress_bar').html(`${completion}%`);
	}
	
	// Buttons
	
	var selection_handler = {
		handle: function(event) {
			if (event.type == 'shape_selected')
				// task board will check whether correct shape was selected
				// and make correct pieces visible on the task board
				if (document.instruction_manager) {
					document.instruction_manager.complete_instruction(event.object_id);
					document.updateCorrectCounter();
					// Try to give new instruction, is task is already finished,
					// show questionnaire
					if (!document.instruction_manager.generate_instruction()) {
						// make selection_board read-only
						document.selection_board.pento_read_only = true;
						stopTimer();
						document.open_popup(questionnaire);
					}
				} else {
					// simply make the shape disappear
					document.task_board.handle_selection(event.object_id);
				}
		}
	};
	this.selection_board.register_event_handler(selection_handler);
	
	// --- Pop-ups ---
	var welcome			= document.getElementById('welcome');
	var audiotest		= document.getElementById('audiotest');
	var consent			= document.getElementById('consent');
	var questionnaire	= document.getElementById('questionnaire');
	var demographic		= document.getElementById('demographic');
	var endscreen		= document.getElementById('endscreen');
	
	// polyfill is used to help with browsers without native support for 'dialog'
	dialogPolyfill.registerDialog(welcome);
	dialogPolyfill.registerDialog(audiotest);
	dialogPolyfill.registerDialog(consent);
	dialogPolyfill.registerDialog(questionnaire);
	dialogPolyfill.registerDialog(demographic);
	dialogPolyfill.registerDialog(endscreen);
	
	// open popup element
	this.open_popup = function(popup) {
		popup.showModal();
		}
		
	// move on to audiotest
	$('#welcome_done').click(function() {
		welcome.close();
		document.open_popup(audiotest);
	});
	
	// move on to consent form
	$('#audiotest_done').click(function() {
		audiotest.close();
		document.open_popup(consent);
	});
	
	// consent given, start first task and timer
	$('#consent_done').click(function() {
		consent.close();
		var tasks_remaining = loadNewFile();
		if (!tasks_remaining) {
			alert('Error, no tasks could be loaded!');
			document.open_popup(endscreen);
		}
	});
	
	// submit task questionnaire, load new task or move to demographic questionnaire
	$('#questionnaire_done').click(async function() {
		// get and save the questionnary answer
		// This requires the questionnary to have some box checked, use default value!
		let conf_score = document.querySelector('input[name="confidence"]:checked').value;
		if (document.instruction_manager) {
			document.instruction_manager.add_info('confidence', conf_score, level='task');
		}
		questionnaire.close();
		
		updateProgressBar(Math.floor(100 * current_file / FILES.length));
		// small breather for the participant
		await sleep(1000);
		var tasks_remaining = loadNewFile();
		// finish the run
		if (!tasks_remaining) {
			updateProgressBar(100);
			document.open_popup(demographic);
		} else {
			//startTimer();
		}
	})
	
	// submit demographic questionnaire, save data and move on to endscreen
	$('#demographic_done').click(function() {
		if (document.instruction_manager) {
			document.instruction_manager.well_done();
			// get and save all given demographic info
			let age = document.querySelector('input[name="age"]').value;
			let played_pento_before = document.querySelector('input[name="played_pento_before"]:checked');
			document.instruction_manager.add_info('age', age, 'global');
			document.instruction_manager.add_info('played_pento_before', Boolean(played_pento_before));
			// save collected data to server-side resource/data_collection directory
			let data = document.instruction_manager.data_to_JSON();
			let file_saver_script = './php/save_userdata.php';
			fetch(file_saver_script, {
				method: 'POST',
				body: data,
			}).then((response) => {
				// if something went wrong, log to console
				let resp_code = response.status;
				if (resp_code < 200 || resp_code >= 300) {
					console.log(`Error: Something went wrong during saving of collected data. Response code: ${resp_code}`);
				}
			})
		}
		demographic.close();
		document.open_popup(endscreen);
	});

	// --- Start ---
	this.open_popup(welcome);
})
