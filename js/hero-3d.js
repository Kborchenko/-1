(() => {
  const host = document.querySelector(".hero, .page-hero");
  if (!host) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.createElement("canvas");
  canvas.className = "sculpture-canvas";
  canvas.setAttribute("aria-hidden", "true");
  host.prepend(canvas);

  for (let index = 1; index <= 2; index += 1) {
    const orbital = document.createElement("i");
    orbital.className = `orbital o${index}`;
    orbital.setAttribute("aria-hidden", "true");
    host.append(orbital);
  }

  const context = canvas.getContext("2d");
  const uCount = 46;
  const vCount = 12;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let pointerX = 0;
  let pointerY = 0;

  const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
  const subtract = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
  const multiply = (a, value) => ({ x: a.x * value, y: a.y * value, z: a.z * value });
  const cross = (a, b) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
  const normalize = (a) => {
    const length = Math.hypot(a.x, a.y, a.z) || 1;
    return { x: a.x / length, y: a.y / length, z: a.z / length };
  };
  const centerPoint = (angle) => ({
    x: ((2 + Math.cos(3 * angle)) * Math.cos(2 * angle)) / 2.75,
    y: ((2 + Math.cos(3 * angle)) * Math.sin(2 * angle)) / 2.75,
    z: Math.sin(3 * angle) / 2.75
  });

  const mesh = [];
  for (let u = 0; u < uCount; u += 1) {
    const angle = u / uCount * Math.PI * 2;
    const center = centerPoint(angle);
    const tangent = normalize(subtract(centerPoint(angle + .002), center));
    let normal = normalize(cross(tangent, { x: 0, y: 0, z: 1 }));
    if (Math.hypot(normal.x, normal.y, normal.z) < .1) normal = normalize(cross(tangent, { x: 0, y: 1, z: 0 }));
    const binormal = normalize(cross(tangent, normal));
    const ring = [];
    for (let v = 0; v < vCount; v += 1) {
      const section = v / vCount * Math.PI * 2;
      const radius = .2 + .025 * Math.sin(angle * 5);
      ring.push(add(center, add(multiply(normal, Math.cos(section) * radius), multiply(binormal, Math.sin(section) * radius))));
    }
    mesh.push(ring);
  }

  function resize() {
    dpr = Math.min(devicePixelRatio, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  addEventListener("resize", resize);
  host.addEventListener("pointermove", (event) => {
    const bounds = host.getBoundingClientRect();
    pointerX = (event.clientX - bounds.left) / bounds.width - .5;
    pointerY = (event.clientY - bounds.top) / bounds.height - .5;
  });

  function project(point, ax, ay, az, scale, cx, cy) {
    const cosX = Math.cos(ax), sinX = Math.sin(ax), cosY = Math.cos(ay), sinY = Math.sin(ay), cosZ = Math.cos(az), sinZ = Math.sin(az);
    const y1 = point.y * cosX - point.z * sinX;
    const z1 = point.y * sinX + point.z * cosX;
    const x2 = point.x * cosY + z1 * sinY;
    const z2 = -point.x * sinY + z1 * cosY;
    const x3 = x2 * cosZ - y1 * sinZ;
    const y3 = x2 * sinZ + y1 * cosZ;
    const perspective = 4.4 / (4.8 + z2);
    return { x: cx + x3 * scale * perspective, y: cy + y3 * scale * perspective, z: z2 };
  }

  function drawOrbit(cx, cy, rx, ry, rotation, alpha) {
    context.save();
    context.translate(cx, cy);
    context.rotate(rotation);
    context.scale(1, ry / rx);
    context.strokeStyle = `rgba(116,184,158,${alpha})`;
    context.lineWidth = 1;
    context.beginPath();
    context.arc(0, 0, rx, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  function frame(time) {
    context.clearRect(0, 0, width, height);
    const ax = (reduced ? -.32 : -.32 + time * .00011) + pointerY * .28;
    const ay = (reduced ? .52 : .52 + time * .00017) + pointerX * .42;
    const az = reduced ? -.12 : -.12 + Math.sin(time * .00022) * .08;
    const scale = Math.min(width, height) * .39;
    const cx = width * .5;
    const cy = height * .5;
    const halo = context.createRadialGradient(cx, cy, 0, cx, cy, scale * 1.75);
    halo.addColorStop(0, "rgba(55,133,104,.13)");
    halo.addColorStop(.55, "rgba(61,91,160,.055)");
    halo.addColorStop(1, "rgba(5,11,13,0)");
    context.fillStyle = halo;
    context.fillRect(0, 0, width, height);
    const projected = mesh.map((ring) => ring.map((point) => project(point, ax, ay, az, scale, cx, cy)));
    const faces = [];
    for (let u = 0; u < uCount; u += 1) {
      for (let v = 0; v < vCount; v += 1) {
        const points = [projected[u][v], projected[(u + 1) % uCount][v], projected[(u + 1) % uCount][(v + 1) % vCount], projected[u][(v + 1) % vCount]];
        faces.push({ points, depth: points.reduce((sum, point) => sum + point.z, 0) / 4, band: v / vCount });
      }
    }
    faces.sort((a, b) => b.depth - a.depth);
    faces.forEach((face) => {
      const near = Math.max(0, Math.min(1, (1.7 - face.depth) / 3.2));
      const green = .5 + Math.sin(face.band * Math.PI * 2) * .28;
      const red = Math.round(78 * green + 86 * (1 - green));
      const greenChannel = Math.round(184 * green + 119 * (1 - green));
      const blue = Math.round(143 * green + 210 * (1 - green));
      context.fillStyle = `rgba(${red},${greenChannel},${blue},${.055 + near * .22})`;
      context.strokeStyle = `rgba(139,211,184,${.045 + near * .13})`;
      context.lineWidth = .55;
      context.beginPath();
      context.moveTo(face.points[0].x, face.points[0].y);
      face.points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
      context.closePath();
      context.fill();
      context.stroke();
    });
    drawOrbit(cx, cy, scale * 1.48, scale * .36, ay * .4, .12);
    drawOrbit(cx, cy, scale * 1.25, scale * .27, -ax * .65, .075);
    if (!reduced) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
