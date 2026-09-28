/**
 * Self-contained HTML document for the "Recursive Erosion" particle-sphere
 * background. Rendered inside a sandboxed <iframe srcDoc> by
 * `recursive-erosion.tsx`. three.js is loaded from a CDN inside the frame, so
 * the host app needs no extra npm dependency.
 *
 * Contract expected by the host component:
 *  - `#stage`  → the WebGL mount point (treated as the "background" role)
 *  - `#badge`  → decorative label, hidden by the focus script
 *  - `.sr`     → screen-reader description, hidden by the focus script
 *  - closing `</head>` / `</body>` markers the host injects focus CSS/JS around
 */
export const recursiveErosionSource = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Recursive Erosion</title>
    <style>
      html, body { margin: 0; padding: 0; height: 100%; background: #0a0908; overflow: hidden; }
      #stage { position: fixed; inset: 0; }
      #stage canvas { display: block; }
      #badge { position: fixed; left: 16px; bottom: 14px; font: 600 11px/1 ui-monospace, SFMono-Regular, monospace; letter-spacing: .14em; text-transform: uppercase; color: #6b625a; }
      .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
    </style>
  </head>
  <body>
    <div id="stage"></div>
    <div id="badge">Recursive Erosion</div>
    <p class="sr">Decorative animated particle sphere slowly eroding and reforming.</p>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
      (function () {
        var stage = document.getElementById('stage');
        if (!window.THREE || !stage) return;

        var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(stage.clientWidth || window.innerWidth, stage.clientHeight || window.innerHeight);
        stage.appendChild(renderer.domElement);

        var scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0908);
        var camera = new THREE.PerspectiveCamera(45, (stage.clientWidth || 1) / (stage.clientHeight || 1), 0.1, 100);
        camera.position.z = 3.2;

        var COUNT = 5200;
        var R = 1.15;
        var positions = new Float32Array(COUNT * 3);
        var colors = new Float32Array(COUNT * 3);
        var seeds = new Float32Array(COUNT);
        var base = new Float32Array(COUNT * 3);

        var cA = new THREE.Color(0xff9933); // tiranga saffron
        var cB = new THREE.Color(0xb8860b); // emblem gold
        var cC = new THREE.Color(0x138808); // ayush green
        var tmp = new THREE.Color();
        var golden = Math.PI * (3 - Math.sqrt(5));

        for (var i = 0; i < COUNT; i++) {
          var y = 1 - (i / (COUNT - 1)) * 2;
          var rad = Math.sqrt(Math.max(0, 1 - y * y));
          var th = golden * i;
          var x = Math.cos(th) * rad;
          var z = Math.sin(th) * rad;
          base[i * 3] = x * R; base[i * 3 + 1] = y * R; base[i * 3 + 2] = z * R;
          positions[i * 3] = base[i * 3]; positions[i * 3 + 1] = base[i * 3 + 1]; positions[i * 3 + 2] = base[i * 3 + 2];
          seeds[i] = Math.random();
          var t = (y + 1) / 2;
          if (t < 0.5) { tmp.copy(cA).lerp(cB, t * 2); } else { tmp.copy(cB).lerp(cC, (t - 0.5) * 2); }
          colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
        }

        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        var mat = new THREE.PointsMaterial({ size: 0.013, vertexColors: true, transparent: true, opacity: 0.92, depthWrite: false, blending: THREE.AdditiveBlending });
        var points = new THREE.Points(geo, mat);
        scene.add(points);

        function frame(time) {
          var t = time * 0.001;
          points.rotation.y = t * 0.15;
          points.rotation.x = Math.sin(t * 0.1) * 0.25;
          var arr = geo.attributes.position.array;
          for (var i = 0; i < COUNT; i++) {
            var s = seeds[i];
            var erosion = 1 + Math.sin(t * 1.2 + s * 6.2831) * 0.12 + Math.sin(t * 0.6 + s * 12.5) * 0.06;
            arr[i * 3] = base[i * 3] * erosion;
            arr[i * 3 + 1] = base[i * 3 + 1] * erosion;
            arr[i * 3 + 2] = base[i * 3 + 2] * erosion;
          }
          geo.attributes.position.needsUpdate = true;
          renderer.render(scene, camera);
          requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);

        window.addEventListener('resize', function () {
          var w = stage.clientWidth || window.innerWidth;
          var h = stage.clientHeight || window.innerHeight;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        });
      })();
    </script>
  </body>
</html>`;
