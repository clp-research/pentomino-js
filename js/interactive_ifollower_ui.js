$(document).ready(function(){

	// placeholder, there is no implementation of this interface yet
	
	// parameters
	this.NUMBER_OF_SHAPES = 5
	this.UNIQUE_ONLY = false
	this.WITH_GRID = false

	// draw grid for placement of shapes
	this.init_grid();

	// draw board frames/headers
	this.init_board();

	// test
	var shapes = [{ 'shape_id': 1, type: 'F', color: 'red' , position: {"x": 160, "y": 80}},
	{ 'shape_id': 2, type: 'T', color: 'green' },
	{ 'shape_id': 3, type: 'F', color: 'yellow', mirror: true },
	{ 'shape_id': 4, type: 'I', color: 'blue' }]
	this.place_randomly({"shape_id":13,"type":"F",color:"red"})
})
