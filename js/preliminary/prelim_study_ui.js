//TODO:
// - find out how to play spoken instructions
// - task json format
//	-> verbal confirmation
//	-> load new selection?
// - collect data / save in csv

$(document).ready(function() {
	
	let WITH_GRID = false;
	
	this.selection_board = new document.PentoSelectionBoard('#selection_board', 'Selection',  WITH_GRID, new document.PentoConfig());
	// board which is automatically filled as pieces are selected
	this.task_board = new document.PentoSelectionBoard('#task_board', 'Task', WITH_GRID, new document.PentoConfig(board_size=300), read_only=true,);

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
		document.task_board.fromJSON(json['target']);
		document.task_board.toggle_visibility(false);
		// hide the input field after initial setup
		//TODO: make this a dir / find a nicer solution
		$('#task_file').css('visibility', 'hidden');
	}

	//TODO:
	$('#save_exit').click(function() {
		console.log("Save and Exit");
	});

	$('#task_file').change(handleFileSelect);
	
	var selection_handler = {
		handle: function(event) {
			if (event.type == 'shape_selected')
				//TODO: Check here whether correct shape was selected
				// if a shape is correctly selected, show it on the task board
				document.task_board.toggle_visibility(true, event.object_id);
		}
	};
	this.selection_board.register_event_handler(selection_handler);
})
