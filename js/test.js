$(document).ready(function(){
	var block1 = this.pento_create_block(10, 20, 20, "blue")
	var block2 = this.pento_create_block(11, 21, 20, "red")
	var block3 = this.pento_create_block(0, 0, 20, "red")
	
	var collision = block1.hits(block2)
	console.log("Collision: "+collision)

	var collision2 = block3.hits(block2)
	console.log("Collision2: "+collision2)
})