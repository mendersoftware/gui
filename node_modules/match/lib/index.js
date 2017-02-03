"use strict";

// Dependencies
var EventEmitter = require("events").EventEmitter,
    ShuffleArray = require("shuffle-array"),
    ElmSelect = require("elm-select"),
    Barbe = require("barbe"),
    IterateObject = require("iterate-object"),
    Ul = require("ul");

/**
 * Match
 * Creates a new `Match` instance.
 *
 * Events you can listen to:
 *
 *  - `deactivate` (HTMLElement): Triggered when the block is deactivated.
 *  - `activate` (HTMLElement): Triggered when the block is activated.
 *  - `pair-flip` (HTMLElement, HTMLElement): After a pair flip.
 *  - `success` (HTMLElement, HTMLElement): When a match is found.
 *  - `win` (Number): Emitted when the game is over (the first argument is a
 *    number representing the number of miliseconds from the moment the game
 *    was started to now).
 *  - `render` (currentElement, data, isDuplicate): Emitted on render–the HTML
 *    element can be modified which will end in the editing the HTML. The data
 *    object is the current data object reference. The `isDuplicate` parameter
 *    takes a value of `0` or `1` (when the match is rendered).
 *  - `time` (Number): Like `win`, but emitted every second, during the game.
 *
 * @name Match
 * @function
 * @param {Element|String} elm The HTML element or the query selector.
 * @param {Object} options An object containing the following fields:
 *
 *  - `autoremove` (Boolean): If `true`, the blocks will be removed when they are matching (default: `true`).
 *  - `size` (Object):
 *    - `x` (Number): How many blocks per row (default: `4`).
 *    - `y` (Number): How many blocks per column (default: `4`).
 *  - `classes` (Object):
 *    - `active` (String): The active class added the active block elements (default: `"active"`).
 *  - `step` (Object):
 *    - `x` (Number): How much should be increased the `x` coordinate for each block.
 *    - `y` (Number): How much should be increased the `y` coordinate for each block.
 *
 * @param {Array} data Array of objects used in the templating.
 * @return {Match} The `Match` instance.
 */
function Match(elm, options, data) {
    this.ev = new EventEmitter();
    this.data = options.data || data;
    this.found = {};
    this.timestamps = [];
    this.flippedPairs = 0;

    // [elm, elm]
    this.active = [];

    this.options = Ul.deepMerge(options, {
        autoremove: true,
        size: {
            x: 4,
            y: 4
        },
        classes: {
            active: "active"
        },
        step: {
            x: 43,
            y: 43
        }
    });

    this.blocks_count = this.options.size.x * this.options.size.y;
    this.count = this.blocks_count / 2;

    if (this.blocks_count % 2) {
        throw new Error("The number of blocks should be even.");
    }

    this.ui = {
        container: ElmSelect(elm)[0],
        items: [],
        template: options.templateElm ? ElmSelect(options.templateElm)[0].outerHTML : options.template
    };

    if (!Array.isArray(this.data)) {
        throw new Error("Data should be an array.");
    }
}

/**
 * check
 * Checks if two elements match together.
 *
 * @name check
 * @function
 * @param {HTMLElement} elm1 The first element.
 * @param {HTMLElement} elm2 The second element.
 * @return {Boolean} `true` if the elements make a match or `false` otherwise.
 */
Match.prototype.check = function (elm1, elm2) {
    var p1 = elm1.getAttribute("data-pattern"),
        p2 = elm2.getAttribute("data-pattern");

    if (p1 === p2) {
        elm1._found = true;
        elm2._found = true;
        this.found[p1] = [elm1, elm2];
        return true;
    }

    return false;
};

/**
 * on
 * Attaches a new event listener (`on("some-event", fn)`).
 *
 * @name on
 * @function
 * @return {Match} The `Match` instance.
 */
Match.prototype.on = function () {
    this.ev.on.apply(this.ev, arguments);
    return this;
};

/**
 * emit
 * Emits an event data data as arguments (`emit("some-event", and, data, here)`).
 *
 * @name emit
 * @function
 * @return {Match} The `Match` instance.
 */
Match.prototype.emit = function () {
    this.ev.emit.apply(this.ev, arguments);
    return this;
};

/**
 * shuffle
 * Shuffles a given array.
 *
 * @name shuffle
 * @function
 * @param {Array} arr The array to shuffle (default: `this.data`).
 * @return {Array} The shuffled array.
 */
Match.prototype.shuffle = function (arr) {
    return ShuffleArray(arr || this.data);
};

/**
 * clear
 * Clears the container HTML.
 *
 * @name clear
 * @function
 * @return {Match} The `Match` instance.
 */
Match.prototype.clear = function () {
    this.ui.container.innerHTML = "";
    return this;
};

