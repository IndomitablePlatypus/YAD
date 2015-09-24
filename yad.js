function isCallable(name) {
    return Object.prototype.toString.call(name) === '[object Function]';
}

function getUUID() {
    return 'xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, function () {
        var r = Math.random() * 16 | 0;
        return r.toString(16);
    });
}

function thereis(variable) {
    return typeof variable !== 'undefined';
}

function iselse(variable, value) {
    if (thereis(variable)) {
        return variable;
    }
    if (isCallable(value)) {
        return value();
    }
    return value;
}

/**
 * Yet Another event Dispatcher
 * 
 * @namespace
 * @type YAD
 */
var YAD = {
    /**
     * Dispatcher singleton
     * 
     * @private
     * @property
     * @type {YAD.Dispatcher}
     */
    _dispatcher: undefined,
    /**
     * Returns <b>YAD.Dispatcher</b> singleton in <b>YAD</b> namespace
     * 
     * @method
     * @public
     * @returns {YAD.Dispatcher}
     */
    getDispatcher: function () {
        return thereis(this._dispatcher) ? this._dispatcher : this._dispatcher = new this.Dispatcher();
    },
    /**
     * Creates new <b>YAD.Event</b> object
     * 
     * @public
     * @method
     * @param {String} name Event name (identifier)
     * @param {Object|null} data Basically any data associated with the event
     * @returns {YAD.Event} New <b>Event</b> object
     */
    createEvent: function (name, data) {
        return new this.Event(name, data);
    },
    /**
     * Creates new <b>YAD.Listener</b> object
     * 
     * @public
     * @method
     * @param {Function} executor The listener itself 
     *                            (name of some function, method, closure itself).
     * @param {Object|null} context Context for the executor to be called in 
     *                            (basically what would <b>this</b> mean inside executor).
     *                            <b>window</b> object by default.
     * @param {String|null} name Name assigned to the listener. This name can be 
     *                            further used when running <b>YAD.unlisten...</b>
     *                            methods for example.
     *                            <b>executor.toString()</b> by default.
     * @returns {YAD.Listener} New <b>Listener</b> object
     */
    createListener: function (executor, context, name) {
        return new this.Listener(executor, context, name);
    },
    /**
     * Declaration of <b>YAD.Dispatcher</b> class and method that returns
     * YAD.Dispatcher singleton in YAD namespace at the same time. <br /> 
     * When used as <b>YAD.Dispatcher()</b> call it will return YAD._dispatcher singleton. <br />
     * When used as <b>new YAD.Dispatcher()</b> it will return entirely new Dispatcher
     * object for you to (<i>ab</i>)use as you wish.
     * 
     * @class
     * @returns {YAD.Dispatcher} New <b>Dispatcher</b> object OR <b>YAD._dispatcher</b> singleton
     */
    Dispatcher: function () {
        return this instanceof YAD.Dispatcher ? this : this.getDispatcher();
    },
    /**
     * Declaration of YAD.Event calss. Use <b>YAD.createEvent</b> instead.
     * 
     * @class
     * @param {String} name Event name (identifier)
     * @param {Object|null} data Basically any data associated with the event
     * @returns {YAD.Event}
     */
    Event: function (name, data) {
        // "this" is YAD.Event, when calling new YAD.Event
        this._parse(name, data);
    },
    /**
     * Declaration of YAD.Listener class. Use <b>YAD.createListener</b> instead.
     * 
     * @class
     * @param {Function} executor The listener itself 
     *                            (name of some function, method, closure itself).
     * @param {Object|null} context Context for the executor to be called in 
     *                            (basically what would <b>this</b> mean inside executor).
     *                            <b>window</b> object by default.
     * @param {String|null} name Name assigned to the listener. This name can be 
     *                            further used when running <b>YAD.unlisten...</b>
     *                            methods for example.
     *                            <b>executor.toString()</b> by default.
     * @returns {YAD.Listener}
     */
    Listener: function (name, executor, context) {
        // "this" is YAD.Listener, when calling new YAD.Listener
        this._parse(name, executor, context);
    },
    /**
     * Alias for <b>YAD.getDispatcher().say</b><br />
     * Dispatches event (creating it if necessary).
     * All listeners are notified immediately.
     * 
     * @public
     * @method
     * @param {YAD.Event|String} event Either single <b>YAD.Event</b> instance
     *                                 or string to be used as Event name. 
     *                                 If string contains <b>"."</b> symbols,
     *                                 several events will be fired. <br />
     *                                 For example: <br />
     *                                 <b>log.someaction.success</b> will be dispatched
     *                                 to all listeners of <b>log</b> event, 
     *                                 all listeners of <b>log.someaction</b> event and 
     *                                 all listeners of <b>log.someaction.success<b> event.
     *                                 Each event will contain <b>data</b> object, but closure 
     *                                 will be called only once still.
     * @param {Object|null} data Basically any data associated with the event.
     *                                 If <b>event</b> is YAD.Event instance, and this param 
     *                                 is used, event.data will be rewritten with this param value.
     *                                 Pass <b>undefined</b> if you want to omit this param yet 
     *                                 use <b>closure</b>.
     * @param {Function|null} closure Closure for the event. 
     *                                 Closure will be executed after all relevant 
     *                                 listeners are notified of the event.
     *                                 Closure should accept array of Event objects, event if 
     *                                 Event instance is passed as the first param (in that case 
     *                                 array will contain one element).
     * @returns {true|mixed} True if there is no <b>closure</b>, results of <b>closure</b> 
     *                                 execution otherwise.
     */
    yell: function (event, data, closure) {
        return this.getDispatcher().say(event, data, closure);
    },
    /**
     * Alias for <b>YAD.getDispatcher().say</b>.<br />
     * Dispatches event (creating it if necessary).
     * All listeners are notified using setTimeout, thus after caller code block is finished.
     * Timeout delay can be configured using <b>YAD.getDispatcher().configure</b> method. 
     * Default is 0.
     * 
     * @public
     * @method
     * @param {YAD.Event|String} event Either single <b>YAD.Event</b> instance
     *                                 or string to be used as Event name. 
     *                                 If string contains <b>"."</b> symbols,
     *                                 several events will be fired. <br />
     *                                 For example: <br />
     *                                 <b>log.someaction.success</b> will be dispatched
     *                                 to all listeners of <b>log</b> event, 
     *                                 all listeners of <b>log.someaction</b> event and 
     *                                 all listeners of <b>log.someaction.success<b> event
     * @param {Object|null} data Basically any data associated with the event.
     *                                 If <b>event</b> is YAD.Event instance, and this param 
     *                                 is used, event.data will be rewritten with this param value.
     *                                 Pass <b>undefined</b> if you want to omit this param yet 
     *                                 use <b>closure</b>.
     * @param {Function|null} closure Closure for the event. 
     *                                 Closure will be executed after all relevant 
     *                                 listeners are notified of the event.
     *                                 Closure should accept array of Event objects, event if 
     *                                 Event instance is passed as the first param (in that case 
     *                                 array will contain one element).
     * @returns {true|mixed} True if there is no <b>closure</b>, results of <b>closure</b> 
     *                                 execution otherwise. <br />
     *                                 <b>Note</b>: in the case of whisper closure 
     *                                 is executed after the timeout is set, but before 
     *                                 listeners themselves are executed.
     */
    whisper: function (event, data, closure) {
        return this.getDispatcher().say(event, data, closure, false);
    },
    /**
     * Alias for <b>YAD.getDispatcher().listen</b>.<br />
     * Register one or more listeners to be notified when the event occures.
     * 
     * @public
     * @method
     * @param {YAD.Event|string} event Either single <b>YAD.Event</b> instance
     *                                 or string to be used as Event name. 
     *                                 Listeners will be registered to this particular 
     *                                 event without regard to the event name composition
     *                                 (using "." or no).
     * @param {Function} listener Function name, callable variable, method, closure 
     *                                 - whatever you  want to be executed when 
     *                                 event is fired. <br />
     *                                 You can use prepared <b>YAD.Listener</b> object. 
     *                                 In this case there is no need to pass any context 
     *                                 (it will be ignored). <br />
     *                                 Also you can use array to pass several listeners.
     *                                 Each item can be either listener or <b>YAD.Listener</b> 
     *                                 object or array of two elemnts where the first 
     *                                 one is listener, and the second one is context.
     *                                 Context param will be used with any 
     *                                 listeners that don't have their own.
     * @param {Object|null} context If you rely on <b>"this"</b> keyword inside the listener you can
     *                                 still safely ise it. Just pass what exactly should be 
     *                                 considered as "this".
     * @returns {YAD.Dispatcher} YAD Dispatcher singleton. As there is no distinction 
     *                                 between YAD.listen and Dispatcher.listen calls, 
     *                                 you can chain listener registraion
     */
    listen: function (event, listener, context) {
        return this.getDispatcher().listen(event, listener, context);
    }
};

