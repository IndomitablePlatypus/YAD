# YAD
## Yet Another event Dispatcher

Create your own events, listen to them and react in any convenient way

## Usage

```js
//first listener
function log1(e) {
    console.log('log1', e.getData());
}

//second listener
function log2(e) {
    console.log('log2', e.getData());
    e.stop(); //stop propagating this event to following listeners
}

//third listener
function log3(e) {
    console.log('log3', e.getData());
}

//fourth listener
var listener1 = {
    listenfor: function (e) {
        console.log(e.getData());
        console.log(this);
    }
};

//listen to event log.someaction, listeners will be listener1.listenfor AND log2 AND log1
YAD.listen('log.someaction', [listener1.listenfor, log2, log1]);

//listen log.someaction.success, listener will be log3. Context (this) in log3 will be set to window, and name of listener will be 'blabla'
YAD.listen('log.someaction.success', YAD.createListener(log3, window, 'blabla'));

//listen to log.someaction.error, listener will be listener1.listenfor. Context (this) in listener1.listenfor will be set to listener1
YAD.listen('log.someaction.error', listener1.listenfor, listener1);

//second param is event data
YAD.whisper('log.someaction.success', {a:'a'});

//don't listen to listener with name 'blabla'
YAD.getDispatcher().unlistenListener('blabla');
//don't listen to any event with name beginning with 'log'
YAD.getDispatcher().unlistenEventHeap('log');

YAD.yell('log.someaction.success', {b: 'b'});
```
There is no output for this code :)

```js
YAD.listen('log.someaction', [listener1.listenfor, log2, log1]);
YAD.listen('log.someaction.success', YAD.createListener(log3, window, 'blabla'));
YAD.listen('log.someaction.error', listener1.listenfor, listener1);
YAD.whisper('log.someaction.success', {a:'a'});
YAD.yell('log.someaction.success', {b: 'b'});
```

And this will result in following:
```js
Object {b: "b"}
Object {} //this is listener1 object
Object {b: "b"}
Window {top: Window, location: Location, document: document, window: Window, external: Object…}
log2 Object {b: "b"}
log3 Object {a: "a"}
Object {a: "a"}
Window {top: Window, location: Location, document: document, window: Window, external: Object…}
log2 Object {a: "a"}
```
Note, that results of listening to whisper are handled after yell.