/**
 * deactivate
 * Deactivates the element.
 *
 * @name deactivate
 * @function
 * @param {HTMLElement} elm The block element.
 * @return {Match} The `Match` instance.
 */
Match.prototype.deactivate = function (elm) {
    this.active[this.active.indexOf(elm)] = null;
    if (elm._found) {
        return this;
    }
    elm.classList.remove(this.options.classes.active);
    return this.emit("deactivate", elm);
};

/**
 * activate
 * Activates the element.
 *
 * @name activate
 * @function
 * @param {HTMLElement} elm The block element.
 * @return {Match} The `Match` instance.
 */
Match.prototype.activate = function (elm) {
    elm.classList.add(this.options.classes.active);
    if (!this.active[0]) {
        this.active[0] = elm;
    } else if (this.active[0] && this.active[1]) {
        this.deactivate(this.active[0]);
        this.deactivate(this.active[1]);
        this.activate(elm);
    } else {
        if (this.active[0] === elm) {
            return this;
        }
        this.active[1] = elm;
        this.emit("pair-flip", this.active[0], this.active[1]);
        if (this.check.apply(this, this.active)) {
            this.emit("activate", elm);
            this.emit("success", this.active[0], this.active[1]);
            if (this.options.autoremove) {
                this.active[0].remove();
                this.active[1].remove();
                this.deactivate(this.active[0]);
                this.deactivate(this.active[1]);
            }
            if (Object.keys(this.found).length === this.count) {
                this.win();
            }
            return this;
        }
    }
    return this.emit("activate", elm);
};

/**
 * clicked
 * This is the internal click handler.
 *
 * @name clicked
 * @function
 * @param {HTMLElement} elm The block element.
 * @return {Match} The `Match` instance.
 */
Match.prototype.clicked = function (elm) {
    var self = this;
    elm.addEventListener("click", function () {
        self.activate(this);
    });
    return this;
};

/**
 * addHandlers
 * Adds the DOM handlers (e.g. `click`) and internal handlers (e.g. `pair-flip`).
 *
 * @name addHandlers
 * @function
 * @return {Match} The `Match` instance.
 */
Match.prototype.addHandlers = function () {
    var self = this;
    ElmSelect.call(this, this.ui.container.children, this.clicked);
    self.on("pair-flip", function () {
        ++self.flippedPairs;
    });
    return self;
};

/**
 * win
 * This function when the game is ended.
 *
 * @name win
 * @function
 * @return {Match} The `Match` instance.
 */
Match.prototype.win = function () {
    clearInterval(this.timer);
    this.timestamps[1] = new Date();
    this.emit("win", this.timestamps[1] - this.timestamps[2]);
    return this;
};

/**
 * render
 * Renders the game UI.
 *
 * @name render
 * @function
 * @param {Boolean} clear If `true`, the container will be cleared.
 * @return {Match} The `Match` instance.
 */
Match.prototype.render = function (clear) {
    var self = this,
        cPos = {
        x: 0,
        y: 0,
        cX: 0,
        cY: 0
    };

    if (clear) {
        self.clear();
    }

    self.shuffle();
    self.items = self.data.slice(0, this.blocks_count / 2);

    IterateObject(self.items, function (cData, id) {
        for (var newElm, frontElm, backElm, i = 0; i < 2; ++i) {
            newElm = document.createElement("div");
            newElm.setAttribute("data-pattern", id);

            frontElm = document.createElement("div");
            frontElm.classList.add("front");

            backElm = document.createElement("div");
            backElm.classList.add("back");

            newElm.appendChild(frontElm);
            newElm.appendChild(backElm);

            frontElm.innerHTML = Barbe(self.ui.template, cData);

            self.ui.items.push({ element: newElm, data: cData, duplicate: !!i });
            self.emit("render", newElm, cData, i);
        }
    });

    self.shuffle(self.ui.items);

    self.ui.container.innerHTML = self.ui.items.map(function (c) {

        if (cPos.cY === self.options.size.y) {
            return "";
        }

        if (cPos.cX === self.options.size.x) {
            cPos.y += self.options.step.y;
            cPos.x = 0;
            cPos.cX = 0;
            ++cPos.cY;
            if (cPos.cY === self.options.size.y) {
                return "";
            }
        }

        c.element.style.top = cPos.y + "px";
        c.element.style.left = cPos.x + "px";

        cPos.x += self.options.step.x;
        ++cPos.cX;
        return c.element.outerHTML;
    }).join("");

    return self.addHandlers();
};

/**
 * start
 * Starts the game (renders the UI, starts the timer etc).
 *
 * @name start
 * @function
 * @return {Match} The `Match` instance.
 */
Match.prototype.start = function () {
    var self = this;
    self.render(true);
    self.timestamps[0] = new Date();
    self.timer = setInterval(function () {
        self.emit("time", new Date() - self.timestamps[0]);
    }, 1000);
    return self;
};

module.exports = Match;