# Responsive Drag
A small (2k minified+gzipped!) JavaScript drag plugin for Zepto and jQuery, with an eye towards responsive designs and different input methods. It's fast and it's easy to use. Not tested at all on Internet Explorer, but works well on modern browsers and touch devices.

## Features
* Works with both touch and mouse events
* Tiny - just 2k gzipped
* Works with both Zepto and jQuery
* Extensible, exposes its core for modification
* Works fine inside relative containers
* Can use both translate3d and absolute positioning

## Demos
[Standard slider]

[Responsive slider]

[Basic drop functionality]

## Installation
Just include rdrag.js (development) or rdrag-min.js (production) after Zepto or jQuery. You're good to go!

## Usage
### Initialize a draggable object
```javascript
$('.draggable').rDrag({ /* settings */ });
```


### Drag events
An initialized rDrag object will trigger events when the user interacts with them. You don't need to bother with positioning of the object, rDrag will handle that for you (unless you particularly want to, in which case you can modify your object's rDrag instance) and these events will fire after positioning for every frame has been resolved.

#### dragstart
```javascript
$('.draggable').on('dragstart', function(event, delta, [percent]) {...});
```
Triggered when drag has started.


#### dragmove
```javascript
$('.draggable').on('dragmove', function(event, delta, [percent]) {...});
```
Triggered on mousemove when dragging.


#### dragend
```javascript
$('.draggable').on('dragend', function(event, delta, [percent]) {...});
```
Triggered when user has stopped dragging.


### Settings
#### threshold:
```javascript
$('.draggable').rDrag({ threshold:200 });
```
Sets the threshold for dragstart. Drag won't begin until user has moved their device further than the threshold value. Defaults to `3`.


#### translate:
```javascript
$('.draggable').rDrag({ translate:false });
```
If set to `true`, rDrag will use translate/translate3d for the positioning of the element. If set to `false`, rDrag will use absolute positioning instead.


#### dragMethod:
```javascript
$('.draggable').rDrag({ dragMethod:'touch' });
```
Can be set to `mouse`, `touch`, or `auto`. Defaults to `auto` where rDrag will look for touch support and use that if it exists. Otherwise it will use mouse events.


#### touchDetect:
```javascript
$('.draggable').rDrag({ touchDetect: function() { return true; } });
```
If you need a more robust function for detecting touches, pass it as the `touchDetect` setting. Return `true` if you want touch events, `false` for mouse events.


#### constraints:
```javascript
$('.draggable').rDrag({ constraints:[0, 100, 0, 0] });
```
Constrain drag movement inside a square, designated as an array in the following format: `[top, bottom, left, right]`. When constraints are set, any drag events triggered will contain a percentage value in the following format: `{top:X, left:X}`. Useful for sliders!


#### resize:
```javascript
$('.draggable').rDrag({ resize:function(){...} });
```
Function to fire when the window changes size. This is how you would handle orientation changes and resizes in a responsive design.


#### resizeInterval:
```javascript
$('.draggable').rDrag({ resizeInterval: 50});
```
The `resize` function runs the risk of becoming computationally heavy, so you have the option to limit it to fire at the specified interval. Defaults to null, which means the resize event will fire continuously as the user resizes. If your page is slow when resizing, try setting this option.


### Functions
You can access the rDrag object inside every initialized object. If, for instance, you want to change the constraints on an initialized object, you would do like this:
```javascript
$('.draggable').get(0).rDrag.settings.constraints = [0, 200, 0, 0];
```
The settings are all accessible from the `(element).rDrag.settings` object, as are the functions. You may find these two useful:
#### setPosition:
```javascript
$('.draggable').get(0).rDrag.setPosition(0, 0);
```
Moves the object to `x, y` with origo being its original position.

#### getPosition:
```javascript
var xy = $('.draggable').get(0).rDrag.getPosition();
```
Gets the object's current position as `{left:x, top:y}`.

## Caveats
I haven't been able to perfectly resolve the unbinding of mouse events yet, so if you're already using `mouseup` or `mousemove` on the window object, you will run into trouble.

## License
[MIT]

  [Standard slider]: http://rdrag.hal.se/drag0.html
  [Responsive slider]: http://rdrag.hal.se/drag1.html
  [Basic drop functionality]: http://rdrag.hal.se/drag2.html
  [MIT]: http://johanhalse.mit-license.org

    