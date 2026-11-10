// Swirling paint background (WebGL), rendered at low res and scaled up pixelated.

const VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
const FRAG = `
precision mediump float;
uniform float t;
uniform vec2 res;
uniform vec3 c1, c2, c3;
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * res) / res.y;
  float r = length(uv);
  float a = 2.2 * r - t * 0.07;
  uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;
  vec2 w = uv * 4.5;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    w += 0.55 * vec2(sin(w.y * 1.2 + t * 0.19 + fi * 1.3), cos(w.x * 1.1 - t * 0.15 + fi * 0.7));
  }
  float v = 0.5 + 0.5 * sin(w.x * 0.9 + w.y * 0.7);
  vec3 col = mix(mix(c1, c2, smoothstep(0.30, 0.34, v)), c3, smoothstep(0.64, 0.68, v));
  col *= 0.72 + 0.2 * v;
  col = mix(col, vec3(0.07, 0.08, 0.11), 0.22 + 0.45 * r);
  gl_FragColor = vec4(col, 1.0);
}`;

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);

export function startBackground(canvas, palette) {
  const gl = canvas.getContext('webgl');
  let cur = palette.map(hex), target = cur;
  if (!gl) {
    canvas.style.background = palette[0];
    return { palette() {} };
  }
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = n => gl.getUniformLocation(prog, n);
  const [ut, ures, u1, u2, u3] = ['t', 'res', 'c1', 'c2', 'c3'].map(u);

  const resize = () => {
    canvas.width = Math.ceil(innerWidth / 4);
    canvas.height = Math.ceil(innerHeight / 4);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  addEventListener('resize', resize);
  resize();

  const t0 = performance.now();
  (function frame(now) {
    cur = cur.map((c, i) => c.map((x, j) => x + (target[i][j] - x) * 0.03));
    gl.uniform1f(ut, (now - t0) / 1000);
    gl.uniform2f(ures, canvas.width, canvas.height);
    [u1, u2, u3].forEach((uu, i) => gl.uniform3fv(uu, cur[i]));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  })(t0);

  return { palette(p) { target = p.map(hex); } };
}
