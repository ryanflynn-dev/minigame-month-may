/**
 * A mapping of keys current pressed
 * @typedef {{left: boolean, up: boolean, right: boolean, down: boolean}} keyCodes
 */
const controls = {
  left: false,
  up: false,
  right: false,
  down: false,
};

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
    case "ArrowLeft":
    case "KeyA":
      controls.left = toggle;
      break;
    case "ArrowRight":
    case "KeyD":
      controls.right = toggle;
      break;
    case "ArrowUp":
    case "KeyW":
      controls.up = toggle;
      break;
    case "ArrowDown":
    case "KeyS":
      controls.down = toggle;
      break;
  }
};

/**
 * Initialise keyboard controls.
 *
 * @return null
 */
export const initControls = () => {
  document.addEventListener("keydown", (e) => {
    handleControlInput(e, true);
  });
  document.addEventListener("keyup", (e) => {
    handleControlInput(e, false);
  });
};

/**
 * Gets controls object
 *
 * @return Object.controls
 */
export const getControls = () => {
  return controls;
};
