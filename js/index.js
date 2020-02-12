$(document).ready(function(){
	//--- Self Test for collision detection system
	console.log("-----Self Test-----")
	var block1 = this.pento_create_block(10, 20, 20, "blue")
	var block2 = this.pento_create_block(11, 21, 20, "red")
	var block3 = this.pento_create_block(0, 0, 20, "red")

	var collision = block1.hits(block2)
	var collision2 = block3.hits(block2)
	console.log("Block Collision Test: "+(collision2 == collision))

	var shape1 = this.pento_create_shape(0,10, 10,'I', 'blue', false, 0)
	var shape2 = this.pento_create_shape(1,30,91, 'I', 'red', false, 0)
	console.log("Shape Collision Test: "+ (shape1.hits(shape2) == shape2.hits(shape1)))

	//--- initiate generator

	//--- register handler
	function handleFileSelect (e) {
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
	
	function onFileLoaded (e) {
		var match = /^data:(.*);base64,(.*)$/.exec(e.target.result);
		if (match == null) {
			throw 'Could not parse result'; // should not happen
		}
		var mimeType = match[1];
		var content = atob(match[2]);
		var content_json = JSON.parse(content)

		alert(mimeType);
		alert(content_json);
	}

	$('#target_file').change(handleFileSelect);
	$('#initial_file').change(handleFileSelect);

	//--- export and import boards
	
    /**
     * Makes an image copy of the boards and triggers download
     */
    this.save_board_as_image = function () {
        this.pento_board_initial.saveBoard()
        this.pento_board_target.saveBoard()
	}
	
	this.export_as_json = function(board){
        var json_content = null
        var file_name = board+'_data.json';

        if (board == 'target'){
            json_content = this.pento_board_target.toJSON()
        }else{
            json_content = this.pento_board_target.toJSON()  
        }

        // Create a blob of the data
        var fileToSave = new Blob([JSON.stringify(json_content, null, 2)], {
            type: 'application/json',
            name: file_name
        });

        // Save the file
        saveAs(fileToSave, file_name);
    }

    this.import_json = function (board) {
		$("#"+board+"_file").click();
    }
})