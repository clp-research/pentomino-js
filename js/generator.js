$(document).ready(function(){

    // parameters
    // specific for generator
    NUMBER_OF_SHAPES = 5
    UNIQUE_ONLY = false
    WITH_GRID = false

    // specific for pentomino
    this.pento_read_only = true
    this.pento_lock_on_grid = true
    this.pento_grid_rows = 10
    this.pento_grid_cols = 10
    this.pento_grid_x = 150
    this.pento_grid_y = 100
    this.pento_with_tray = true

    // draw board frames/headers
	this.init_board();

	// draw grid for placement of shapes
	this.init_grid();

    // add utility functions
    this.saveBoard = function(){
        this.pento_canvas_ref[0].toBlob(function(data){
            saveAs(data, 'pento_board_generated.png')
        })
    }

    this.toggleTray = function(){
        this.pento_with_tray = !this.pento_with_tray
        this.init_board()
    }

    this.generate = function(){
        // remove all previously generated shapes
        this.destroy_all_shapes();

        // set value ranges for random selection
        var columns = [...Array(this.pento_grid_cols).keys()];
        var rows = [...Array(this.pento_grid_rows).keys()];
        var colors = this.get_pento_colors();
        //["red","blue","green","brown","gray"]
        var pento_types = this.get_pento_types()
        var rotations = [0, 90, 180, 270]

        for(var r=0; r < NUMBER_OF_SHAPES;){
            // generate random types
            var rand_type = pento_types[Math.floor(Math.random() * pento_types.length)];
            var rand_color = colors[Math.floor(Math.random() * colors.length)];

            // random position
            var rand_col = columns[Math.floor(Math.random() * columns.length)];
            var rand_row = rows[Math.floor(Math.random() * rows.length)];
            var rand_rot = rotations[Math.floor(Math.random() * rotations.length)];
            var do_mirror = Math.random()> 0.5;

            // create and place
            var new_shape = this.create_pento_shape(r, rand_type, rand_color, do_mirror)
            new_shape.move_on_grid(rand_col, rand_row)
            new_shape.rotate(rand_rot)
            this.place_shape(new_shape)

            if (this.check_collisions_of_shape(new_shape)){
                this.destroy_shape(new_shape.name)
            }else{
                r++;
            }
        }
        
        for(var r=0; r < NUMBER_OF_SHAPES;){
            // generate random types
            var rand_type = pento_types[Math.floor(Math.random() * pento_types.length)];
            var rand_color = colors[Math.floor(Math.random() * colors.length)];

            // random position
            var rand_rot = rotations[Math.floor(Math.random() * rotations.length)];
            var do_mirror = Math.random()> 0.5;

            // create and place
            var new_shape = this.create_pento_shape(r, rand_type, rand_color, do_mirror)
            this.place_randomly(new_shape)

            if (this.check_collisions_of_shape(new_shape)){
                this.destroy_shape(new_shape.name)
            }else{
                r++;
            }
            
        }
        this.pento_canvas_ref.drawLayers()
    }
})