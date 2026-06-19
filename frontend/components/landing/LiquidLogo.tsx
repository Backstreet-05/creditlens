"use client";

import { useEffect, useRef } from "react";

// Fragment shader ported from liquid-logo (MIT) — chrome/liquid-metal effect
const FRAG = `#version 300 es
precision mediump float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D u_image_texture;
uniform float u_time;
uniform float u_ratio;
uniform float u_img_ratio;
uniform float u_patternScale;
uniform float u_refraction;
uniform float u_edge;
uniform float u_patternBlur;
uniform float u_liquid;

#define PI 3.14159265358979323846

vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 permute(vec3 x) { return mod289(((x*34.)+1.)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.);
  m = m*m; m = m*m;
  vec3 x = 2. * fract(p * C.www) - 1.;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130. * dot(m, g);
}

vec2 get_img_uv() {
  vec2 uv = vUv - .5;
  if (u_ratio > u_img_ratio) uv.x = uv.x * u_ratio / u_img_ratio;
  else                       uv.y = uv.y * u_img_ratio / u_ratio;
  uv += .5;
  uv.y = 1. - uv.y;
  return uv;
}

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float get_color_channel(float c1, float c2, float stripe_p, vec3 w, float extra_blur, float b) {
  float ch = c2;
  float blur = u_patternBlur + extra_blur;
  ch = mix(ch, c1, smoothstep(.0, blur, stripe_p));
  float border = w[0];
  ch = mix(ch, c2, smoothstep(border-blur, border+blur, stripe_p));
  b = smoothstep(.2, .8, b);
  border = w[0] + .4*(1.-b)*w[1];
  ch = mix(ch, c1, smoothstep(border-blur, border+blur, stripe_p));
  border = w[0] + .5*(1.-b)*w[1];
  ch = mix(ch, c2, smoothstep(border-blur, border+blur, stripe_p));
  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border-blur, border+blur, stripe_p));
  float gt = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gt));
  ch = mix(ch, gradient, smoothstep(border-blur, border+blur, stripe_p));
  return ch;
}

float frame_alpha(vec2 uv, float fw) {
  float a = smoothstep(0., fw, uv.x) * smoothstep(1., 1.-fw, uv.x);
  a *= smoothstep(0., fw, uv.y) * smoothstep(1., 1.-fw, uv.y);
  return a;
}

void main() {
  vec2 uv = vUv;
  uv.y = 1. - uv.y;
  uv.x *= u_ratio;

  float diagonal = uv.x - uv.y;
  float t = .001 * u_time;

  vec2 img_uv = get_img_uv();
  vec4 img = texture(u_image_texture, img_uv);

  vec3 color1 = vec3(.98, .98, 1.);
  vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, uv.x + uv.y));

  float edge = img.r;

  vec2 grad_uv = uv - .5;
  float dist = length(grad_uv + vec2(0., .2 * diagonal));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagonal) * PI);

  float bulge = pow(1.8 * dist, 1.2);
  bulge = 1. - bulge;
  bulge *= pow(uv.y, .3);

  float cycle_width = u_patternScale;
  float ts1r = .12 / cycle_width * (1. - .4 * bulge);
  float ts2r = .07 / cycle_width * (1. + .4 * bulge);

  float opacity = 1. - smoothstep(.9 - .5*u_edge, 1. - .5*u_edge, edge);
  opacity *= frame_alpha(img_uv, 0.01);

  float noise = snoise(uv - t);
  edge += (1. - edge) * u_liquid * noise;

  float refr = clamp(1. - bulge, 0., 1.);
  float dir = grad_uv.x + diagonal;
  dir -= 2. * noise * diagonal * (smoothstep(0.,1.,edge)*smoothstep(1.,0.,edge));
  bulge *= clamp(pow(uv.y, .1), .3, 1.);
  dir *= (.1 + (1.1 - edge) * bulge);
  dir *= smoothstep(1., .7, edge);
  dir += .18 * (smoothstep(.1,.2,uv.y)*smoothstep(.4,.2,uv.y));
  dir += .03 * (smoothstep(.1,.2,1.-uv.y)*smoothstep(.4,.2,1.-uv.y));
  dir *= (.5 + .5 * pow(uv.y, 2.));
  dir *= cycle_width;
  dir -= t;

  float refr_r = refr + .03*bulge*noise;
  float refr_b = 1.3 * refr;
  refr_r += 5.*(smoothstep(-.1,.2,uv.y)*smoothstep(.5,.1,uv.y))*(smoothstep(.4,.6,bulge)*smoothstep(1.,.4,bulge));
  refr_r -= diagonal;
  refr_b += (smoothstep(0.,.4,uv.y)*smoothstep(.8,.1,uv.y))*(smoothstep(.4,.6,bulge)*smoothstep(.8,.4,bulge));
  refr_b -= .2 * edge;
  refr_r *= u_refraction;
  refr_b *= u_refraction;

  vec3 w = vec3(cycle_width*ts1r, cycle_width*ts2r, 1.-ts1r-ts2r);
  w[1] -= .02 * smoothstep(.0, 1., edge + bulge);

  float r = get_color_channel(color1.r, color2.r, mod(dir+refr_r,1.), w, .02+.03*u_refraction*bulge, bulge);
  float g = get_color_channel(color1.g, color2.g, mod(dir,1.),       w, .01/(1.-diagonal),            bulge);
  float b = get_color_channel(color1.b, color2.b, mod(dir-refr_b,1.), w, .01,                         bulge);

  color1 = vec3(r, g, b) * opacity;
  fragColor = vec4(color1, opacity);
}`;

