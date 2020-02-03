$(document).ready(function(){
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
})