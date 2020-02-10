
$(document).ready(function () {

    // parameters
    // specific for generator
    NUMBER_OF_SHAPES = 1
    NUMBER_OF_CONNECTIONS = 0
    NUMBER_OF_ROTATIONS = 0
    NUMBER_OF_FLIPS = 0
    MONOCOLOR = false
    MONOSHAPES = false
    SHAPES_FILTER = []

    // specific for pentomino
    this.pento_grid_rows = 19
    this.pento_grid_cols = 19
    this.pento_grid_col_min = 1
    this.pento_grid_row_min = 1

    // load config
    this.pento_config = new document.PentoConfig()

    // draw board frames/headers
    var PentoBoard = this.PentoBoard
    this.pento_board_target = new PentoBoard("#target", "Target", false, true);
    this.pento_board_target.set("read_only", true)

    this.pento_board_initial = new PentoBoard("#initial", "Initial", false, true);
    this.pento_board_initial.set("read_only", true)

    // init form
    var shapes = this.pento_config.get_pento_types()
    shapes.forEach(function (item, index) {
        var checked = localStorage.getItem("exclude_" + item)
        if (checked == "1") {
            checked = "checked=\"1\""
        } else {
            checked = ""
        }
        $('.shape-select').append(
            '<div class="one column"><label>' + item + '&nbsp;</label><input id="ntype" shape_type="' + item
            + '" class="shape-type-' + item + '" type="checkbox" ' + checked + '/><br></div>')
    })


    this.set_ui_value = function(id, default_value, is_check){
        if (is_check){
            $("input#"+id).prop("checked", localStorage.getItem(id) == default_value)
        }else{
            $("input#"+id).val(localStorage.getItem(id) || default_value)
        }
    }

    this.get_ui_value = function(id, is_bool){
        if (is_bool){
            return $("input#"+id).is(":checked");
        }else{
            return parseInt($("input#"+id).val());
        }
    }

    // init stored data
    var fields = [
            ("nshapes", 1),
            ("nrotations",0),
            ("nflips", 0),
            ("nchanges", 1),
            ("nconnections", 0),
            ("colors", "true", true),
            ("shapes", "true", true)
        ]
    
        for (var i=0; i<fields.length; i++){
            this.set_ui_value(fields[i][0], fields[i][1])
        }

    this.toggle_shape_select = function () {
        var shapes = this.pento_config.get_pento_types()
        shapes.forEach(function (item, index) {
            var shape_widget = $('input.shape-type-' + item)
            var toggle = shape_widget.is(":checked") ? false : true
            shape_widget.prop("checked", toggle);
        })
        this.calculate_actions()
    }

    this.calculate_actions = function () {
        // set global vars
        NUMBER_OF_FLIPS = this.get_ui_value("nflips")
        NUMBER_OF_SHAPES = parseInt($("input#nshapes").val());
        NUMBER_OF_ROTATIONS = parseInt($("input#nrotations").val());
        NUMBER_OF_CONNECTIONS = parseInt($("input#nconnections").val());
        MONOCOLOR = $("input#colors").is(":checked");
        MONOSHAPES = $("input#shapes").is(":checked");
        NUMBER_OF_CHANGES = parseInt($("input#nchanges").val());
        NUMBER_OF_CHANGES_ROTATIONS = parseInt($("input#nchanges_rotations").val());

        // store data
        //localStorage.setItem("nchanges_rotations", NUMBER_OF_CHANGES_ROTATIONS)
        localStorage.setItem("nchanges", NUMBER_OF_CHANGES)
        localStorage.setItem("nshapes", NUMBER_OF_SHAPES)
        localStorage.setItem("nrotations", NUMBER_OF_ROTATIONS)
        localStorage.setItem("nconnections", NUMBER_OF_CONNECTIONS)
        localStorage.setItem("colors", MONOCOLOR)
        localStorage.setItem("shape_difficulty", MONOSHAPES)

        var shapes = this.pento_config.get_pento_types()
        shapes.forEach(function (item, index) {
            var value = $('input.shape-type-' + item).is(":checked") ? "1" : "0"
            localStorage.setItem("exclude_" + item, value)
        })

        // update shape type filter
        $('input#ntype').each(function (index, item) {
            if (!$(item).is(":checked")) {
                SHAPES_FILTER.push($(item).attr("shape_type"))
            } else {
                SHAPES_FILTER = SHAPES_FILTER.filter((element) => element != $(item).attr("shape_type"))
            }
        })

        // update counters
        $(".complexity-actions").html(NUMBER_OF_SHAPES + NUMBER_OF_ROTATIONS + NUMBER_OF_CONNECTIONS)
    }

    this.random_in_range = function (min, max) {
        var val = min - 1
        while (val < min || val > max) {
            val = Math.floor(Math.random() * max)
        }
        return val
    }

    this.generate_params = function (rand_shape, action_type, shapes) {
        var max = 400
        var min = 0
        var rotations = [45, 90, 135, 180, 225, 270, 315];

        switch (action_type) {
            case 'move':
                var rand_x = this.random_in_range(min, max)
                var rand_y = this.random_in_range(min, max)
                return { "x": rand_x, "y": rand_y }
            case "rotate":
                var rand_angle = rotations[Math.floor(Math.random() * rotations.length)]
                return { 'rotation': rand_angle }
            case "connect":
                var random_other = shapes[Math.floor(Math.random() * shapes.length)]
                return { 'other_shape': random_other }
            default:
                console.log("Not implemented: " + action_type)
                return
        }
    }

    this.make_board_screenshot = function (index, canvas_id, action, do_prepend) {
        var element = '<canvas class="snapshot center" id="snapshot_' + index + '" width="300px" height="300px"></canvas>'
        if (do_prepend){
            $('.snapshots').prepend(element)
        }else{
            $('.snapshots').append(element)
        }
        

        //grab the context from your destination canvas
        var destCtx = $('#snapshot_' + index)[0].getContext('2d');

        //call its drawImage() function passing it the source canvas directly
        destCtx.drawImage($(canvas_id)[0], 0, 0, 300, 300);

        destCtx.font = "11px Arial";
        destCtx.fillText(action, 4, 300 - 4);
    }

    this.create_initial_state = function (shapes, nactions) {
        $('.snapshots').empty()
        pento_generator_actions = {}

        for (var shape_index in shapes) {
            var shape = shapes[shape_index]
            this.pento_board_initial.place_shape(shape)
        }

        var actions = this.pento_board_initial.get_actions()
        for (var i = 0; i < nactions; i++) {
            // select shape
            var shape_index = Math.floor(Math.random() * shapes.length)
            var random_shape = shapes[shape_index]

            var action_index = Math.floor(Math.random() * actions.length)
            var random_action = actions[action_index]
            var params = this.generate_params(random_shape, random_action, shapes)
            this.pento_board_initial.execute_action(random_action, random_shape, params)

            // check whether shape and action are valid
            if (this.pento_board_initial.isValidAction(random_action, random_shape, params)) {
                if (!pento_generator_actions.hasOwnProperty(random_shape.name)) {
                    // if no action was applied to this shape and the action is valid, execute it
                    pento_generator_actions[random_shape.name] = [random_action]

                } else if (pento_generator_actions[random_shape.name].length == 3 ||
                    pento_generator_actions[random_shape.name].indexOf(random_action) != -1) {
                    // if all possible actions where applied to this shape, select a new action and shape
                    i -= 1
                    continue
                }
                this.pento_board_initial.draw()
                pento_generator_actions[random_shape.name].push(random_action)

                var paramString = ""
                for (key in params) {
                    paramString += key + "=" + params[key] + ","
                }
                this.make_board_screenshot(i, '#initial', random_action + " (" + paramString + "id=" + random_shape.name + ")", true)
            } else {
                random_shape.rollback(1)
                i -= 1
            }
        }

        // target final
        this.make_board_screenshot(i+2, '#target', "END", false)
    }

    this.generate = function () {

        // remove all previously generated shapes
        this.pento_board_target.destroy_all_shapes()
        this.pento_board_initial.destroy_all_shapes()

        // set value ranges for random selection
        var columns = [...Array(this.pento_grid_cols).keys()];
        var rows = [...Array(this.pento_grid_rows).keys()];

        if (!MONOCOLOR) {
            var colors = this.pento_config.get_pento_colors();
        } else {
            var colors = ['lightblue']
        }

        pento_types = this.pento_config.get_pento_types()
        var pento_types = pento_types.filter((shape_type) => SHAPES_FILTER.indexOf(shape_type) == -1)

        if (MONOSHAPES) {
            var pento_types = ['point']
            //var pento_types = [pento_types[Math.floor(Math.random() * pento_types.length)]];
        }

        if (pento_types.length == 0)
            return;

        var rotations = [45, 90, 135, 180, 225, 270, 315];
        //var rotations = [0]
        //var rotations = [...Array(360).keys()];

        var rotation_counter = 0
        var generated_shapes = []
        var r = 0
        while (r < NUMBER_OF_SHAPES) {

            // generate random types
            var rand_type = pento_types[Math.floor(Math.random() * pento_types.length)];
            var rand_color = colors[Math.floor(Math.random() * colors.length)];

            // random position
            var rand_col = Math.max(columns[Math.floor(Math.random() * columns.length)], this.pento_grid_col_min);
            var rand_row = Math.max(rows[Math.floor(Math.random() * rows.length)], this.pento_grid_row_min);

            if (rotation_counter < NUMBER_OF_ROTATIONS) {
                var rand_rot = rotations[Math.floor(Math.random() * rotations.length)];
                rotation_counter += 1
            } else {
                rand_rot = 0
            }
            var do_mirror = false

            // create and place
            var coords = this.pento_board_target.grid_cell_to_coordinates(rand_col, rand_row)
            var new_shape = this.pento_create_shape(r, coords[0], coords[1], rand_type, rand_color, do_mirror, rand_rot)

            if (this.pento_board_target.isValidAction("place", new_shape, {})) {
                this.pento_board_target.place_shape(new_shape)
                generated_shapes.push(new_shape.copy(r+1))
                r++;

            } else {
                this.pento_board_target.destroy_shape(new_shape)
            }
        }
        this.pento_board_target.draw()

        this.create_initial_state(generated_shapes, NUMBER_OF_CHANGES)
        this.pento_board_initial.draw()
    }

    this.save = function () {
        this.pento_board_initial.saveBoard()
        this.pento_board_target.saveBoard()
    }

    $("input").change(function () {
        document.calculate_actions()
    });

    this.calculate_actions()
    this.generate()
})