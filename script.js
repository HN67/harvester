//Main Javascript script file

// ESLint configuration
// Future projects should maybe use a .eslintrc file

// Tell eslint this will be run in browser (window, document, alert, etc are legal)
/* eslint-env browser */

// Enable ES6
/* eslint-env es6 */

// Label global Harvester variable
/* global Harvester */

/*

    Use eslint-disable-line [rule] to supress a warning on a line (eg not-used)

*/

// This function is run when page is opened, initalization goes here
window.onload = function () {
    
	"use strict";
	
    // Global namespace
    window.Harvester = {};
    
    // Letter values, game currency
    window.Harvester.values = {"a": 0, "b": 0, "c": 0, "d": 0};

    // Config
    window.Harvester.config = {
        
        // The cost of producing each letter
        "cost": {

            "a": {},
            "b": {"a": 5},
            "c": {"a":5, "b": 5},
            "d": {"a": 10, "b": 10},

        },

        "prod": {
            
            "a": {
              
                "cost": {},
                "result": {},
                
            },
            
            "b": {
              
                "cost": {},
                "result": {},
                
            },
           
           "c": {
               
               "cost": {},
               "result": {"a": 1},
               
           },
            
           "d": {
               
               "cost": {"a": 5},
               "result": {"b": 1},
               
           },

        }

    }
    
    // Progression markers
    // Unlocked C's
    Harvester.cUnlock = false;
    
    // Setup game loop
    // First game tick/update is 0
    // Current tick of the game
    Harvester.tick = -1;
    // Current update of the game
	Harvester.update = -1;
    
    // Ticks per second
    Harvester.tickRate = 20;
    // Updates per second
    Harvester.updateRate = 0.2;
    
    // Ticks per update (should be a whole number)
    Harvester.updateSize = Harvester.tickRate / Harvester.updateRate;
    
    // Ticks delta is shown for
    Harvester.showTicks = 20;
    
    // Function to handle event handle creation
    attachEvents();
    
    // Start game loop (50ms = 1000ms / 20 tick per second)
    window.setInterval(tick, 1000/Harvester.tickRate);
    
};

// Minimum tick update
function tick() {
	
	"use strict";
    
    // Increment tick
    Harvester.tick += 1;
    
    // Update progress bar
    document.getElementById("progress").style.height = (Harvester.tick / Harvester.updateSize)*100 + "%";
    
    // Update delta opacities
    document.getElementById("change-a").style.opacity = 1.0 - Harvester.tick / Harvester.showTicks;
    document.getElementById("change-b").style.opacity = 1.0 - Harvester.tick / Harvester.showTicks;
    document.getElementById("change-c").style.opacity = 1.0 - Harvester.tick / Harvester.showTicks;
    document.getElementById("change-d").style.opacity = 1.0 - Harvester.tick / Harvester.showTicks;
    
    if (Harvester.tick >= Harvester.showTicks) {
        
        document.getElementById("change-a").style.display = "none";
        document.getElementById("change-b").style.display = "none";
        document.getElementById("change-c").style.display = "none";
        document.getElementById("change-d").style.display = "none";
        
    }
    
    // When the appropiate number of ticks have passed
    if (Harvester.tick >= Harvester.updateSize) {
        
        // Reset tick counter (next tick will be 1)
        Harvester.tick = 0;
        
        // Increase update counter
        Harvester.update += 1;
        
        // Logic handled by update() function  
        update();
        
    }
    
    refresh();
    
}

// Logical tick update
function update() {
    
	"use strict";
	
    // Every c produces 1 a
    checkProduction();
    
}

// List tracking a bunch of predicates
class PredicateList {
    
    // Sets up a list. Single is a boolean that determines whether predicates are popped when they are met
    constructor(single = true) {
        
        // List of predicates to check
        this.predicates = [];
        
        // Reference single
        this.single = single
        
    }
    
