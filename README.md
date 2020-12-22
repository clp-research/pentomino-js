# PentominoJS Interface Collection

A pentomino framework built with jQuery, jCanvas and HTML5 canvas.

## User Interfaces

Interfaces provided in this repository: 

### study1.html

**Please note: for spoken instructions, make sure your browser does not block automatically playing audio.**

'Dialog' popups are not fully supported in all browsers. [dialog-polyfill](https://github.com/GoogleChrome/dialog-polyfill) is used to help with this issue. If the interface does not seem to work, you might want to change your browser to a [supported one](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog#Browser_compatibility).

**REQUIRES SERVER SETUP.** Using [MAMP (Mac/Windows)](https://www.mamp.info/de/mac/): Once you have MAMP installed, create a server using the pentomino-js directory.
(Preferences > Server > select pentomino-js directory as root). Start the server and visit [http://localhost:8888/study1.html](http://localhost:8888/study1.html)

Interface to study the effect of different instruction giving strategies.
Includes a board showing different pentomino pieces to select from and a task board (which can't be manipulated be the user).

In the task, the user is prompted by a voiceover to select a specific piece. A task can comprise multiple or single selections. At completion of the task, a questionnaire appears.

During the task, the mouse tracked and the users decisions and answers to the questionnaire are collected. Finally, all data is 
saved to a server-side file in ```resources/data_collection```

Tasks are hard-coded into ```study1.js```, new tasks can be generated using ```task_creator.html``` (examples can be found in the ```tasks``` folder). 

### task_creator.html

Interface to create task for the *preliminary study* interface. 

A number of pieces can be generated at random first, then the position on both the initial and the goal board can be edited. Pieces be removed from the goal board by right-clicking. 

The task can finally be exported in JSON format, containing two entries 'initial' and 'task' with the respective board configurations.

### furhat_follower_ui.html

An interactive pentomino board and instructions for participants. Pieces can either be randomly generated on the board or imported from a json file.
The goal is to move / turn pieces until a target configuration is reached. Currently, instructions are logged to the console, but they could as well be spoken e.g. by a Furhat robot (see commented code in instruction_giver.js).

### index.html

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