YAD.Dispatcher.prototype = {
    /**
     * Delay execution of listeners for number of milliseconds
     * 
     * @private
     * @property
     * @type {Number}
     */
    _delay: 0,
    /**
     * ToDo вспомнить, нахера
     * @private
     * @property
     * @type {Number}
     */
    _dispatchMode: 0,
    /**
     * Event listeners. Array is used as a hash table, where keys are event names.
     * 
     * @private
     * @property
     * @type {Array}
     */
    _eventListeners: [],
    /**
     * Listeners. Array is used as a hash table, where keys are listener names.
     * 
     * @private
     * @property
     * @type {Array}
     */
    _listeners: [],
    /**
     * Alias to YAD.createEvent. Used for convenience.
     * 
     * @private
     * @method
     * @param {String} event
     * @param {Object|null} data
     * @returns {YAD.Event}
     * @see YAD.createEvent
     */
    _createEvent: function (event, data) {
        return YAD.createEvent(event, data);
    },
    /**
     * Check if variable is YAD.Event instance
     * 
     * @private
     * @method
     * @param {mixed} event
     * @returns {Boolean} True if variable is YAD.Event instance, false otherwise
     */
    _isEventObject: function (event) {
        return event instanceof YAD.Event;
    },
    /**
     * Transform some amorphous data to array of of YAD.Event objects.
     * 
     * @private
     * @method
     * @param {YAD.Event|String} event Either YAD.Event instance or string - event name.
     *                                 If string contains any dots, it is split by them and 
     *                                 a number of new events are created. Each dot represents 
     *                                 new level of events hierarchy, so event 
     *                                 'log.someaction.success' will spawn events for 
     *                                 'log', 'log.someaction' and 'log.someaction.success' 
     *                                 itself.
     * @param {type} data Any object
     * @returns {Array} Prepared events (array of YAD.Event objects)
     */
    _prepareEvents: function (event, data) {
        var events = [];
        if (this._isEventObject(event)) {
            event.setData(data);
            events.push(event);
        } else {
            var names = event.split('.');
            var name = names[0];
            events.push(this._createEvent(name, data));
            for (var i = 1; i < names.length; i++) {
                name = name + '.' + names[i];
                events.unshift(this._createEvent(name, data));
            }
        }
        return events;
    },
    /**
     * Analyze passed data and return corresponding YAD.Listener object (either
     * existing or new one)
     * 
     * @private
     * @method
     * @param {YAD.Listener|mixed} listenerInfo YAD.Listener instance or any callable
     *                                          or array of callable and its context
     * @param {Object} context Context of listener
     * @returns {YAD.Listener}
     */
    _parseListenerInfo: function (listenerInfo, context) {
        if (listenerInfo instanceof YAD.Listener) {
            return listenerInfo;
        }
        if (Array.isArray(listenerInfo)) {
            return listenerInfo.length >= 2 ?
                    YAD.createListener(listenerInfo[0], listenerInfo[1]) :
                    YAD.createListener(listenerInfo[0], context);
        }
        return YAD.createListener(listenerInfo, context);
    },
    /**
     * Create array of listeners from given data
     * 
     * @private
     * @method
     * @param {mixed} listenersInfo Array, or single callable, or single YAD.Listener
     * @param {Object} context Context of listener(s)
     * @returns {Array}
     */
    _prepareListeners: function (listenersInfo, context) {
        var listeners = [];
        if (!Array.isArray(listenersInfo)) {
            listeners.push(this._parseListenerInfo(listenersInfo, context));
            return listeners;
        }
        for (var i = 0; i < listenersInfo.length; i++) {
            listeners.push(this._parseListenerInfo(listenersInfo[i], context));
        }
        return listeners;
    },
    /**
     * Create array of listener names from given data
     * 
     * @private
     * @method
     * @param {mixed} listenerInfo Single name or single listener, or 
     *                             any combination of abovementioned in array
     * @returns {Array}
     */
    _prepareListenerNames: function (listenerInfo) {
        var listeners = [];
        if (!Array.isArray(listenerInfo)) {
            listeners = [listenerInfo];
        } else {
            listeners = listenerInfo;
        }
        for (var i = 0; i < listeners.length; i++) {
            if (typeof listeners[i] !== 'string') {
                listeners[i] = listeners[i].toString();
            }
        }
        return listeners;
    },
    /**
     * Invoke all listeners from given ArrayObject
     * 
     * @private
     * @method
     * @param {Object} listeners Array (hash table, object) of listeners
     * @param {YAD.Event} event
     * @returns {YAD.Dispatcher}
     */
    _runListeners: function (listeners, event) {
        for (var property in listeners) {
            if (listeners.hasOwnProperty(property)) {
                listeners[property].invoke(event);
                if (event.isStopped()) {
                    break;
                }
            }
        }
        return this;
    },
    /**
     * Dispatch events
     * 
     * @private
     * @method
     * @param {Object} events Array (hash table, object) of events
     * @returns {YAD.Dispatcher}
     */
    _dispatch: function (events) {
        var els = this._eventListeners;
        for (var i = 0; i < events.length; i++) {
            var name = events[i].getName();
            if (els.hasOwnProperty(name)) {
                this._runListeners(els[name], events[i]);
            }
        }
        return this;
    },
    /**
     * Register new listener
     * 
     * @private
     * @method
     * @param {YAD.Event} event
     * @param {YAD.Listener} listener
     * @returns {YAD.Dispatcher}
     */
    _addListener: function (event, listener) {
        this._listeners[listener.getName()] = listener;
        if (!this._eventListeners.hasOwnProperty(event.getName())) {
            this._eventListeners[event.getName()] = [];
        }
        this._eventListeners[event.getName()][listener.getName()] = listener;
        return this;
    },
    /**
     * Remove listener registration
     * 
     * @private
     * @method
     * @param {String} listenerName  Listener name
     * @returns {YAD.Dispatcher}
     */
    _removeListener: function (listenerName) {
        if (thereis(this._listeners[listenerName])) {
            delete this._listeners[listenerName];
        }
        for (var eventName in this._eventListeners) {
            if (this._eventListeners.hasOwnProperty(eventName)) {
                if (thereis(this._eventListeners[eventName][listenerName])) {
                    delete this._eventListeners[eventName][listenerName];
                }
            }
        }
        return this;
    },
    /**
     * Dispatches event (creating it if necessary).
     * 
     * @public
     * @method
     * @param {YAD.Event|String} event Either single <b>YAD.Event</b> instance
     *                                 or string to be used as Event name. 
     *                                 If string contains <b>"."</b> symbols,
     *                                 several events will be fired. <br />
     *                                 For example: <br />
     *                                 <b>log.someaction.success</b> will be dispatched
     *                                 to all listeners of <b>log</b> event, 
     *                                 all listeners of <b>log.someaction</b> event and 
     *                                 all listeners of <b>log.someaction.success<b> event.
     *                                 Each event will contain <b>data</b> object, but closure 
     *                                 will be called only once still.
     * @param {Object|null} data Basically any data associated with the event.
     *                                 If <b>event</b> is YAD.Event instance, and this param 
     *                                 is used, event.data will be rewritten with this param value.
     *                                 Pass <b>undefined</b> if you want to omit this param yet 
     *                                 use <b>closure</b>.
     * @param {Function|null} closure Closure for the event. 
     *                                 Closure will be executed after all relevant 
     *                                 listeners are notified of the event.
     *                                 Closure should accept array of Event objects, event if 
     *                                 Event instance is passed as the first param (in that case 
     *                                 array will contain one element).
     * @param {Boolean|null} immediate True by default. When set to false, notification process 
     *                                 will be delayed (by this._delay number of milliseconds).
     *                                 Use this in CPU-demanding environments when event you 
     *                                 are firing is not critical to the programm flow.
     * @returns {true|mixed} True if there is no <b>closure</b>, results of <b>closure</b> 
     *                                 execution otherwise.
     */
    say: function (event, data, closure, immediate) {
        if (!thereis(event)) {
            return undefined;
        }
        immediate = iselse(immediate, true);
        var events = this._prepareEvents(event, data);
        if (immediate) {
            this._dispatch(events);
        } else {
            setTimeout(function (events) {
                this._dispatch(events);
            }.bind(this), this._delay, events);
        }
        return thereis(closure) ? closure(events) : true;
    },
    /**
     * Register one or more listeners to be notified when the event occures.
     * 
     * @public
     * @method
     * @param {YAD.Event|string} event Either single <b>YAD.Event</b> instance
     *                                 or string to be used as Event name. 
     *                                 Listeners will be registered to this particular 
     *                                 event without regard to the event name composition
     *                                 (using "." or no).
     * @param {Function} listener Somethig callable.<br />
     *                                 You can use prepared <b>YAD.Listener</b> object. 
     *                                 In this case there is no need to pass any context 
     *                                 (it will be ignored).<br />
     *                                 Also you can use array to pass several listeners.
     *                                 Each item can be either listener or <b>YAD.Listener</b> 
     *                                 object or array of two elemnts where the first 
     *                                 one is listener (callable), and the second one 
     *                                 is context. Context param will be used with any 
     *                                 listeners that don't have their own.
     * @param {Object|null} context If you rely on <b>"this"</b> keyword inside the listener you can
     *                                 still safely ise it. Just pass what exactly should be 
     *                                 considered as "this".
     * @returns {YAD.Dispatcher}
     */
    listen: function (event, listener, context) {
        var events = this._prepareEvents(event);
        var listeners = this._prepareListeners(listener, context);
        for (var j = 0; j < listeners.length; j++) {
            this._addListener(events[0], listeners[j]);
        }
        return this;
    },
    /**
     * Remove listener registration
     * 
     * @param {mixed} listener Callable listener or listener name.
     * @returns {YAD.Dispatcher}
     */
    unlistenListener: function (listener) {
        var listenerNames = this._prepareListenerNames(listener);
        for (var i = 0; i < listenerNames.length; i++) {
            this._removeListener(listenerNames[i]);
        }
        return this;
    },
    /**
     * Don't listen to the event anymore
     * 
     * @param {YAD.Event|String} event Note, that in the case of complex event
     *                                 such as <b>log.someaction.success</b>
     *                                 only this particular event is handled.
     *                                 I.e. listeners that listen to <b>log.someaction</b>
     *                                 and <b>log</b> will still be notified in the case
     *                                 of <b>log.someaction.success</b> event firing.
     * @returns {YAD.Dispatcher}
     */
    unlistenEvent: function (event) {
        var events = this._prepareEvents(event);
        if (thereis(this._eventListeners[events[0].getName()])) {
            delete this._eventListeners[events[0].getName()];
        }
        return this;
    },
    /**
     * Don't listen to the event anymore as well as all events, succeeding this in hierarchy.
     * I.e. when using <b>log</b> as event param, all events starting with 'log.' 
     * will also be ignored forevermore.
     * 
     * @param {YAD.Event|String} event
     * @returns {YAD.Dispatcher}
     */
    unlistenEventHeap: function (event) {
        var events = this._prepareEvents(event);
        for (var property in this._eventListeners) {
            if (this._eventListeners.hasOwnProperty(property)) {
                if (property.indexOf(events[0].getName() + '.') === 0) {
                    delete this._eventListeners[property];
                }
            }
        }
        return this;
    },
    /**
     * Set config for current dispatcher
     * 
     * @param {Number} delay Delay for timeout in delayed notification in milliseconds.
     * @param {Number} dispatchMode 
     * @returns {YAD.Dispatcher.prototype}
     */
    configure: function (delay, dispatchMode) {
        this._delay = iselse(delay, 0);
        //ToDo вспомнить, нахера
        this._dispatchMode = iselse(dispatchMode, 0);
        return this;
    }
};

