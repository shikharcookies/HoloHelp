export const drawRect = (ctx, bbox, label, score) => {
    const [x, y, width, height] = bbox
  
    ctx.strokeStyle = '#00FF00'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)
  
    ctx.font = '14px Arial'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(x, y - 20, ctx.measureText(label).width + 50, 20)
    ctx.fillStyle = '#00FF00'
    ctx.fillText(`${label} (${(score * 100).toFixed(1)}%)`, x + 5, y - 5)
  }
  