    // Add a predicate to be checked with check()
    add(predicate) {
        
        // Add the predicate to the lsit
        this.predicates.push(predicate);
        
    }
    
    // Checks each predicate, and runs and removes them if they are true
    check() {
        
        // For loop to check each predicate
        for (var i = 0; i < this.predicates.length; i++) {
            
            // Reference predicate for index
            var predicate = this.predicates[i];
            
            // Check the check func of the predicate
            if (predicate.check()) {
                
                // Run the predicate effect if the check was true
                predicate.effect();
                
                // Remove the predicate from the list if this PredicateList does that
                if (this.single) {
                    
                    this.predicates.splice(i, 1);
                    
                }
                
            }
            
        }
        
    }
    
}

// A class that hoolds a boolean returning check, and an effect function
// Used primarily by PredicateList
class Predicate {
    
    constructor(check, effect) {
        
        this.check = check;
        this.effect = effect;
        
    }
    
}

// Constructs a predicate that checks harvester values and then would set display: block for give id for effect
function UnlockCheck(values, element, style = "block") {
    
    var check = new Predicate(
    
        function () {

            for (var value in this.values) {

                if (Harvester.values[value] < this.values[value]) {

                    // Break with false if requirements not met
                    return false;

                }

            }
            
            // Return true if every condition was met
            return true;

        },

        function () {

            document.getElementById(this.element).style.display = this.style;

        }
    
    );
    
    check.values = values;
    check.element = element;
    check.style = style;
    
    return check;
    
}

function attachEvents() {
    
    // Reference buttons
    var a = document.getElementById("button-a");
    var b = document.getElementById("button-b");
    var c = document.getElementById("button-c");
    var d = document.getElementById("button-d");
    
    // Attach click events
    a.addEventListener("click", click_a);
    b.addEventListener("click", click_b);
    c.addEventListener("click", click_c);
    d.addEventListener("click", click_d);
    
    // Add hover events (price)
    a.addEventListener("mouseenter", showCostFunc(Harvester.config.cost.a));
    b.addEventListener("mouseenter", showCostFunc(Harvester.config.cost.b));
    c.addEventListener("mouseenter", showCostFunc(Harvester.config.cost.c));
    d.addEventListener("mouseenter", showCostFunc(Harvester.config.cost.d));
    
    // Add dehove eventrs
    a.addEventListener("mouseleave", clearCosts);
    b.addEventListener("mouseleave", clearCosts);
    c.addEventListener("mouseleave", clearCosts);
    d.addEventListener("mouseleave", clearCosts);
    
    
    // Create predicate list
    
    // List of unlock events
    Harvester.unlockEvents = new PredicateList();
    
    // Add events
    
    // Unlockal of A display
    Harvester.unlockEvents.add(UnlockCheck({"a": 1}, "stats"));
    Harvester.unlockEvents.add(UnlockCheck({"a": 1}, "display-a", "flex"));
    
    // Unlockal of B button
    Harvester.unlockEvents.add(UnlockCheck({"a": 5}, "button-b"));
    
    // Unlockal of B display
    Harvester.unlockEvents.add(UnlockCheck({"b": 1}, "display-b", "flex"));
    
    // Unlockal of C button
    Harvester.unlockEvents.add(UnlockCheck({"b": 5}, "button-c"));
    
    // Unlockal of C display
    Harvester.unlockEvents.add(UnlockCheck({"c": 1}, "display-c", "flex"));
    // Unlockal of update panel (i.e. progress bar)
    Harvester.unlockEvents.add(UnlockCheck({"c": 1}, "update"));
    
    // Unlockal of D button
    Harvester.unlockEvents.add(UnlockCheck({"c": 5}, "button-d"));
    
    // Unlockal of D display
    Harvester.unlockEvents.add(UnlockCheck({"d": 1}, "display-d", "flex"));
    
}

