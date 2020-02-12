
"use strict";

$(document).ready(function () {

    // fields the user can edit
    // insert new fields by tuple [id_of_html_element_without, default_value, is_bool?]
    var form_fields = [
        ["nshapes", 1],
        ["nrotations",0],
        ["nflips", 0],
        ["nchanges", 1],
        ["nconnections", 0],
        ["colors", false, true],
        ["shapes", false, true],
        ["readonly", false, true],
        ["showgrid", true, true]
    ]

    // parameters
    // specific for generator
    var config = {}
    config["_shapes_filter"] = []  
    for(var i=0; i < form_fields.length; i++){
        var value = localStorage.getItem(form_fields[i])
        config[form_fields[i][0]] = value === null ? form_fields[i][1]: value
    }

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
    this.pento_board_target.set("read_only", config["readonly"])

    this.pento_board_initial = new PentoBoard("#initial", "Initial", false, true);
    this.pento_board_initial.set("read_only", config["readonly"])

    /**
     * Initiates form
     */
    this.init_form = function(pento_config){

        var shapes = pento_config.get_pento_types()
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
    
        for (var i=0; i<form_fields.length; i++){
            this.set_ui_value(form_fields[i][0], form_fields[i][1], form_fields[i].length>2 ? form_fields[i][2]: null)
        }

    }

    /**
     * Set value of UI Widget
     */
    this.set_ui_value = function(id, default_value, is_check){
        if (is_check === true){
            $("input#"+id).prop("checked", localStorage.getItem(id) === "true")
        }else{
            $("input#"+id).val(localStorage.getItem(id) == null ? default_value: localStorage.getItem(id))
        }
    }

    /**
     * Retrieve current value of UI Widget
     */
    this.get_ui_value = function(id, is_bool){
        if (is_bool){
            return $("input#"+id).is(":checked");
        }else{
            return parseInt($("input#"+id).val());
        }
    }

    /**
     * Toggles selection of all shapes
     */
    this.toggle_shape_select = function () {
        var shapes = this.pento_config.get_pento_types()
        shapes.forEach(function (item, index) {
            var shape_widget = $('input.shape-type-' + item)
            var toggle = shape_widget.is(":checked") ? false : true
            shape_widget.prop("checked", toggle);
        })
        this.calculate_actions()
    }

    /**
     * Saves valuesd of input widgets in local storage
     */
    this.store_inputs = function(){
        for(var key in config){
            localStorage.setItem(key, config[key])
        }
    }

    /**
     * Updates internal states and configurations
     * based on User input
     */
    this.update = function () {
        for(var key in config){
            if (!key.startsWith("_")){
                var is_bool = key == "colors"|| key == "readonly" || key == "shapes"
                config[key] = this.get_ui_value(key,is_bool)
            }   
        }

        // store data
        this.store_inputs()
        var shapes = this.pento_config.get_pento_types()
        shapes.forEach(function (item, index) {
            var value = $('input.shape-type-' + item).is(":checked") ? "1" : "0"
            localStorage.setItem("exclude_" + item, value)
        })

        // update shape type filter
        $('input#ntype').each(function (index, item) {
            if (!$(item).is(":checked")) {
                config["_shapes_filter"].push($(item).attr("shape_type"))
            } else {
                config["_shapes_filter"] = config["_shapes_filter"].filter((element) => element != $(item).attr("shape_type"))
            }
        })

        // update boards
        this.pento_board_target.set("read_only", config["readonly"])

        // update counters
        $(".complexity-actions").html(config["nchanges"])
    }

    /**
     * Retrieve random number rn with rn >= min and rn <= max
     */
    this.random_in_range = function (min, max) {
        return Math.floor(Math.random() * (max-min)) + min
    }

    /**
     * Generates random params
     */
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
        var pento_generator_actions = {}

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
                for (var key in params) {
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

    /**
     * Generates target and initial state
     */
    this.generate = function () {

        // remove all previously generated shapes
        this.pento_board_target.destroy_all_shapes()
        this.pento_board_initial.destroy_all_shapes()

        // set value ranges for random selection
        var columns = [...Array(this.pento_grid_cols).keys()];
        var rows = [...Array(this.pento_grid_rows).keys()];

        if (!config["colors"]) {
            var colors = this.pento_config.get_pento_colors();
        } else {
            var colors = ['lightblue']
        }

        pento_types = this.pento_config.get_pento_types()
        var pento_types = pento_types.filter((shape_type) => config["_shapes_filter"].indexOf(shape_type) == -1)

        if (config["shapes"]) {
            var pento_types = [pento_types[Math.floor(Math.random() * pento_types.length)]];
        }

        if (pento_types.length == 0)
            return;

        var rotations = [45, 90, 135, 180, 225, 270, 315];
        //var rotations = [...Array(360).keys()];

        var rotation_counter = 0
        var flip_counter = 0
        var generated_shapes = []
        var r = 0
        while (r < config["nshapes"]) {

            // generate random types
            var rand_type = pento_types[Math.floor(Math.random() * pento_types.length)];
            var rand_color = colors[Math.floor(Math.random() * colors.length)];

            // random position
            var rand_col = Math.max(columns[Math.floor(Math.random() * columns.length)], this.pento_grid_col_min);
            var rand_row = Math.max(rows[Math.floor(Math.random() * rows.length)], this.pento_grid_row_min);

            if (rotation_counter < config["nrotations"]) {
                var rand_rot = rotations[Math.floor(Math.random() * rotations.length)];
                rotation_counter += 1
            } else {
                rand_rot = 0
            }

            if (flip_counter < config["nflips"]){
                var do_mirror = true
                flip_counter += 1
            }else{
                var do_mirror = false
            }
            

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

        this.create_initial_state(generated_shapes, config["nchanges"])
        this.pento_board_initial.draw()
    }

    // Initiation
    this.init_form(this.pento_config)
    this.update()
    this.generate()

    var self = this
    $("input").change(function () {
        self.update()
    });

    $('#target').mouseleave(function(){
        self.pento_board_target.clear_selections()
    })

    $('#initial').mouseleave(function(){
        self.pento_board_initial.clear_selections()
    })
})