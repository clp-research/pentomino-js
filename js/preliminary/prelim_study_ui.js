$(document).ready(function() {
	// --- Boards ---
	var WITH_GRID				= false;
	var SELECTION_BOARD_NAME	= 'selection_board';
	var TASK_BOARD_NAME			= 'task_board';
	
	this.selection_board = new document.PentoSelectionBoard(`#${SELECTION_BOARD_NAME}`, SELECTION_BOARD_NAME, WITH_GRID, new document.PentoConfig());
	// board which is automatically filled as pieces are selected
	this.task_board = new document.PentoSelectionBoard(`#${TASK_BOARD_NAME}`, TASK_BOARD_NAME, WITH_GRID, new document.PentoConfig(board_size=300), read_only=true,);
	
	// --- Tasks / Instruction giving ---
	this.instruction_manager = new document.InstructionManager(this.selection_board, this.task_board);
	
	/**
	 * Changes the display to a mostly static interface and emits a success message
	 */
	function finishRun() {
		stopTimer(timerId);
		$('#next').css('visibility', 'hidden');
		updateProgressBar(100);
		document.instruction_manager.well_done();
	}
	
	// --- Mouse tracking at mouse move ---
	this.mouse_pos			= {x: -1, y: -1};
	var canvas_offset_top	= this.selection_board.canvas.offsetTop;
	var	canvas_offset_left	= this.selection_board.canvas.offsetLeft;
	/**
	 * Updates the current mouse position.
	 * If the mouse is not on the selection board, the coordinates will be set to (-1, -1).
	 */
	function handle_mouse_move(event) {
		if (event.target.id == SELECTION_BOARD_NAME) {
			this.mouse_pos = this.mouse_pos = { x: event.layerX - canvas_offset_left,
												y: event.layerY - canvas_offset_top};
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
	
	// --- File handling ---
	var files = [];
	var current_file = 0;
	
	/**
	 * Handle file selection. Selected filenames are stored in array 'files'.
	 */
	function handleFileSelect(e) {
		files = e.target.files;
		if (files.length < 1) {
			alert('select a file...');
		}
	}
	
	/**
	 * Read next file if unprocessed file is left.
	 * @return true if a file was processed, false if no file left
	 */
	function loadNewFile() {
		if (files.length > current_file) {
			// load new task
			var reader = new FileReader();
			reader.onload = onFileLoaded;
			reader.readAsDataURL(files[current_file]);
			// increment file counter
			current_file += 1;
			return true;
		}
		return false;
	}

	/**
	 * When file was loaded, parse contents as JSON, construct boards and start task.
	 * @param {loaded file} e
	 */
	function onFileLoaded(e) {
		var match = /^data:(.*);base64,(.*)$/.exec(e.target.result);
		if (match == null) {
			throw 'Could not parse result'; // should not happen
		}
		var content = atob(match[2]);
		var json = JSON.parse(content);
		
		// Set up the boards. This has to happen after the boards are loaded
		document.selection_board.fromJSON(json['initial']);
		document.task_board.fromJSON(json['task']);
		// enable selecting pieces on the board
		document.selection_board.pento_read_only = false;
		// make all pieces on task board invisible
		document.task_board.toggle_visibility(false);
		// register new task
		document.instruction_manager.new_task(files[current_file -1].name);
		// give first instruction
		document.instruction_manager.generate_instruction();
	}
	
	// --- Timer ---
	var timerId;
	/**
	 * Sets up a timer and starts an update loop
	 * @return id of timer loop, use stopTimer(id) to stop the timer
	 */
	function startTimer() {
		var start_time = Date.now()
		var m; // minutes since start
		var s; // seconds since start
		// id is used to stop timer later
		return setInterval(updateTimer, 500, start_time);
	}
	
	/**
	 * Stops the update loop for a timer
	 * @param {id returned by startTimer function} timerId
	 */
	function stopTimer(timerId) {
		clearInterval(timerId);
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
	
	// --- Input / Button events ---
	
	// files were selected
	$('#task_file').change(handleFileSelect);
	
	// start the first task
	$('#start').click(function() {
		// hide the input field after initial setup
		$('#task_file').css('visibility', 'hidden');
		// hide this button
		$('#start').css('visibility', 'hidden');
		
		// id is used to stop the timer later
		timerId = startTimer();
		
		var tasks_remaining = loadNewFile();
		if (!tasks_remaining) {
			finishRun();
		} else {
			// show 'next' button instead
			$('#next').css('visibility', 'visible');
		}
	});
	
	$('#next').click(function() {
		updateProgressBar(Math.floor(100 * current_file / files.length));
		var tasks_remaining = loadNewFile();
		if (!tasks_remaining) {
			finishRun();
		}
	})
	
	// save the collected data
	$('#save_exit').click(function() {
		document.instruction_manager.save_data();
	});
	
	var selection_handler = {
		handle: function(event) {
			if (event.type == 'shape_selected')
				// task board will check whether correct shape was selected
				// and make correct pieces visible on the task board
				if (document.instruction_manager) {
					document.instruction_manager.complete_instruction(event.object_id);
					// Test if task is completed, if not giv new instruction
					if (!document.instruction_manager.generate_instruction()) {
						// make selection_board read-only
						document.selection_board.pento_read_only = true;
					}
				} else {
					// simply make the shape disappear
					document.task_board.handle_selection(event.object_id);
				}
		}
	};
	this.selection_board.register_event_handler(selection_handler);
})
