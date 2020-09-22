//TODO:
// import target and initial board
// function to compute instruction & make furhat give instruction
// !!!place function, at user move?
// make Furhat look at pieces
// insert actual furhat speech

// fix glitch after generation??
// fix import

$(document).ready(function(){

	// parameters
	this.TASK = null; // file containing initial and target board in json format
	this.WITH_GRID = true;
	
	// create a generator
	var config_params = {
		"nshapes": 3,
		"nrotations": 0,
		"nflips": 0,
		"nchanges": 3,
		"nconnections": 0,
		"colors": false,
		"shapes": false,
		"readonly": false,
		"showgrid": true,
		"_shapes_filter": [] // use all shape types
		};
	
	// create a configuration
	this.config = new document.PentoConfig();
	// pass empty array as first param (form_fields) since we're using fixed
	// settings here
	// generator uses id '#initial' for the initial board (which shows up on the screen)
	var generator = new document.PentoGenerator([], config_params, this.config);
	
	this.select_generate = function() {
		generator.generate();
	}
	
	this.select_import = function() {
		$("#target_file").click();
	}
	
	//--- File handling
	function handleFileSelect(e) {
		var files = e.target.files;
		if (files.length < 1) {
			alert('select a file...');
			return;
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

		generator.pento_board_initial.fromJSON(json["initial"]);
		generator.pento_board_target.fromJSON(json["target"]);
	}

	$('#target_file').change(handleFileSelect);
	
	
	// create instruction giver instance (which communicates with furhat)
	var instr_giver = new document.InstructionGiver(generator.pento_board_initial, generator.pento_board_target);
	
	// handle user moving a piece (fired on dragstop)
	var move_handler = {
		handle: function(event) {
			if (event.type == "shape_moved") {
				instr_giver.give_instr();
			}
		}
	};
	// handle user rotating a piece
	var rotation_handler = {
		handle: function(event) {
			if (event.type == "shape_rotated") {
				instr_giver.give_instr();
			}
		}
	};
	
	generator.pento_board_initial.register_event_handler(move_handler);
	generator.pento_board_initial.register_event_handler(rotation_handler);
	
	
})
