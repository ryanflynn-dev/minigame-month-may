/**
 * A mapping of key codes to intendedc function
 * @typedef {{left: number, up: number, right: number, down: number, a: number, d: number, s: number, w: number}} keyCodes
 */
const keyCodes = {
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    a: 65,
    d: 68,
    s: 83,
    w: 87,
}

/**
 * A mapping of keys current pressed
 * @typedef {{left: boolean, up: sboolean, right: boolean, down: boolean}} keyCodes
 */
const controls = {
    left: false,
    up: false,
    right: false,
    down: false,
}

/**
 * Handles control input and updates controls object
 *
 * @param Object - Event object
 * @param boolean Whether to set key to true/false
 * @return null
 *
 */
const handleControlInput = (e, toggle) => {
    e.preventDefault();
    switch (e.code) {
      case keyCodes.left: 
      case keyCodes.a: 
        controls.left = toggle;
        break;
      case keyCodes.right: 
      case keyCodes.d: 
        controls.right = toggle;
        break;
      case keyCodes.up: 
      case keyCodes.w: 
        controls.up = toggle;
        break;
      case keyCodes.down: 
      case keyCodes.s: 
        controls.down = toggle;
        break;
    }
}


/**
 * Initialise keyboard controls. 
 * 
 * @return null
 */
export const initControls = () => {
    document.addEventListener("keydown", (e) => {handleControlInput(e, true)});
    document.addEventListener("keyup", (e) => {handleControlInput(e, false)});
}

/**
 * Gets controls object 
 * 
 * @return Object.controls
 */
export const getControls = () => {
    return controls;
}

