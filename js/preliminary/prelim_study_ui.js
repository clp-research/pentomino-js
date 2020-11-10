$(document).ready(function() {
	
	let WITH_GRID = false;
	
	this.selection_board = new document.PentoSelectionBoard('#selection_board', 'Selection',  WITH_GRID, new document.PentoConfig());
	// board which is automatically filled as pieces are selected
	this.task_board = new document.PentoSelectionBoard('#task_board', 'Task', WITH_GRID, new document.PentoConfig(board_size=300), read_only=true,);
	
	// --- Instruction giving ---
	this.instruction_manager = new document.InstructionManager(this.selection_board, this.task_board, 'user_data.json');
	
	
	// --- Mouse tracking ---
	this.mousePos = {x:-1, y:-1};
	function handle_mouse_move(event) {
		mousePos = {x: event.pageX,
					y: event.pageY};
		if (document.instruction_manager) {
			document.instruction_manager.track_mouse(mousePos);
		}
	}
	
	this.get_mouse_pos = function() {
		return this.mousePos;
	};
	
	this.onmousemove = handle_mouse_move;
	
	// File handling
	function handleFileSelect(e) {
		var files = e.target.files;
		if (files.length < 1) {
			alert('select a file...');
			return
		}
		var file = files[0];
		var reader = new FileReader();
		reader.onload = onFileLoaded;
		reader.readAsDataURL(file);
	}

	function onFileLoaded(e) {
		var match = /^data:(.*);base64,(.*)$/.exec(e.target.result);
		if (match == null) {
			throw 'Could not parse result'; // should not happen
		}
		var content = atob(match[2]);
		var json = JSON.parse(content);

		document.selection_board.fromJSON(json['initial']);
		document.task_board.fromJSON(json['task']);
		document.task_board.toggle_visibility(false);
		// hide the input field after initial setup
		//TODO: make this a dir / find a nicer solution
		$('#task_file').css('visibility', 'hidden');
		
		// -------- Start --------
		//document.instruction_manager.init_audio();
		document.instruction_manager.give_instruction();
	}

	$('#save_exit').click(function() {
		document.instruction_manager.save_data();
	});

	$('#task_file').change(handleFileSelect);
	
	var selection_handler = {
		handle: function(event) {
			if (event.type == 'shape_selected')
				// task board will check whether correct shape was selected
				// and make correct pieces visible on the task board
				if (document.instruction_manager) {
					document.instruction_manager.complete_instruction(event.object_id);
					// Test if task is completed:
					if (!document.instruction_manager.give_instruction()) {
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
