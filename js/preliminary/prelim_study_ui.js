//TODO:
// - find out how to play spoken instructions
// - onload
//	-> verbal confirmation
//  -> build elephant
//	-> load new selection?
// - collect data / save in csv

$(document).ready(function() {
	
	// global configuration
	this.config = new document.PentoConfig();
	// global board for piece selection
	let WITH_GRID = false;
	this.selection_board = new document.PentoSelectionBoard('#selection_board', 'Selection',  WITH_GRID);

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
		// hide the input field
		//TODO: make this a dir / find a nicer solution
		$('#task_file').css('visibility', 'hidden');
	}

	//TODO:
	$('#save_exit').click(function() {
		console.log("Save and Exit");
	});

	$('#task_file').change(handleFileSelect);
})
