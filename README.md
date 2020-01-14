# Pentomino JS Framework

A pentomino framework built with jQuery, jCanvas and HTML5 canvas.

## Events

The system fires different events that can be used for oberserving and modeling human behaviour.
Each event is composed through an event type, name of the object, position of the object and modified properties
of the object.
Example:

```json
{
    "type": "shape_rotated",
    "object": "T3red",
    "position": {
        "x": 10,
        "y": 10
    },
    "modified":{
        "rotate": 180
    }
}
```

### Event names

- shape_moved
  - modified: dx, dy
- shape_rotated
  - modified: rotate
- shape_collision
  - modified: dx, dy, collided_shapes
- shape_placed
  - modified: /
