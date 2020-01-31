
$(document).ready(function () {

    // parameters
    // specific for generator
    NUMBER_OF_SHAPES = 5
    NUMBER_OF_CONNECTIONS = 0
    NUMBER_OF_ROTATIONS = 0
    MONOCOLOR = false
    MONOSHAPES = false
    SHAPES_FILTER = []

    // specific for pentomino
    this.pento_lock_on_grid = true
    this.pento_grid_rows = 10
    this.pento_grid_cols = 10
    this.pento_grid_x = 150
    this.pento_grid_y = 100
    this.pento_with_tray = false

    // load config
    this.pento_config = new document.PentoConfig()

    // draw board frames/headers
    var PentoBoard = this.PentoBoard
    this.pento_board_target = new PentoBoard("#initial", "Initial", false);
    this.pento_board_target.set("read_only", true)

    this.pento_board_initial = new PentoBoard("#target", "Target", false)
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

    // init stored data
    $("input#nshapes").val(localStorage.getItem("nshapes") || 1)
    //$("input#nchanges_rotations").val(localStorage.getItem("nchanges_rotations") || 0)
    $("input#nchanges").val(localStorage.getItem("nchanges") || 1)
    $("input#nrotations").val(localStorage.getItem("nrotations") || 0)
    $("input#nconnections").val(localStorage.getItem("nconnections") || 0)
    $("input#colors").prop("checked", localStorage.getItem("colors") == "true")
    $("input#shapes").prop("checked", localStorage.getItem("shape_difficulty") == "true")

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
        NUMBER_OF_SHAPES = parseInt($("input#nshapes").val());
        NUMBER_OF_ROTATIONS = parseInt($("input#nrotations").val());
        NUMBER_OF_CONNECTIONS = parseInt($("input#nconnections").val());
        MONOCOLOR = $("input#colors").is(":checked");
        MONOSHAPES = $("input#shapes").is(":checked");
        NUMBER_OF_CHANGES = parseInt($("input#nchanges").val());
        //NUMBER_OF_CHANGES_ROTATIONS = parseInt($("input#nchanges_rotations").val());

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
            val = Math.floor(Math.random() * max) - max / 2
        }
        return val
    }

    this.generate_params = function (action_type, shapes) {
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

    this.make_board_screenshot = function (index, canvas_id, action) {
        $('.snapshots').append('<canvas class="snapshot center" id="snapshot_' + index + '" width="300px" height="300px"></canvas>')

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
            var params = this.generate_params(random_action, shapes)
            this.pento_board_initial.isValidAction(random_action, random_shape, params)

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
                this.pento_board_initial.execute_action(random_action, random_shape, params)
                this.pento_board_initial.draw()
                pento_generator_actions[random_shape.name].push(random_action)

                var paramString = ""
                for (key in params) {
                    paramString += key + "=" + params[key] + ","
                }
                this.make_board_screenshot(i, '#target', random_action + " (" + paramString + "id=" + random_shape.name + ")")
            }else{
                i -= 1
            }
        }
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
            var pento_types = [pento_types[Math.floor(Math.random() * pento_types.length)]];
        }

        var rotations = [45, 90, 135, 180, 225, 270, 315];
        //var rotations = [...Array(360).keys()];

        var rotation_counter = 0
        var generated_shapes = []
        var r =0
        while (r < NUMBER_OF_SHAPES) {
            // generate random types
            var rand_type = pento_types[Math.floor(Math.random() * pento_types.length)];
            var rand_color = colors[Math.floor(Math.random() * colors.length)];

            // random position
            var rand_col = columns[Math.floor(Math.random() * columns.length)];
            var rand_row = rows[Math.floor(Math.random() * rows.length)];

            if (rotation_counter < NUMBER_OF_ROTATIONS) {
                var rand_rot = rotations[Math.floor(Math.random() * rotations.length)];
                rotation_counter += 1
            } else {
                rand_rot = 0
            }
            var do_mirror = Math.random() > 0.5;

            // create and place
            var new_shape = this.pento_create_shape(r, rand_type, rand_color, do_mirror, rand_rot)
            var coords = this.pento_board_target.grid_cell_to_coordinates(new_shape, rand_col, rand_row)
            new_shape.move(coords[0], coords[1])

            if (this.pento_board_target.is_valid(new_shape)){
                this.pento_board_target.place_shape(new_shape)
                generated_shapes.push(new_shape.make_copy(r + 100))
                r++;
                
            }else{
                this.pento_board_target.destroy_shape(new_shape)
            }
        }

        console.log(this.pento_board_target.pento_shapes)
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