const VERT = `#version 300 es
precision mediump float;
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = .5 * (a_position + 1.);
  gl_Position = vec4(a_position, 0., 1.);
}`;

const PARAMS = { patternScale: 2.2, refraction: 0.018, edge: 0.38, patternBlur: 0.005, liquid: 0.06, speed: 0.22 };

interface LiquidLogoProps {
  text?: string;
  size?: number;
}

export default function LiquidLogo({ text = "CL", size = 160 }: LiquidLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId: number;

    async function init() {
      if (!canvas) return;

      await document.fonts.ready;

      // Build logo texture: black text on white background
      const TEX = 600;
      const off = document.createElement("canvas");
      off.width = TEX;
      off.height = TEX;
      const ctx = off.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, TEX, TEX);
      ctx.fillStyle = "#000";
      const fs = Math.round(TEX * (text.length > 3 ? 0.28 : 0.54));
      ctx.font = `700 ${fs}px 'Geist', system-ui, -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, TEX / 2, TEX / 2);
      const imageData = ctx.getImageData(0, 0, TEX, TEX);

      const gl = canvas.getContext("webgl2", { antialias: true, alpha: true });
      if (!gl) return;

      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);

      function mkShader(type: number, src: string) {
        const s = gl!.createShader(type)!;
        gl!.shaderSource(s, src);
        gl!.compileShader(s);
        if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
          console.error("LiquidLogo shader:", gl!.getShaderInfoLog(s));
          return null;
        }
        return s;
      }

      const vs = mkShader(gl.VERTEX_SHADER, VERT);
      const fs2 = mkShader(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs2) return;

      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs2);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
      gl.useProgram(prog);

      const vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
      const posLoc = gl.getAttribLocation(prog, "a_position");
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      const ul = (n: string) => gl.getUniformLocation(prog, n)!;
      const U = {
        time: ul("u_time"), ratio: ul("u_ratio"), imgRatio: ul("u_img_ratio"),
        scale: ul("u_patternScale"), refr: ul("u_refraction"), edge: ul("u_edge"),
        blur: ul("u_patternBlur"), liquid: ul("u_liquid"), tex: ul("u_image_texture"),
      };

      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, TEX, TEX, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageData.data);
      gl.uniform1i(U.tex, 0);

      gl.uniform1f(U.ratio, 1);
      gl.uniform1f(U.imgRatio, 1);
      gl.uniform1f(U.scale, PARAMS.patternScale);
      gl.uniform1f(U.refr, PARAMS.refraction);
      gl.uniform1f(U.edge, PARAMS.edge);
      gl.uniform1f(U.blur, PARAMS.patternBlur);
      gl.uniform1f(U.liquid, PARAMS.liquid);

      let total = 0;
      let last = performance.now();
      function render(now: number) {
        const dt = now - last; last = now;
        total += dt * PARAMS.speed;
        gl!.uniform1f(U.time, total);
        gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
        rafId = requestAnimationFrame(render);
      }
      rafId = requestAnimationFrame(render);
    }

    init();
    return () => cancelAnimationFrame(rafId);
  }, [text, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, display: "block" }}
    />
  );
}