// Function to refresh display values and check for events
function refresh() {
    
	"use strict";
	
    // Update all the text contents with js var values
    document.getElementById("value-a").textContent = Harvester.values.a;
    document.getElementById("value-b").textContent = Harvester.values.b;
    document.getElementById("value-c").textContent = Harvester.values.c;
    document.getElementById("value-d").textContent = Harvester.values.d;
    
    
    // Check events
    Harvester.unlockEvents.check();
    
}

function showCostFunc(values) {
    
    // Function that updates each requirment element and the shows it
    var func = function () {
        
        // References the values latter added to this function
        for (var value in func.values) {
            
            document.getElementById("req-val-"+value).textContent = func.values[value];
            document.getElementById("req-"+value).style.display = "inline";
            
        }
        
    }
    
    // Give values list to funct
    func.values = values;
    
    // Return the function
    return func
    
    
}

function clearCosts() {
    
    document.getElementById("req-a").style.display = "none";
    document.getElementById("req-b").style.display = "none";
    document.getElementById("req-c").style.display = "none";
    document.getElementById("req-d").style.display = "none";
    
}

// Function to convert values into other values
function convert(start, end) {
    
    "use strict";
    
    // Check that each value requirement is met
    var value;
    for (value in start) {
        
        if (Harvester.values[value] < start[value]) {
            
            // Break with false if requirements not met
            return false;
            
        }
        
    }
    
    // Remove each ingredient
    for (value in start) {
        
        Harvester.values[value] -= start[value];
        
    }
    
    // Produce each product
    for (value in end) {
        
        Harvester.values[value] += end[value];
        
    }
    
    // Refresh display
    refresh();
    
    // Return true to indicate sucess
    return true;
    
}

// Checks the production of every value
function checkProduction() {
    
    // Save current values
    var old = {"a": Harvester.values.a, "b": Harvester.values.b, "c": Harvester.values.c, "d": Harvester.values.d};
    
    // Run the action of C's as much as possible (+1 A)
    for (let i = 0; i < Harvester.values.c; i++) {
        if (!convert(Harvester.config.prod.c.cost, Harvester.config.prod.c.result)) {
            break;
        }
    }
    
    // Run the action of D's as much as possible (5 A -> 1 B)
    for (let i = 0; i < Harvester.values.d; i++) {
        if (!convert(Harvester.config.prod.d.cost, Harvester.config.prod.d.result)) {
            break;
        }
    }
    
    // Determine total net change
    var delta = {
        
        "a": Harvester.values.a - old.a, "b": Harvester.values.b - old.b,
        "c": Harvester.values.c - old.c, "d": Harvester.values.d - old.d,
    
    }
    
    // Update each delta display
    updateDelta("a", delta.a);
    updateDelta("b", delta.b);
    updateDelta("c", delta.c);
    updateDelta("d", delta.d);
    
}

function updateDelta(letter, value) {
        
    // Only show if there was a change
    if (value != 0) {

        // Get element
        let el = document.getElementById("change-"+letter);
        // Make it visible
        el.style.display = "inline";

        let prefix = "";

        // Set color based on direction
        if (value > 0) {
            el.style.color = "green";
            prefix = "+";
        } else {
            el.style.color = "red";
        }

        // Set value
        document.getElementById("change-val-"+letter).textContent = prefix + value;

    } else {

        document.getElementById("change-"+letter).style.display = "none";

    }
    
}

// Functions that handle the onclick events of the board buttons

// A simply increments every button press
function click_a() {
    
	"use strict";
	
    convert(Harvester.config.cost.a, {"a": 1});
    
}

// B button converts 5 A's into 1 B
function click_b() {
    
	"use strict";
	
    convert(Harvester.config.cost.b, {"b": 1});
    
}

// C button converts 10 A's and 5 B into 1 C
function click_c() {
	
	"use strict";
    
    convert(Harvester.config.cost.c, {"c": 1});

    
}

function click_d() {
    
    "use strict";
    
    convert(Harvester.config.cost.d, {"d": 1});
    
    
}