YAD.Event.prototype = {
    _name: 'exclamation',
    _data: {},
    _stopped: false,
    _parse: function (name, data) {
        this.setName(name).setData(data);
        return this;
    },
    setCarryOn: function (key, value) {
        this._data[key] = value;
        return this;
    },
    setName: function (name) {
        this._name = iselse(name, this._name);
        return this;
    },
    setData: function (data) {
        this._data = iselse(data, this._data);
        return this;
    },
    stopPropagation: function () {
        this._stopped = true;
        return this;
    },
    stop: function () {
        return this.stopPropagation();
    },
    isStopped: function () {
        return this._stopped;
    },
    getName: function () {
        return this._name;
    },
    getData: function () {
        return this._data;
    }
};

YAD.Listener.prototype = {
    _name: undefined,
    _executor: undefined,
    _context: undefined,
    _parse: function (executor, context, name) {
        this.setExecutor(executor).setContext(context).setName(name);
        return this;
    },
    setName: function (name) {
        this._name = iselse(name, this._name);
        return this;
    },
    setExecutor: function (executor) {
        this._executor = executor;
        this._name = iselse(this._name, this._executor.toString());
        return this;
    },
    setContext: function (context) {
        this._context = iselse(context, window);
        return this;
    },
    getName: function () {
        return this._name;
    },
    getExecutor: function () {
        return this._executor;
    },
    getContext: function () {
        return this._context;
    },
    isViable: function () {
        return isCallable(this._executor);
    },
    invoke: function (event) {
        if (this.isViable()) {
            return this._executor.call(this._context, event);
        }
    }
};
