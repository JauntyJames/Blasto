function draw_grid(ctx, minor, major, stroke, fill) {
  minor = minor || 10;
  major = major || minor * 5;
  stroke = stroke || "#00FF00"
  fill = fill ||  "#009900"
  ctx.save(); // saves canvas state variables like context.lineWidth
  ctx.strokeStyle = stroke;
  ctx.fillStyle = fill;
  let width = ctx.canvas.width, height = ctx.canvas.height
  for(var x = 0; x < canvas.width; x += minor) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.lineWidth = (x % major === 0) ? 0.5 : 0.25;
    ctx.stroke();
    if(x % major === 0) { ctx.fillText(x, x, 10) }
  }
  for(var y = 0; y < canvas.height; y += 10) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.lineWidth = (y % 50 == 0) ? 0.5 : 0.25;
    ctx.stroke();
    if(y % major === 0) { ctx.fillText(y, 0, y + 10) }
  }
  ctx.restore(); // restores canvas variables to their state at start of func
} 

function draw_pacman(context, x, y, radius, o) {
  context.save();
  context.beginPath();
  context.arc(x, y, radius, (o * Math.PI * 0.2), -(o * Math.PI * 0.2));
  context.lineTo(x, y);
  context.fillStyle = "yellow";
  context.fill();
  context.closePath();
  context.stroke();
  context.restore();
}
