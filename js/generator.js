
$(document).ready(function(){

    // parameters
    // specific for generator
    NUMBER_OF_SHAPES = 5
    NUMBER_OF_CONNECTIONS = 0
    NUMBER_OF_ROTATIONS = 0
    UNIQUE_COLORS = false
    UNIQUE_SHAPES = false
    SHAPES_FILTER = []

    // specific for pentomino
    this.pento_read_only = true
    this.pento_lock_on_grid = true
    this.pento_grid_rows = 10
    this.pento_grid_cols = 10
    this.pento_grid_x = 150
    this.pento_grid_y = 100
    this.pento_with_tray = false

    // load config
    this.pento_config = new document.PentoConfig_class()

    // draw board frames/headers
    var PentoBoard = this.PentoBoard_class
    this.pento_board_target = new PentoBoard("#initial", "Initial", false);
    this.pento_board_initial = new PentoBoard("#target", "Target", false)
    
    // init form
    var shapes = this.pento_config.get_pento_types()
    shapes.forEach(function(item, index){
        $('.shape-select').append(
            '<label>'+item+'&nbsp;</label><input id="ntype" shape_type="'+item+'" type="checkbox" checked="1"/><br>')
    })

    // init stored data
    $("input#nshapes").val(localStorage.getItem("nshapes"))
    $("input#nrotations").val(localStorage.getItem("nrotations"))
    $("input#nconnections").val(localStorage.getItem("nconnections"))
    $("input#colors").prop("checked", parseInt(localStorage.getItem("colors")) == 1)
    $("input#shapes").prop("checked", parseInt(localStorage.getItem("shape_difficulty")) == 1)

    var calculate_actions = function(){
        var connections = parseInt($("input#nconnections").val());
        var rotations = parseInt($("input#nrotations").val());
        var shapecount = parseInt($("input#nshapes").val());

        var colors = $("input#colors").is( ":checked" ) ? 0 : 1;
        var shape_difficulty = $("input#shapes").is( ":checked" ) ? 1 :0;

        // set global vars
        NUMBER_OF_SHAPES = shapecount
        NUMBER_OF_ROTATIONS = rotations
        NUMBER_OF_CONNECTIONS = connections
        UNIQUE_COLORS = colors == 1
        UNIQUE_SHAPES = shape_difficulty == 1

        // store data
        localStorage.setItem("nshapes",NUMBER_OF_SHAPES)
        localStorage.setItem("nrotations", NUMBER_OF_ROTATIONS)
        localStorage.setItem("nconnections", NUMBER_OF_CONNECTIONS)
        localStorage.setItem("colors", colors)
        localStorage.setItem("shape_difficulty", shape_difficulty)

        var type_count = 0
        $('input#ntype').each(function(index, item){
            check = $(item).is( ":checked" ) ? 1 :0
            if (check == 0){
                SHAPES_FILTER.push($(item).attr("shape_type"))
            }else{
                SHAPES_FILTER = SHAPES_FILTER.filter((element) => element != $(item).attr("shape_type"))
            }
            type_count += check;
        })
        var type_difficulty = Math.round(Math.min(shapecount, type_count)/4)

        $(".complexity-actions").html(shapecount + rotations + connections)
        $(".complexity-level").html(colors + type_difficulty + shape_difficulty)
    }

    calculate_actions()

    // add utility functions
    this.saveBoard = function(){
        this.pento_canvas_ref[0].toBlob(function(data){
            saveAs(data, 'pento_board_generated.png')
        })
    }

    this.generate = function(){
        // remove all previously generated shapes
        this.pento_board_initial.destroy_all_shapes()
        this.pento_board_target.destroy_all_shapes()

        // set value ranges for random selection
        var columns = [...Array(this.pento_grid_cols).keys()];
        var rows = [...Array(this.pento_grid_rows).keys()];

        if (UNIQUE_COLORS){
            var colors = this.pento_config.get_pento_colors();
        }else{
            var colors = ['lightblue']
        }
        var colors = this.pento_config.get_pento_colors();

        if (UNIQUE_SHAPES){
            var pento_types = this.pento_config.get_pento_types()
        }else{
            var pento_types = this.pento_config.get_pento_types()
            var pento_types = [pento_types[Math.floor(Math.random() * pento_types.length)]];
        }
        
        var pento_types = this.pento_config.get_pento_types()
        //var pento_types = pento_types.filter((shape_type) => !SHAPES_FILTER.includes(shape_type))
        var rotations = [...Array(360).keys()];

        var rotation_counter = 0
        for(var r=0; r < NUMBER_OF_SHAPES;){
            // generate random types
            var rand_type = pento_types[Math.floor(Math.random() * pento_types.length)];
            var rand_color = colors[Math.floor(Math.random() * colors.length)];

            // random position
            var rand_col = columns[Math.floor(Math.random() * columns.length)];
            var rand_row = rows[Math.floor(Math.random() * rows.length)];

            if (rotation_counter<NUMBER_OF_ROTATIONS){
                var rand_rot = rotations[Math.floor(Math.random() * rotations.length)];
                rotation_counter += 1
            }else{
                rand_rot = 0
            }
            var do_mirror = Math.random()> 0.5;

            // create and place
            var new_shape = this.pento_board_target.create_pento_shape(r, rand_type, rand_color, do_mirror)
            new_shape.move_on_grid(rand_col, rand_row)
            new_shape.rotate(rand_rot)
            this.pento_board_target.place_shape(new_shape)

            if (this.pento_board_target.check_collisions_of_shape(new_shape)){
                this.pento_board_target.destroy_shape(new_shape.name)
            }else{
                r++;
            }
        }
        this.pento_board_target.pento_canvas_ref.drawLayers()

        for(var r=0; r < NUMBER_OF_SHAPES;){
            // generate random types
            var rand_type = pento_types[Math.floor(Math.random() * pento_types.length)];
            var rand_color = colors[Math.floor(Math.random() * colors.length)];

            // random position
            var rand_rot = rotations[Math.floor(Math.random() * rotations.length)];
            var do_mirror = Math.random()> 0.5;

            var rand_col = columns[Math.floor(Math.random() * columns.length)];
            var rand_row = rows[Math.floor(Math.random() * rows.length)];

            // create and place
            var new_shape = this.pento_board_initial.create_pento_shape(r, rand_type, rand_color, do_mirror)
            new_shape.move_on_grid(rand_col, rand_row)
            this.pento_board_initial.place_shape(new_shape)

            if (this.pento_board_initial.check_collisions_of_shape(new_shape)){
                this.pento_board_initial.destroy_shape(new_shape.name)
            }else{
                r++;
            }
            
        }
        this.pento_board_initial.pento_canvas_ref.drawLayers()
    }

    
    $("input").change(function(){
        calculate_actions()
    });
})