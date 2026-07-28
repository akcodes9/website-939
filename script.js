/* ============================================================================
   CODEX SPACE — DRAFT 3 · behaviour
   ----------------------------------------------------------------------------
   Nine modules. All registered in boot() and audited at load, so a missing
   function is reported rather than silently killing every module after it.

   Principles, kept because they are engineering rather than art direction:
     · IntersectionObserver for anything triggered by position. The single
       scroll listener is rAF-coalesced and writes only custom properties.
     · Every module degrades to a working static page if JS never runs.
     · prefers-reduced-motion is honoured in CSS; JS checks it only where it
       would otherwise start a loop.
   ========================================================================= */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var CALM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------------------
     THE OPENING

     Six layers assemble into an exploded isometric, then the sheet turns white
     and the site is already drawn on it.

     Drawn from computed geometry rather than filmed. The whole page is a set
     of engineering plates at a true 30-degree isometric; generated video melts
     line geometry, and a raster of a wireframe cannot stay crisp. Projecting
     the points here means the opening is literally the same drawing as the
     rest of the site, moving.

     Sequence, over 4.2s:
       0.00–0.16  the ground grid draws itself outward from the origin
       0.10–0.74  six layers rise into position, bottom first, staggered
       0.46–0.86  dashed construction lines connect the corners
       0.86–1.00  the assembly holds
     -------------------------------------------------------------------------- */
  function initCine() {
    var root = document.documentElement;
    if (root.getAttribute('data-cine') !== 'running') { return; }

    var wrap = $('#cine');
    var cv = $('#cine-c');
    var state = $('#cine-state');
    if (!wrap || !cv) { root.setAttribute('data-cine', 'done'); return; }
    var ctx = cv.getContext('2d');
    if (!ctx) { root.setAttribute('data-cine', 'done'); return; }
    wrap.hidden = false;

    var DUR = 4200;
    var COS = Math.cos(Math.PI / 6), SIN = Math.sin(Math.PI / 6);   /* true 30° */
    var W = 0, H = 0, S = 1;

    /* Model space is a unit footprint; the layers differ only in height and in
       what is drawn on them, exactly as the plates do. */
    var LAYERS = [
      { z: 0.00, kind: 'slab'  },   /* foundation  */
      { z: 0.34, kind: 'gear'  },   /* electrical  */
      { z: 0.68, kind: 'pipe'  },   /* cooling     */
      { z: 1.02, kind: 'racks' },   /* compute     */
      { z: 1.36, kind: 'tray'  },   /* network     */
      { z: 1.70, kind: 'roof'  }    /* roof plant  */
    ];
    /* The projection centres on z = 0, so a stack this tall would hang off the
       top of the frame. Offsetting by half its height centres the assembly
       itself rather than its base. */
    var MID = LAYERS[LAYERS.length - 1].z / 2;

    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = Math.min(W, H) * 0.265;
    }

    /* Isometric projection. One function, used for every point drawn. */
    function P(x, y, z) {
      return {
        x: W / 2 + (x - y) * COS * S,
        y: H / 2 + ((x + y) * SIN - (z - MID)) * S * 0.92
      };
    }
    function moveTo(p) { ctx.moveTo(p.x, p.y); }
    function lineTo(p) { ctx.lineTo(p.x, p.y); }

    function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3); }
    function span(t, a, b) { return ease((t - a) / (b - a)); }

    function plate(z, k, alpha) {
      var h = 0.5;   /* half-footprint */
      ctx.globalAlpha = alpha;

      /* outline */
      ctx.beginPath();
      moveTo(P(-h, -h, z)); lineTo(P(h, -h, z)); lineTo(P(h, h, z)); lineTo(P(-h, h, z));
      ctx.closePath(); ctx.stroke();

      /* what sits on it — one motif per layer, drawn from the same grid so the
         six read as one machine rather than six unrelated diagrams */
      ctx.globalAlpha = alpha * 0.75;
      ctx.beginPath();
      var i, u;
      if (k === 'slab') {
        for (i = 1; i < 5; i++) {
          u = -h + i * (2 * h / 5);
          moveTo(P(u, -h, z)); lineTo(P(u, h, z));
          moveTo(P(-h, u, z)); lineTo(P(h, u, z));
        }
      } else if (k === 'racks') {
        for (i = 0; i < 7; i++) {
          u = -h + 0.09 + i * 0.13;
          moveTo(P(u, -h + 0.1, z)); lineTo(P(u, h - 0.1, z));
          moveTo(P(u, -h + 0.1, z)); lineTo(P(u, -h + 0.1, z + 0.1));
          moveTo(P(u, h - 0.1, z));  lineTo(P(u, h - 0.1, z + 0.1));
        }
      } else if (k === 'pipe') {
        moveTo(P(-h + 0.1, -h + 0.1, z)); lineTo(P(h - 0.1, -h + 0.1, z));
        lineTo(P(h - 0.1, h - 0.1, z));   lineTo(P(-h + 0.1, h - 0.1, z));
        ctx.closePath();
        for (i = 0; i < 4; i++) {
          u = -h + 0.18 + i * 0.22;
          moveTo(P(u, -h + 0.1, z)); lineTo(P(u, h - 0.1, z));
        }
      } else if (k === 'gear') {
        for (i = 0; i < 5; i++) {
          u = -h + 0.14 + i * 0.18;
          moveTo(P(u, -0.12, z)); lineTo(P(u + 0.1, -0.12, z));
          lineTo(P(u + 0.1, 0.12, z)); lineTo(P(u, 0.12, z)); ctx.closePath();
          moveTo(P(u, -0.12, z)); lineTo(P(u, -0.12, z + 0.14));
        }
      } else if (k === 'tray') {
        for (i = 0; i < 4; i++) {
          u = -h + 0.16 + i * 0.24;
          moveTo(P(-h + 0.06, u, z)); lineTo(P(h - 0.06, u, z));
        }
      } else {
        for (i = 0; i < 3; i++) {
          for (var j = 0; j < 3; j++) {
            var a = -0.34 + i * 0.34, b = -0.34 + j * 0.34;
            moveTo(P(a, b, z)); lineTo(P(a + 0.16, b, z));
            lineTo(P(a + 0.16, b + 0.16, z)); lineTo(P(a, b + 0.16, z)); ctx.closePath();
          }
        }
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    function frame(t) {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineJoin = 'round';

      /* the ground grid, drawing outward from the origin */
      var g = span(t, 0, 0.16);
      if (g > 0) {
        ctx.globalAlpha = 0.16 * (1 - span(t, 0.62, 0.9) * 0.55);
        ctx.beginPath();
        var reach = 1.5 * g;
        for (var i = -6; i <= 6; i++) {
          var u = i * 0.25;
          if (Math.abs(u) > reach) { continue; }
          moveTo(P(u, -reach, 0)); lineTo(P(u, reach, 0));
          moveTo(P(-reach, u, 0)); lineTo(P(reach, u, 0));
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      /* the six layers, bottom first */
      var k, L, p, lift, a;
      for (k = 0; k < LAYERS.length; k++) {
        L = LAYERS[k];
        p = span(t, 0.10 + k * 0.085, 0.42 + k * 0.085);
        if (p <= 0) { continue; }
        lift = (1 - p) * 0.55;                 /* rises into place from below */
        a = Math.min(1, p * 1.6);
        plate(L.z - lift, L.kind, a);
      }

      /* the construction lines, once there is something to connect */
      var c = span(t, 0.46, 0.86);
      if (c > 0) {
        ctx.globalAlpha = 0.36 * c;
        ctx.setLineDash([3, 6]);
        ctx.beginPath();
        var corners = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
        var top = LAYERS[LAYERS.length - 1].z;
        for (k = 0; k < 4; k++) {
          moveTo(P(corners[k][0], corners[k][1], -0.12));
          lineTo(P(corners[k][0], corners[k][1], -0.12 + (top + 0.24) * c));
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
    }

    size();
    var start = null, raf = 0, gone = false, at = 0;

    function tick(now) {
      if (start === null) { start = now; }
      var t = Math.min(1, (now - start) / DUR);
      at = t;
      frame(t);
      if (state && t > 0.86) { state.textContent = 'Assembled'; }
      if (t < 1) { raf = requestAnimationFrame(tick); }
    }
    raf = requestAnimationFrame(tick);

    /* The opening covers the page, so for as long as it is up the page must not
       be reachable — otherwise the first Tab lands on the skip link behind it
       and a keyboard reader is navigating a document they cannot see. */
    var behind = [$('.skip'), $('#nav'), $('#main'), $('footer')].filter(Boolean);
    function shield(on) {
      behind.forEach(function (el) {
        if (on) { el.setAttribute('inert', ''); } else { el.removeAttribute('inert'); }
      });
    }

    function onKey(e) {
      if (gone) { return; }
      if (e.key === 'Escape') { clearTimeout(timer); leave(); return; }
      /* Skip is the only thing in here, so Tab has nowhere else to go. */
      if (e.key === 'Tab' && skip) { e.preventDefault(); skip.focus(); }
    }

    function leave() {
      if (gone) { return; }
      gone = true;
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      shield(false);
      root.setAttribute('data-cine', 'done');
      wrap.setAttribute('data-leaving', 'true');
      var drop = function () {
        if (!wrap.parentNode) { return; }
        cv.width = cv.height = 0;          /* release the backing store */
        wrap.hidden = true;
        wrap.parentNode.removeChild(wrap);
      };
      wrap.addEventListener('transitionend', drop, { once: true });
      setTimeout(drop, 1400);
    }

    var timer = setTimeout(leave, DUR + 320);
    var skip = $('#cine-skip');
    shield(true);
    /* Focus is deliberately NOT taken here. Doing so drew a ring around Skip
       the instant the black came up, which is the loudest thing on an opening
       that is otherwise one hairline wide. The page behind is inert, so the
       first Tab reaches Skip anyway — the guard in onKey sees to that. */
    if (skip) { skip.addEventListener('click', function () { clearTimeout(timer); leave(); }); }
    document.addEventListener('keydown', onKey);
    /* Resizing rebuilds the backing store, which clears it. Without redrawing
       the current frame the assembly vanishes for good — and once the sequence
       has finished there is no rAF left running to put it back. */
    window.addEventListener('resize', function () {
      if (gone) { return; }
      size();
      frame(at);
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     THE WEAVE — the ground under sheet 00

     A woven field of points behind the hero, in the page's graphite and its one
     live red: a torus knot sampled as a point cloud. It holds its form from the
     first frame, turns slowly, and opens where the pointer goes.

     Written against WebGL directly rather than through a library. The version
     before this pulled in 703 KB of Three.js as an ES module, which meant the
     effect could not run from a file:// URL at all — module imports are blocked
     there by CORS, and the failure is silent. A point cloud is one vertex
     shader, one fragment shader and two buffers; the library was carrying the
     whole scene graph to do it. This costs nothing, runs anywhere the page
     opens, and the geometry below is the same parametric knot Three builds.

     Three things carried over from the component this came from, all of which
     had to change:

       · It allocated three vector objects per particle per frame — 135,000
         allocations a frame at this count, which the collector never gets
         ahead of. Every line of motion here is scalar arithmetic over the
         Float32Arrays, so a frame allocates nothing.

       · It sampled the knot by index modulo, drawing each vertex about seven
         times in the same place. The knot here is generated at 700 x 64 so the
         points land on the real surface and every one is distinct. That single
         change is what makes the weave read as woven rather than as dust.

       · Additive blending over a white ground pushes everything to white.
         Source-alpha blending, dark points.
     -------------------------------------------------------------------------- */
  function initWeave() {
    var cv = $('#weave');
    var hero = $('#hero');
    if (!cv || !hero || CALM) { return; }

    var gl = null;
    try {
      gl = cv.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false }) ||
           cv.getContext('experimental-webgl', { alpha: true, antialias: true });
    } catch (e) { return; }
    if (!gl) { return; }   /* no WebGL — the hero is simply the hero */

    /* ---- shaders ---------------------------------------------------------
       Point size attenuates with view depth, which is what gives the far side
       of the knot its finer grain and reads as depth without any shading. */
    /* aU is the point's position along the knot, 0 to 1. Two charges travel
       that length, and a point takes the live red as one passes over it. This
       replaced a sixth of the cloud being permanently red at random: at three
       pixels and 0.58 alpha, scattered red among grey is spatially averaged by
       the eye back into grey, which is why the hero read as plain white. Colour
       has to be gathered to be seen at all. Being carried by the same red the
       status dot and the headline beam use, it states the structure is live
       rather than tinting it. */
    var VERT =
      'attribute vec3 aPos;' +
      'attribute vec3 aCol;' +
      'attribute float aU;' +
      'uniform mat4 uMVP;' +
      'uniform mat4 uMV;' +
      'uniform float uSize;' +
      'uniform float uAlpha;' +
      'uniform float uPulse;' +
      'uniform vec3 uLive;' +
      'varying vec3 vCol;' +
      'varying float vA;' +
      'void main(){' +
      /* Wrapped distance to the nearest charge. Doubling aU puts two on the
         curve; min(ph, 1-ph) makes the falloff symmetric across the seam so
         there is no hard edge where the phase rolls over. */
      '  float ph = fract(aU * 2.0 - uPulse);' +
      '  float d = min(ph, 1.0 - ph);' +
      /* Written as 1 - smoothstep rather than with the edges swapped: GLSL
         leaves smoothstep undefined when edge0 >= edge1, and most drivers do
         the sane thing, which is exactly how that kind of bug survives to
         someone else's GPU. */
      '  float band = 1.0 - smoothstep(0.0, 0.075, d);' +
      '  vCol = mix(aCol, uLive, band);' +
      /* Lit points are also brighter and slightly larger. Colour alone at this
         grain is still too fine to register. */
      '  vA = min(1.0, uAlpha * (1.0 + band * 0.85));' +
      '  vec4 mv = uMV * vec4(aPos, 1.0);' +
      '  gl_Position = uMVP * vec4(aPos, 1.0);' +
      '  gl_PointSize = max(1.0, uSize * (1.0 + band * 0.55) / max(0.001, -mv.z));' +
      '}';
    var FRAG =
      'precision mediump float;' +
      'varying vec3 vCol;' +
      'varying float vA;' +
      'void main(){ gl_FragColor = vec4(vCol, vA); }';

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
      return s;
    }
    var vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { return; }
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { return; }
    gl.useProgram(prog);

    var aPos = gl.getAttribLocation(prog, 'aPos');
    var aCol = gl.getAttribLocation(prog, 'aCol');
    var aU = gl.getAttribLocation(prog, 'aU');
    var uMVP = gl.getUniformLocation(prog, 'uMVP');
    var uMV = gl.getUniformLocation(prog, 'uMV');
    var uSize = gl.getUniformLocation(prog, 'uSize');
    var uAlpha = gl.getUniformLocation(prog, 'uAlpha');
    var uPulse = gl.getUniformLocation(prog, 'uPulse');
    var uLive = gl.getUniformLocation(prog, 'uLive');

    /* ---- the knot --------------------------------------------------------
       The same parametric (2,3) torus knot Three generates: a curve, then a
       tube swept around it on a Frenet-ish frame. Sampled at 700 x 64 so a
       point cloud this size lands on real surface rather than on repeats. */
    var TUBULAR = 700, RADIAL = 64, R = 1.5, TUBE = 0.5, P = 2, Q = 3;
    var KN = (TUBULAR + 1) * (RADIAL + 1);

    function curve(u, out) {
      var qp = Q / P * u, cs = Math.cos(qp);
      out[0] = R * (2 + cs) * 0.5 * Math.cos(u);
      out[1] = R * (2 + cs) * 0.5 * Math.sin(u);
      out[2] = R * Math.sin(qp) * 0.5;
    }

    var N = Math.min(KN, 46000);
      var RBOUND = 0, RBOUND2 = 0;   /* measured off the centred geometry below */
    var pos  = new Float32Array(N * 3);   /* live position */
    var home = new Float32Array(N * 3);   /* the knot — what the spring returns to */
    var vel  = new Float32Array(N * 3);
    var col  = new Float32Array(N * 3);
    var uarr = new Float32Array(N);       /* position along the knot, 0 to 1 */

    (function build() {
      var p1 = [0, 0, 0], p2 = [0, 0, 0];
      var T = [0, 0, 0], Nv = [0, 0, 0], B = [0, 0, 0];
      var i, j, k = 0, u, v, cx, cy, len, g;
      for (i = 0; i <= TUBULAR && k < N; i++) {
        u = i / TUBULAR * P * Math.PI * 2;
        curve(u, p1);
        curve(u + 0.01, p2);

        T[0] = p2[0] - p1[0]; T[1] = p2[1] - p1[1]; T[2] = p2[2] - p1[2];
        Nv[0] = p2[0] + p1[0]; Nv[1] = p2[1] + p1[1]; Nv[2] = p2[2] + p1[2];
        /* B = T x N, then N = B x T — an orthonormal frame along the curve */
        B[0] = T[1] * Nv[2] - T[2] * Nv[1];
        B[1] = T[2] * Nv[0] - T[0] * Nv[2];
        B[2] = T[0] * Nv[1] - T[1] * Nv[0];
        Nv[0] = B[1] * T[2] - B[2] * T[1];
        Nv[1] = B[2] * T[0] - B[0] * T[2];
        Nv[2] = B[0] * T[1] - B[1] * T[0];
        len = Math.hypot(B[0], B[1], B[2]) || 1;  B[0] /= len;  B[1] /= len;  B[2] /= len;
        len = Math.hypot(Nv[0], Nv[1], Nv[2]) || 1; Nv[0] /= len; Nv[1] /= len; Nv[2] /= len;

        for (j = 0; j <= RADIAL && k < N; j++) {
          v = j / RADIAL * Math.PI * 2;
          cx = -TUBE * Math.cos(v); cy = TUBE * Math.sin(v);
          var i3 = k * 3;
          home[i3]     = pos[i3]     = p1[0] + (cx * Nv[0] + cy * B[0]);
          home[i3 + 1] = pos[i3 + 1] = p1[1] + (cx * Nv[1] + cy * B[1]);
          home[i3 + 2] = pos[i3 + 2] = p1[2] + (cx * Nv[2] + cy * B[2]);

          /* Graphite only. All the red now arrives with the travelling charge,
             which is the one thing at this grain that can actually be seen. */
          g = 0.07 + Math.random() * 0.13;
          col[i3] = g; col[i3 + 1] = g; col[i3 + 2] = g;
          uarr[k] = i / TUBULAR;
          k++;
        }
      }

      /* The knot these equations produce is not centred on the origin — its x
         runs -2.27 to 2.75, so the form sits about a quarter of a unit off
         axis. Spinning it then swings that offset around the frame and leaves a
         gap on whichever side the mass has just left, which is the empty side.
         Re-centre on the bounding box and it turns about itself. */
      var lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9], c;
      for (i = 0; i < N * 3; i++) {
        c = i % 3;
        if (home[i] < lo[c]) { lo[c] = home[i]; }
        if (home[i] > hi[c]) { hi[c] = home[i]; }
      }
      var mid = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
      for (i = 0; i < N; i++) {
        i3 = i * 3;
        home[i3]     = pos[i3]     = home[i3]     - mid[0];
        home[i3 + 1] = pos[i3 + 1] = home[i3 + 1] - mid[1];
        home[i3 + 2] = pos[i3 + 2] = home[i3 + 2] - mid[2];
      }

      /* Measured, not assumed — the projection sizes itself off this, so a
         hard-coded figure would silently go wrong if the knot ever changed. */
      for (i = 0; i < N; i++) {
        i3 = i * 3;
        c = home[i3] * home[i3] + home[i3 + 1] * home[i3 + 1] + home[i3 + 2] * home[i3 + 2];
        if (c > RBOUND2) { RBOUND2 = c; }
      }
      RBOUND = Math.sqrt(RBOUND2);
    }());

    var posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

    var colBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
    gl.bufferData(gl.ARRAY_BUFFER, col, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aCol);
    gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);

    var uBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uBuf);
    gl.bufferData(gl.ARRAY_BUFFER, uarr, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aU);
    gl.vertexAttribPointer(aU, 1, gl.FLOAT, false, 0, 0);

    gl.uniform3f(uLive, 0.839, 0.212, 0.043);   /* #D6360B, the page's one accent */

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    /* ---- matrices, built in place so a frame allocates nothing ---------- */
    /* CAM is solved, not chosen. The knot has a bounding radius of 2.75, and
       under arbitrary rotation a point at radius r reaches ndc.y of
       f*r/sqrt(CAM^2 - r^2) and ndc.x of that over the aspect.

       The canvas is 100vw by 100svh, so on any desktop it is a wide frame and
       height was never the binding dimension. Fitting the height — which is
       what the first pass did — put the knot at 46% of the half-width and it
       read as a small mark stranded behind the type. Fitting the width instead
       puts it at about 70% and lets it run off the top and bottom, which is
       what a ground should do: a field that stops politely inside the frame
       reads as an object, and this is not meant to be an object. */
    var proj = new Float32Array(16), mv = new Float32Array(16), mvp = new Float32Array(16);
    var CAM = 5.00;

    /* The knot is about as wide as it is tall, and the hero is a 1.8:1 frame, so
       a uniform fit can satisfy one axis or the other and never both — fitting
       the height is what left it running off the top and bottom while the sides
       stayed empty. So the projection is told what fraction of the frame to
       fill and solves its own scale, per axis.

       FILL_Y above 1 is deliberate: it lets the form run past the top and
       bottom of its canvas and be cropped there. That is the only way to reach
       the sides without stretching. A square-ish form in a 2:1 frame can be
       made to touch both edges by distortion or by being drawn larger than the
       frame — and distortion is the one that looks dragged. Cropped, it stays
       in proportion and simply continues past the edge, which is what a ground
       should do anyway.

       On a phone the frame is taller than the form, so the width binds first,
       the crop never happens and the stretch collapses to uniform on its own.
       CAM sets no size at all — only how much perspective there is between the
       near and far side of the weave. */
    /* set by the build pass above, from the centred geometry */
    var FILL_X = 0.96, FILL_Y = 1.28;     /* fraction of each half-axis to occupy */
    var MAXSTRETCH = 1.20;

    function setProj(aspect) {
      var near = 0.1, far = 100, nf = 1 / (near - far);
      var k = RBOUND / Math.sqrt(CAM * CAM - RBOUND * RBOUND);
      var uy = FILL_Y / k;                /* scale that exactly fills the height */
      var ux = FILL_X / k * aspect;       /* scale that exactly fills the width  */
      var base = Math.min(uy, ux);        /* uniform fit — clears both axes */
      var sx = Math.min(ux, base * MAXSTRETCH);
      proj[0] = sx / aspect; proj[1] = 0; proj[2] = 0;  proj[3] = 0;
      proj[4] = 0;  proj[5] = base; proj[6] = 0;  proj[7] = 0;
      proj[8] = 0;  proj[9] = 0;  proj[10] = (far + near) * nf; proj[11] = -1;
      proj[12] = 0; proj[13] = 0; proj[14] = 2 * far * near * nf; proj[15] = 0;
    }

    /* Tilt, then spin about the form's own axis — Rx(tilt) * Rz(spin).
       It used to spin about Y, which is an axis lying in the plane of the
       torus: that swings the knot broadside then edge-on and the silhouette
       breathes wide and narrow, so one side of the frame keeps emptying out.
       Z is the torus's own axis and the form is disc-like around it — bounds
       run about +/-2.6 in x and y against +/-1.25 in z — so turning on Z holds
       a near-constant outline and the fill stays even the whole way round. The
       tilt is what keeps it from reading as a flat wheel. */
    function setMV(tilt, spin) {
      var sx = Math.sin(tilt), cx = Math.cos(tilt);
      var sz = Math.sin(spin), cz = Math.cos(spin);
      mv[0] = cz;       mv[4] = -sz;      mv[8]  = 0;
      mv[1] = cx * sz;  mv[5] = cx * cz;  mv[9]  = -sx;
      mv[2] = sx * sz;  mv[6] = sx * cz;  mv[10] = cx;
      mv[3] = 0; mv[7] = 0; mv[11] = 0;
      mv[12] = 0; mv[13] = 0; mv[14] = -CAM; mv[15] = 1;
    }

    function mul(out, a, b) {
      for (var c = 0; c < 4; c++) {
        var b0 = b[c * 4], b1 = b[c * 4 + 1], b2 = b[c * 4 + 2], b3 = b[c * 4 + 3];
        out[c * 4]     = a[0] * b0 + a[4] * b1 + a[8]  * b2 + a[12] * b3;
        out[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9]  * b2 + a[13] * b3;
        out[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
        out[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
      }
    }

    /* Constant. An oscillating tilt is idle wobble — motion that fills time
       rather than carrying anything, and the first thing a motion audit
       strikes. The rotation already gives the form life. */
    var TILT = 0.62;
    var W = 0, H = 0, DPR = 1, SIZE = 1;
    function size() {
      var r = cv.getBoundingClientRect();
      if (!r.width || !r.height) { return; }
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      gl.viewport(0, 0, cv.width, cv.height);
      setProj(W / H);
      SIZE = 3.25 * DPR;              /* point size in device pixels, before depth */
    }
    size();

    /* Pointer, held as two numbers so the loop stays allocation-free. Parked
       far away until it is known, so nothing is disturbed before first move. */
    var mx = 1e9, my = 1e9;
    window.addEventListener('mousemove', function (e) {
      var r = cv.getBoundingClientRect();
      mx = (((e.clientX - r.left) / r.width) * 2 - 1) * 3;
      my = (-((e.clientY - r.top) / r.height) * 2 + 1) * 3;
    }, { passive: true });

    var REACH = 1.5, REACH2 = REACH * REACH;

    function stir() {
      var k, k3, dx, dy, dz, d2, d, f;
      for (k = 0; k < N; k++) {
        k3 = k * 3;
        dx = pos[k3] - mx; dy = pos[k3 + 1] - my; dz = pos[k3 + 2];
        d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < REACH2 && d2 > 1e-6) {
          d = Math.sqrt(d2);
          f = (REACH - d) * 0.012 / d;
          vel[k3] += dx * f; vel[k3 + 1] += dy * f; vel[k3 + 2] += dz * f;
        }
        vel[k3]     = (vel[k3]     + (home[k3]     - pos[k3])     * 0.004) * 0.94;
        vel[k3 + 1] = (vel[k3 + 1] + (home[k3 + 1] - pos[k3 + 1]) * 0.004) * 0.94;
        vel[k3 + 2] = (vel[k3 + 2] + (home[k3 + 2] - pos[k3 + 2]) * 0.004) * 0.94;
        pos[k3] += vel[k3]; pos[k3 + 1] += vel[k3 + 1]; pos[k3 + 2] += vel[k3 + 2];
      }
    }

    var raf = 0, live = false;
    function draw(now) {
      if (!live) { return; }
      stir();
      setMV(TILT, now * 0.000045);
      mul(mvp, proj, mv);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniformMatrix4fv(uMVP, false, mvp);
      gl.uniformMatrix4fv(uMV, false, mv);
      gl.uniform1f(uSize, SIZE);
      gl.uniform1f(uAlpha, 0.58);
      /* One lap in ~9s. Slower than it wants to be, so it reads as something
         running through the structure rather than as a chase light. */
      gl.uniform1f(uPulse, (now * 0.00011) % 1);

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos);
      gl.drawArrays(gl.POINTS, 0, N);
      raf = requestAnimationFrame(draw);
    }

    function play(on) {
      if (on === live) { return; }
      live = on;
      if (on) { raf = requestAnimationFrame(draw); } else { cancelAnimationFrame(raf); }
    }

    /* It runs only while the hero is on screen. A point cloud turning behind
       eight sections nobody is looking at is a tax on every scroll. */
    if (typeof IntersectionObserver === 'function') {
      new IntersectionObserver(function (e) { play(e[0].isIntersecting); },
        { rootMargin: '10% 0px 10% 0px' }).observe(hero);
    }
    play(true);

    window.addEventListener('resize', size, { passive: true });
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); play(false); });
  }

  /* --------------------------------------------------------------------------
     Nav — a rule appears under the bar once the sheet header is past.
     -------------------------------------------------------------------------- */
  function initNav() {
    var nav = $('#nav'), hero = $('#hero');
    if (!nav || !hero) { return; }
    new IntersectionObserver(function (e) {
      nav.setAttribute('data-past', String(!e[0].isIntersecting));
    }, { rootMargin: '-70px 0px 0px 0px' }).observe(hero);
  }

  /* --------------------------------------------------------------------------
     Title block — the bar names the sheet you are currently reading, and one
     hairline under it carries depth.

     This replaced a nine-item index pinned in the left margin. That listed
     every layer permanently and read as a table of contents bolted to the side
     of the drawing; naming only the current sheet says the same thing, gives
     the margin back, and is what a real drawing set does in the corner. The
     full list is still reachable — it lives behind the block, in initRegister.
     -------------------------------------------------------------------------- */
  function initSheet() {
    var out = $('#nav-sheet');
    var depth = $('#nav-depth');
    var layers = $$('section[id^="l"]');
    if (!out && !depth) { return; }

    /* The register row for whichever layer the bar is naming, so opening it
       says where you already are before it says where you can go. */
    var rows = $$('#register a');
    function mark(id) {
      rows.forEach(function (a) {
        if (a.getAttribute('href') === '#' + id) { a.setAttribute('aria-current', 'true'); }
        else { a.removeAttribute('aria-current'); }
      });
    }

    if (out && layers.length && typeof IntersectionObserver === 'function') {
      var live = [];
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var i = live.indexOf(e.target);
          if (e.isIntersecting && i < 0) { live.push(e.target); }
          else if (!e.isIntersecting && i >= 0) { live.splice(i, 1); }
        });

        /* Two sections sit in the band together while one hands over to the
           next, and taking the last entry picks whichever the observer happened
           to report second. Name the section the viewport's midline is actually
           inside; between two, go on naming the last one. */
        var mid = window.innerHeight / 2, now = null;
        live.forEach(function (s) {
          var r = s.getBoundingClientRect();
          if (r.top <= mid && r.bottom >= mid) { now = s; }
        });
        if (!now) { return; }

        var idx = now.querySelector('.layer__idx');
        if (!idx) { return; }
        var parts = $$('span', idx).map(function (s) { return s.textContent.trim(); });
        out.textContent = parts.join(' \u00B7 ');
        mark(now.id);
        /* The bar and the depth rule take the colour of the system you are
           currently inside, so the hue is continuous from the drawing to the
           chrome rather than stopping at the section edge. */
        var sys = getComputedStyle(now).getPropertyValue('--sys').trim();
        document.documentElement.style.setProperty('--sys-now', sys || '');
      }, { rootMargin: '-46% 0px -46% 0px' });
      layers.forEach(function (s) { io.observe(s); });

      /* Back at the top the bar reverts to the general arrangement — the sheet
         that shows the whole machine before it is taken apart. */
      var hero = $('#hero');
      if (hero) {
        new IntersectionObserver(function (e) {
          if (!e[0].isIntersecting) { return; }
          out.textContent = 'Layer 00 \u00B7 General arrangement';
          mark('hero');
          document.documentElement.style.removeProperty('--sys-now');
        }, { rootMargin: '-40% 0px -40% 0px' }).observe(hero);
      }
      mark('hero');
    }

    /* One rAF-coalesced listener, writing one custom property — and only where
       the stylesheet's scroll-driven animation is unavailable. Where it is
       supported the rule is driven on the compositor and this never binds, so
       the page carries no scroll listener at all. */
    var nativeTimeline = typeof CSS !== 'undefined' && CSS.supports &&
      CSS.supports('animation-timeline', 'scroll()');
    if (!depth || CALM || nativeTimeline) { return; }
    var queued = false;
    function schedule() {
      if (queued) { return; }
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        depth.style.setProperty('--depth', p.toFixed(4));
      });
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    schedule();
  }

  /* --------------------------------------------------------------------------
     Reveal — parts seat along the drawing's own isometric axis.

     The contract matters more than the effect: nothing hides itself until this
     flag is set, and it is set only after the observer is known to be
     constructible. A reader whose script fails gets the finished page.
     -------------------------------------------------------------------------- */
  function initReveal() {
    var targets = $$('[data-in]');
    if (!targets.length) { return; }

    if (CALM || typeof IntersectionObserver !== 'function') {
      targets.forEach(function (el) { el.setAttribute('data-on', 'true'); });
      return;
    }
    document.documentElement.setAttribute('data-motion', 'on');

    /* Siblings that arrive together cascade; the index is assigned here rather
       than written into the markup, where it would rot the moment a row moves. */
    targets.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) {
        return c.hasAttribute && c.hasAttribute('data-in');
      });
      var i = sibs.indexOf(el);
      if (i > 0) { el.style.setProperty('--i', String(Math.min(i, 5))); }
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        e.target.setAttribute('data-on', 'true');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------------------------------
     Register — the sheet list, opened from the title block.

     The page is one continuous descent through nine layers with no way back up
     to a particular one, which is fine while you are reading it and useless the
     moment you want the cooling sheet again. A permanent index in the margin
     was tried and read as a table of contents bolted to the drawing. A register
     you open is what the drawing set itself does, and it costs no margin.

     Deliberately not a modal: navigation should not trap you. It closes on
     Escape, on a click outside, and when focus leaves the bar — and if the
     script never runs the panel simply stays closed and every layer is still
     reachable by scrolling, which is how the page worked before.
     -------------------------------------------------------------------------- */
  function initRegister() {
    var btn = $('#nav-sheet-btn');
    var panel = $('#register');
    if (!btn || !panel) { return; }
    var nav = $('#nav');
    if (!nav) { return; }
    var open = false;

    function set(next, refocus) {
      if (next === open) { return; }
      open = next;
      panel.hidden = !next;
      btn.setAttribute('aria-expanded', String(next));
      nav.setAttribute('data-open', String(next));
      if (next) {
        document.addEventListener('keydown', onKey);
        document.addEventListener('pointerdown', onOutside, true);
      } else {
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('pointerdown', onOutside, true);
        /* Escape must put the reader back on the control they opened it with;
           a click elsewhere must not steal focus away from where they clicked. */
        if (refocus) { btn.focus(); }
      }
    }

    function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); set(false, true); } }
    function onOutside(e) { if (nav && !nav.contains(e.target)) { set(false, false); } }

    btn.addEventListener('click', function () { set(!open, false); });

    /* Choosing a sheet closes the register — the anchor still does the work, so
       this keeps functioning as plain links with the script stripped out. */
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) { set(false, false); }
    });

    /* Tabbing past the last row leaves the bar entirely; the panel should not
       still be hanging open over content the reader has moved on to. */
    nav.addEventListener('focusout', function (e) {
      if (open && !nav.contains(e.relatedTarget)) { set(false, false); }
    });
  }

  /* --------------------------------------------------------------------------
     THE TURNING WORD

     The last line of the headline trades between what the company builds and
     what it is called. Out, then in — the old word leaves before the new one
     arrives, which is what AnimatePresence mode="wait" does in the component
     this came from, and it is the only sequencing that reads as one word
     replacing another rather than two words crossing.

     Nothing else on the page may move while it does. Two things guarantee that,
     and both live outside this function:

       · The <br> in the markup. Without it the word shares a line with the rest
         of the sentence, and since the two words are different widths,
         text-wrap:balance re-broke the whole headline on every turn — `with`
         changed lines twice every five seconds.

       · The word is alone on its line, so the box needs no width of its own.
         An earlier pass measured both words and transitioned the box between
         them; that was solving a problem the <br> had already removed, and the
         animated resize was itself movement. The text is swapped at the far
         end of the exit, while opacity is zero, so the width changes at the
         one instant nobody can see it.

     Ported from React / Framer Motion. One element, not two: the component
     mounts a fresh node per word and holds the old one alive through its exit.
     Here the same span goes out, has its text replaced, and comes back — no
     node churn every few seconds, nothing to keep aligned with anything.

     It stops. Auto-updating text with no way to pause it is a WCAG 2.2.2
     failure, so it holds while the pointer is over the headline, holds while
     the hero is off screen, and never starts under reduced motion. The
     accessible copy of the heading is static regardless, so a screen reader
     hears one settled sentence rather than an h1 rewriting itself.
     -------------------------------------------------------------------------- */
  function initRotate() {
    var box = $('#rot');
    if (!box) { return; }
    var word = box.firstElementChild;
    if (!word) { return; }

    /* Each word carries its own dwell. This ran on a single setInterval, which
       forced both words to hold for the same length of time; the sentence wants
       to rest on what the company builds and only touch its name in passing. */
    var WORDS = [
      { text: 'infrastructure.', hold: 6000 },
      { text: 'Codex Space.',    hold: 3000 }
    ];
    var SWAP = 240;    /* matches --fast, the transition on .rot__w */

    var at = 0, timer = 0, over = false, seen = true, running = false;

    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(turn, WORDS[at].hold);
    }

    function turn() {
      timer = 0;
      var next = (at + 1) % WORDS.length;
      word.setAttribute('data-go', 'out');
      setTimeout(function () {
        word.textContent = WORDS[next].text;
        word.setAttribute('data-go', 'in');
        /* Read a layout property so the browser commits the 'in' offset before
           it is removed — without this the two changes coalesce into one style
           recalculation and the word simply appears. */
        void word.offsetWidth;
        word.removeAttribute('data-go');
        at = next;
        /* Chained, not repeated: the next wait belongs to the word that just
           arrived. A swap already under way is always allowed to land, so
           pausing mid-fade can never strand the word at zero opacity. */
        if (running) { schedule(); }
      }, SWAP);
    }

    function play(on) {
      if (on === running) { return; }
      running = on;
      if (on) { schedule(); }
      else { clearTimeout(timer); timer = 0; }
    }

    /* `over` is a flag, not a counter. As a counter, a pointerenter whose
       matching pointerleave never arrived — the element moving out from under a
       stationary cursor is enough — left it stuck above zero, with the rotation
       paused for the rest of the session and no way back. */
    var h1 = box.closest ? box.closest('h1') : box.parentNode;
    if (h1) {
      h1.addEventListener('pointerenter', function () { over = true;  play(false); });
      h1.addEventListener('pointerleave', function () { over = false; play(seen); });
    }

    var hero = $('#hero');
    if (hero && typeof IntersectionObserver === 'function') {
      new IntersectionObserver(function (e) {
        seen = e[0].isIntersecting;
        play(seen && !over);
      }, { rootMargin: '0px' }).observe(hero);
    }

    play(true);
  }

  /* --------------------------------------------------------------------------
     THE GROUND UNDER LAYER 06

     Plays only while the section is on screen, and never at all under reduced
     motion. The element carries preload="none" and no autoplay attribute, so
     the first byte is not fetched until this observer fires — a reader who
     never reaches layer 06 pays nothing for it.

     play() rejects when a browser blocks autoplay. That is caught and ignored:
     the poster is already the clip's own first frame, so a blocked video is
     simply a still ground and the section still reads.
     -------------------------------------------------------------------------- */
  function initOps() {
    var v = $('#ops');
    if (!v || CALM) { return; }
    var sec = v.closest ? v.closest('.layer') : v.parentNode;
    if (!sec || typeof IntersectionObserver !== 'function') { return; }

    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) {
        var p = v.play();
        if (p && p.catch) { p.catch(function () {}); }
      } else if (!v.paused) {
        v.pause();
      }
    }, { rootMargin: '25% 0px 25% 0px' }).observe(sec);
  }

  /* --------------------------------------------------------------------------
     Year — the footer states the current one rather than a number that rots.
     -------------------------------------------------------------------------- */
  function initYear() {
    var el = $('#year');
    if (el) { el.textContent = String(new Date().getFullYear()); }
  }

  /* ------------------------------------------------------------------------ */
  /* Nine independent modules, started independently. This used to be nine bare
     calls in a row, which meant a throw anywhere in the sequence took out every
     module after it — a fault in the WebGL weave, seventh from the end, was
     enough to stop the headline from ever turning, and it failed silently.
     Iterating the registry also removes the second list that had to be kept in
     step with this one by hand. */
  function boot() {
    Object.keys(REGISTRY).forEach(function (name) {
      try {
        REGISTRY[name]();
      } catch (e) {
        if (window.console && console.error) {
          console.error('[codex] ' + name + ' failed to start:', e);
        }
      }
    });
  }

  var REGISTRY = {
    initCine: initCine, initWeave: initWeave, initNav: initNav, initSheet: initSheet,
    initRegister: initRegister, initReveal: initReveal, initRotate: initRotate, initOps: initOps, initYear: initYear
  };
  Object.keys(REGISTRY).forEach(function (k) {
    if (typeof REGISTRY[k] !== 'function') { throw new Error('module missing from boot: ' + k); }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else { boot(); }
}());
