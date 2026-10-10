export function startVisualizer(
  canvas: HTMLCanvasElement,
  analyser: AnalyserNode,
): () => void {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Trình duyệt không hỗ trợ Canvas 2D.");
  }

  // Tạo một lần và tái sử dụng ở mọi frame.
  const bins = new Uint8Array(analyser.frequencyBinCount);

  let frame = 0;
  let stopped = false;
  let width = 1;
  let height = 1;

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    context!.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  function draw(): void {
    if (stopped) {
      return;
    }

    analyser.getByteFrequencyData(bins);

    context!.fillStyle = "#101b32";
    context!.fillRect(0, 0, width, height);

    const barWidth = width / bins.length;

    for (let index = 0; index < bins.length; index += 1) {
      const magnitude = bins[index]! / 255;
      const barHeight = magnitude * (height - 16);

      context!.fillStyle = `hsl(${
        190 + magnitude * 80
      }, 85%, 65%)`;

      context!.fillRect(
        index * barWidth,
        height - barHeight,
        Math.max(1, barWidth - 1),
        barHeight,
      );
    }

    frame = requestAnimationFrame(draw);
  }

  frame = requestAnimationFrame(draw);

  return () => {
    if (stopped) {
      return;
    }

    stopped = true;
    cancelAnimationFrame(frame);
    observer.disconnect();

    context.clearRect(0, 0, width, height);
  };
}