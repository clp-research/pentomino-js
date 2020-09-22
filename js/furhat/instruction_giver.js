$(document).ready(function () {
	class InstructionGiver {
		constructor(initial_board, target_board) {
			this.board = initial_board
			this.target = target_board
		}
		
		// generate an instruction for the user to complete the puzzle
		// returns true if an instruction was given, false if not (i.e. the goal is reached)
		give_instr() {
			//TODO: what to do here?
			let new_instr = this._generate_instr();
			// no move to make left
			if (new_instr == null) {
				console.log("done");
				return false
				}
			console.log(new_instr.toString());
			return true;
		}
		
		// returns true if current board is equal to target board
		task_completed() {
			// check if any change is left to make
			return (this._generate_instr() == null)
		}
		
		// looks for shape which is not in target position and target rotation
		// returns shape and parameter to adjust ("x", "y", "rotate")
		_generate_instr() {
			for (var shape in this.board.pento_shapes) {
				// get corresponding shapes
				let current_shape = this.board.pento_shapes[shape];
				let target_shape = this.target.pento_shapes[shape];
				
				// check whether positions and rotations are equal
				let x_offset = target_shape.x-current_shape.x;
				if (x_offset != 0) {
					return new document.Instruction(current_shape.name, "move", {"x": x_offset})
					}
					
				let y_offset = target_shape.y-current_shape.y;
				if (y_offset != 0) {
					return new document.Instruction(current_shape.name, "move", {"y": y_offset})
					}
					
				let rotation_offset = target_shape.rotation-current_shape.rotation;
				if (rotation_offset != 0) {
					return new document.Instruction(current_shape.name, "rotate", {"angle": rotation_offset})
					}
			}
			return null
		}
	}
	
	document.InstructionGiver = InstructionGiver
})
