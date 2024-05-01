document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 1280;
  canvas.height = 720;

  function gameloop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  gameloop();
});
