export const vertexShader = `
attribute vec2 aPos;
attribute vec4 aState;
attribute vec3 aFx;
attribute vec4 aAtlas;
attribute vec3 aColor;

uniform vec2 uView;
uniform vec2 uTile;
uniform vec2 uVel;
uniform float uBend;
uniform float uCurve;
uniform float uLag;
uniform float uPress;
uniform float uMargin;
uniform vec2 uFocus;

varying vec2 vUv;
varying vec2 vSize;
varying vec4 vAtlas;
varying vec4 vState;
varying vec3 vColor;
varying float vIntro;
varying float vDepth;
varying float vEdge;
varying float vCarousel;

void main() {
  float intro = aFx.x;
  float s = aFx.y * mix(0.5, 1.0, intro) * (1.0 - 0.06 * uPress) * (1.0 - 0.2 * aState.x) * (1.0 + 0.035 * aState.z);
  vec2 size = uTile * s;
  vec2 quad = size + 2.0 * uMargin;
  vec2 local = position.xy * quad;
  vec2 p = aPos + local;

  vEdge = abs(p.x / (uView.x * 0.5));
  vec2 n = (p - uFocus) / (uView * 0.5);
  vec2 n2 = min(n * n, vec2(3.0));
  p.x -= uVel.x * uLag * n2.y;
  p.y -= uVel.y * uLag * n2.x;
  float z = -uBend * uCurve * (n2.x + n2.y);
  z -= (1.0 - clamp(intro, 0.0, 1.0)) * uCurve * 1.6;

  vUv = local / size + 0.5;
  vSize = size;
  vAtlas = aAtlas;
  vState = aState;
  vColor = aColor;
  vIntro = intro;
  vCarousel = aFx.z;
  vDepth = clamp(-z / (uCurve * 3.0), 0.0, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, z, 1.0);
}
`

export const fragmentShader = `
uniform sampler2D uAtlas;
uniform vec2 uVel;
uniform float uRadius;
uniform float uMargin;
uniform float uHoverAny;
uniform float uSplit;
uniform vec3 uRed;
uniform float uIcon;

varying vec2 vUv;
varying vec2 vSize;
varying vec4 vAtlas;
varying vec4 vState;
varying vec3 vColor;
varying float vIntro;
varying float vDepth;
varying float vEdge;
varying float vCarousel;

float sdRound(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 px = (vUv - 0.5) * vSize;
  float d = sdRound(px, vSize * 0.5, uRadius);
  float aa = max(fwidth(d), 0.001);
  float inside = 1.0 - smoothstep(-aa, aa, d);

  float dim = clamp(vState.x, 0.0, 1.0);
  float glow = vState.y;
  float hover = vState.z;

  float zoom = 1.0 + 0.1 * hover;
  vec2 uv = (vUv - 0.5) / zoom + 0.5;
  vec2 lo = vAtlas.xy;
  vec2 hi = vAtlas.xy + vAtlas.zw;
  vec2 a = vAtlas.xy + uv * vAtlas.zw;
  vec2 o = (uVel * uSplit / vSize) * vAtlas.zw;
  vec3 tex = vec3(
    texture2D(uAtlas, clamp(a + o, lo, hi)).r,
    texture2D(uAtlas, clamp(a, lo, hi)).g,
    texture2D(uAtlas, clamp(a - o, lo, hi)).b
  );

  vec3 col = mix(vColor, tex, vState.w);
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(col, vec3(luma), dim * 0.96);
  col *= 1.0 - 0.78 * dim;
  col *= 1.0 + 0.16 * hover;
  col *= 1.0 - 0.38 * uHoverAny * (1.0 - hover);
  col *= 1.0 - 0.55 * vDepth;
  col *= 1.0 - 0.4 * smoothstep(0.7, 1.15, vEdge);

  if (vCarousel > 0.5) {
    float s = uIcon;
    vec2 q = px - (vSize * 0.5 - vec2(s * 2.4));
    col = mix(col, vec3(0.0), smoothstep(s * 3.0, 0.0, length(q)) * 0.4);
    float stroke = s * 0.2;
    float front = sdRound(q + vec2(s * 0.3), vec2(s * 0.66), s * 0.24);
    float back = sdRound(q - vec2(s * 0.3), vec2(s * 0.66), s * 0.24);
    float frontRing = 1.0 - smoothstep(stroke - aa, stroke + aa, abs(front));
    float backRing = (1.0 - smoothstep(stroke - aa, stroke + aa, abs(back))) * smoothstep(stroke * 1.6 - aa, stroke * 1.6 + aa, front);
    col = mix(col, vec3(1.0), max(frontRing, backRing) * (1.0 - 0.6 * dim));
  }

  float ring = (1.0 - smoothstep(aa * 0.5, aa * 0.5 + 1.2, abs(d + 1.6))) * glow;
  col = mix(col, uRed, ring);

  float halo = glow * exp(-max(d, 0.0) / (uMargin * 0.32)) * 0.55 * (1.0 - inside);
  float alpha = inside + halo;
  vec3 rgb = (col * inside + uRed * halo) / max(alpha, 0.0001);
  alpha *= clamp(vIntro * 1.6, 0.0, 1.0);

  gl_FragColor = vec4(rgb, alpha);
  #include <colorspace_fragment>
}
`
