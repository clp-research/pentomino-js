$(document).ready(function(){

    var INSTRUCTION_LIMIT = 10;
    var instruction_id = 0;
    var instruction_counter = 1;

    var update_counter_display = function(){
        $(".counter").text(instruction_counter+"/"+INSTRUCTION_LIMIT)
    }

    update_counter_display()

    $('#add_instr').click(function () {
		if (instruction_counter < INSTRUCTION_LIMIT) {
            instruction_id += 1

            var input_widget = '<div class="input-container"><input id="input-'+instruction_id+'" class="instruction-input" type="text"></input>'
            input_widget += '<button class="remove-input input-'+instruction_id+'">X</button></div>';
            
            $("div.more-inputs").append(input_widget);
            
            $('button.input-'+instruction_id).click(function(event){
                var widget = event.target
                var classes = $(widget).attr('class').split(/\s+/)
                $('#'+classes[1]).parent().remove();
                instruction_counter -= 1
                update_counter_display()
            });

            instruction_counter += 1
            update_counter_display()
		}
    })
})