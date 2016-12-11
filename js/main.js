(function () {
  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
  }

  var objects = [],
    targets = [],
    movies = [];

  var camera, scene = new THREE.Scene(),
    renderer = new THREE.CSS3DRenderer(),
    container = document.getElementById('threejs-container');

  var tweenCount;

  var currentTarget;

  // init three.js scene
  initScene();

  $.ajaxSetup({
    cache: false
  });
  $.getJSON("movies/meta.json", function (data) {
    container.innerHTML = "";

    movies = data.movies;
    $('#date').text(data.time);
    setData(movies);
    initLayout();

    // Start the gallery
    container.appendChild(renderer.domElement);
    transform(2500);

  }).fail(function () {
    console.log("error");
  });

  function updateSize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  }

  function initScene() {
    camera = new THREE.PerspectiveCamera(40, container.offsetWidth / container.offsetHeight, 1, 10000);
    camera.position.z = 1800;

    updateSize();
    window.addEventListener('resize', updateSize, false);

    animate();
  }

  function setData(movies) {
    for (var i = 0; i < movies.length; i++) {
      var element = document.createElement('div');
      element.className = 'element';
      element.id = 'el' + i;

      var img = document.createElement('img');
      img.src = movies[i].img;
      element.appendChild(img);
      element.addEventListener('click', function (event) {
        if (tweenCount !== 0) return;

        event.preventDefault();
        event.stopPropagation();

        sortMovies(event.currentTarget);
        transform(1500);
      });

      var cssObject = new THREE.CSS3DObject(element);
      cssObject.position.x = Math.random() * 1000 - 500;
      cssObject.position.y = Math.random() * 1000 - 500;
      cssObject.position.z = Math.random() * 1000 - 1000;

      scene.add(cssObject);
      objects.push(cssObject);
    }
  }

  function transform(duration) {
    TWEEN.removeAll();
    tweenCount = 0;

    currentTarget.className = 'element selected';

    for (var i = 0; i < objects.length; i++) {

      var object = objects[i];
      var target = targets[i];

      new TWEEN.Tween(object.position)
        .to({
          x: target.position.x,
          y: target.position.y,
          z: target.position.z
        }, duration)
        .onComplete(function () {
          tweenCount--;
        })
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();

      new TWEEN.Tween(object.rotation)
        .to({
          x: target.rotation.x,
          y: target.rotation.y,
          z: target.rotation.z
        }, Math.random() * duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();

      tweenCount++;
    }
  }

  function initLayout() {
    var vector = new THREE.Vector3();
    for (var i = 0, l = objects.length; i < l; i++) {

      var phi = i === 0 ? 0 : (2 * (i + 0.25) * Math.PI) / (l + 0.5);

      var object = new THREE.Object3D();
      object.position.x = 700 * Math.sin(phi);
      object.position.y = i === 0 ? -15 : -30;
      object.position.z = 700 * Math.cos(phi);

      vector.x = object.position.x * 2;
      vector.y = object.position.y;
      vector.z = object.position.z * 2;

      object.lookAt(vector);

      targets.push(object);
    }

    sortMovies(objects[0].element);
  }

  function sortMovies(target) {
    if (currentTarget !== undefined)
      currentTarget.className = 'element unselected';
    currentTarget = target;

    var index = parseInt(currentTarget.id.substring(2))

    var l = objects.length;
    objects.sort(function (a, b) {
      var aIndex = parseInt(a.element.id.substring(2));
      var bIndex = parseInt(b.element.id.substring(2));

      var aValue = (aIndex < index) ? (aIndex + l - index) : (aIndex - index);
      var bValue = (bIndex < index) ? (bIndex + l - index) : (bIndex - index);

      return aValue - bValue;
    });

    setInfo(movies[index]);
  }

  function animate() {
    window.requestAnimationFrame(animate);
    TWEEN.update();
    renderer.render(scene, camera);
  }

  function setInfo(movie) {
    $("#title").text(movie.title);
    $("#director").text(movie.info["导演"]);
    $("#writer").text(movie.info["编剧"]);
    $("#actors").text(movie.info["主演"]);
    $("#genre").text(movie.info["类型"].join(' / '));
    $("#country").text(movie.info["制片国家/地区"]);
    $("#runtime").text(movie.info["片长"]);
  }
})();