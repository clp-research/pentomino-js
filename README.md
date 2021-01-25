# PentominoJS Interfaces and Templates for Crowdsourcing

A pentomino framework built with jQuery, jCanvas and HTML5 canvas.

## User Interfaces

There are two interfaces provided in this repository: 

### task_creator_steps.html

In this interface, you can randomly generate and place a number of pentomino pieces on a board. 
An initial and target board will be created that differ by some pentomino actions (moving or rotating pieces). 
Additionally, the interface displays snapshots, showing the transition from initial to target board step by step.
For generation, there are the options *monocolor* and *monoshape*, a grid can be shown in the  background and the piece 
shapes can be selected to be excluded individually.
By switching off *read-only*, the pieces can be moved and rotated manually.

NOTE: The option *number of connections* is not implemented, *number of rotations* and *number of flips* are not fully implemented and can cause unwanted behaviour.

### task_creator_study1.html

This interface allows to generate a random pentomino constellation, which is first applied to an initial and a target board. 
Both boards can be modified by moving, rotating and removing (by right-clicking) pieces. In addition to the options provided in 
```task_creator_steps.html```, *all selected types once* allows to generate exactly one piece of each 
shape that is currently selected. 

---

Furthermore, two interface templates are provided:

### interactive_ifollower_ui.html

Prototype interactive UI for actions in the pentomino domain.

### simple_igiver_ui.html

Prototype for the data collection in mechnical turk.

## Events 

The system fires different events that can be used for oberserving and modeling human behaviour.
Each event is composed through an event type, name of the object, position of the object and modified properties of the object.

### Event names

#### shape_moved

```json
{
    "type": "shape_moved",
    "object": "T3red",
    "changes":{
        "dx": 50,
        "dy": 25
    }
}
```

#### shape_rotated

```json
{
    "type": "shape_rotated",
    "object": "T2yellow",
    "changes":{
        "rotation": 180
    }
}
```

#### shape_collision

dx,dy - is the overlap on collision

startx, starty - is the position of the shape
beforehand

```json
{
    "type": "shape_collision",
    "object": "T3red",
    "changes":{
        "dx": 10,
        "dy": 20,
        "collided_shapes": [
            "T2blue"
        ],
        "startx": 0,
        "starty": 10
    }
}
```

#### shape_placed

```json
{
    "type": "shape_placed",
    "object": "T3red",
    "changes":{
        "x": 180,
        "y": 120
    }
}
```

#### shape_connected

```json
{
    "type": "shape_connected",
    "object": "T3red",
    "changes":{
        "other_shape": "I1green",
        "group_id": "group2"
    }
}
```
