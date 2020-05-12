const frustumSize = 1000;

main = function () {
  function degrees_to_radians(degrees) {
    const pi = Math.PI;
    return degrees * (pi / 180);
  }

  function radians_to_degrees(radians) {
    const pi = Math.PI;
    return radians * (180 / pi);
  }

  const aspect = window.innerWidth / window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 1000);
  camera.lookAt(0, 0, 0);
  camera.zoom = 100;
  camera.updateProjectionMatrix();

  scene.add(camera);

  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);
  document.body.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.minDistance = 100;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2;

  // Lights
    
  scene.add(new THREE.HemisphereLight( 0x443333, 0x111122 ));

  const axes = new THREE.AxesHelper( 10 );
  scene.add( axes );

  const query_string = window.location.search;
  console.log(query_string);  

  const url_params = new URLSearchParams(query_string);

  const asset = url_params.get('asset');
    console.log(asset);
    
    var xhttp = new XMLHttpRequest();
    
    xhttp.open('GET', 'http://localhost:9393/assets/'+asset);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.setRequestHeader('Authorization', 'Metaspace-Token api_key=136:619746b7f0441005bfa7e945c05988fc');

    var loader = new THREE.STLLoader();

    xhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
	    console.log(JSON.parse(this.response).data.url);
	    const asset = JSON.parse(this.response).data;
	    
	    loader.load(asset.url, function ( geometry ) {
		var material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );

		console.log('finished!');
		var mesh = new THREE.Mesh( geometry, material );
		console.log(mesh);
		
		mesh.position.set( 0, 0, 0 );

		scene.add(mesh);
	    });
	    
	}
    };
    
    xhttp.send();


    /**
    var loader = new THREE.STLLoader();
    
    loader.load('d0b91d2f8016314e34e0850084784c3a.stl', function( geometry ) {
	console.log(geometry);
	var material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );

	var mesh = new THREE.Mesh( geometry, material );
	console.log(mesh);
		
	scene.add(mesh);

    });
    **/
    
    const animate = function () {
	requestAnimationFrame(animate);
	
	controls.update();
	
	renderer.render(scene, camera);
    };
    
    animate();
};
