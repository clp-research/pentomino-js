# PentominoJS Templates for Crowdsourcing

A pentomino framework built with jQuery, jCanvas and HTML5 canvas.

## User Interfaces

There are three interfaces provided in this repository: 

### shape_group_generator.html

This UI is made to generate and edit groups of shapes that can make bigger shapes.

### interactive_ifollower_ui.html

Interactive UI for actions in the pentomino domain.

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
