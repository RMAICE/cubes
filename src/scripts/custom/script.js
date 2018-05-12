(function() {
	//
	var container;

	// keys
	var lock = true;

	// global objects
	var camera, scene, renderer;
	var cube, plane;

	var cubeTop = {
		name: 'Top',
		position: {
			y: 0
		}
	}
	var cubeMiddle = {
		name: 'Middle',
		position: {
			y: 225
		}
	}
	var cubeBotttom = {
		name: 'Bottom',
		position: {
			y: 450
		}
	}

	var cubesArr = [
		cubeTop,
		cubeMiddle,
		cubeBotttom
	];

	// rotation
	var targetRotation = 0;
	var targetRotationOnMouseDown = 0;
	var targetScale = 0; // нужен для анимации после touchend или mouseup
	var mouseX = 0;
	var mouseXOnMouseDown = 0;
	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	// tween animation
	var position;
	var tween = new TWEEN.Tween();

	// calculates

	Math.radians = function(degrees) {
		return degrees * Math.PI / 180;
	};

	// init on dom ready
	function init() {

		container = document.querySelectorAll( 'main.main' )[0];

		// create camera
		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.y = 250;
		camera.position.z = 700;

		// create scene
		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xf0f0f0 );

		// create Cubes

		for ( var j = 0; j < cubesArr.length; j++) {
			var item = cubesArr[j];
			var geometry = new THREE.BoxGeometry( 200, 200, 200 );

			for ( var i = 0; i < geometry.faces.length; i += 2 ) {

				var hex = Math.random() * 0xffffff;
				geometry.faces[ i ].color.setHex( hex );
				geometry.faces[ i + 1 ].color.setHex( hex );

			}

			var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, overdraw: 0.5 } );

			cube = new THREE.Mesh( geometry, material );
			cube.position.y = item.position.y;
			cube.name = item.name;
			scene.add( cube );
		}

		// Plane

		// var geometry = new THREE.PlaneBufferGeometry( 200, 200 );
		// geometry.rotateX( - Math.PI / 3 );

		// var material = new THREE.MeshBasicMaterial( { color: 0xe0e0e0, overdraw: 0.5 } );

		// plane = new THREE.Mesh( geometry, material );
		// scene.add( plane );

		// ray
		raycaster = new THREE.Raycaster();
		mouse = new THREE.Vector2();

		// render
		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth - 2, window.innerHeight - 2 );
		container.appendChild( renderer.domElement );

		// events
		document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		document.addEventListener( 'touchstart', onDocumentTouchStart, false );
		window.addEventListener( 'resize', onWindowResize, false );

		// calls
		animate();
	}

	function onWindowResize() {

		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	//

	function onDocumentMouseDown( event ) {

		event.preventDefault();

		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		document.addEventListener( 'mouseup', onDocumentMouseUp, false );
		document.addEventListener( 'mouseout', onDocumentMouseOut, false );

		// какие то вычисления для положения курсора
		mouseXOnMouseDown = event.clientX - windowHalfX;
		targetRotationOnMouseDown = targetRotation;

		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = ( event.clientY / window.innerHeight ) * 2 - 1;

		raycaster.setFromCamera(mouse, camera);


		var intersects = raycaster.intersectObjects( scene.children, true);

		if (intersects.length > 0) {

			console.log(intersects)

		}

	}

	function onDocumentMouseMove( event ) {

		mouseX = event.clientX - windowHalfX;

		// вычесляем куда куб должен повернутся
		targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) / 180;

		// округляем targetScale
		if (targetRotation < 0) {

			targetScale = Math.ceil(targetRotation/0.78);

		} else if (targetRotation >= 0) {

			targetScale = Math.floor(targetRotation/0.78);

		}

		// делаем четным числом targetScale
		if (targetScale % 2 != 0) {

			if (targetScale < 0) {

				targetScale--;

			} else if (targetScale > 0) {

				targetScale++;

			}

		}

		// применяем положение куба
		cube.rotation.y = targetRotation;
	}

	function onDocumentMouseUp( event ) {

		document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
		document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

		// анимимруем до нужного положения
		cubeAnim();

	}

	function onDocumentMouseOut( event ) {

		document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
		document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

		// анимимруем до нужного положения
		cubeAnim();

	}

	function onDocumentTouchStart( event ) {


		if ( event.touches.length === 1 ) {

			event.preventDefault();

			// какие то вычисления для положения курсора
			mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
			targetRotationOnMouseDown = targetRotation;

			document.addEventListener( 'touchmove', onDocumentTouchMove, false );
			document.addEventListener( 'touchend', onDocumentTouchEnd, false );
			document.addEventListener( 'touchcancel', onDocumentTouchEnd, false );

		}

	}

	function onDocumentTouchMove( event ) {

		if ( event.touches.length === 1 && lock == true) {

			event.preventDefault();

			mouseX = event.touches[ 0 ].pageX - windowHalfX;

			// вычесляем куда куб должен повернутся
			targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) / 360;

			// округляем targetScale
			if (targetRotation < 0) {

				targetScale = Math.ceil(targetRotation/0.78);

			} else if (targetRotation >= 0) {

				targetScale = Math.floor(targetRotation/0.78);

			}

			// делаем четным числом targetScale
			if (targetScale % 2 != 0) {

				if (targetScale < 0) {

					targetScale--;

				} else if (targetScale > 0) {

					targetScale++;

				}

			}

			// применяем положение куба
			cube.rotation.y = targetRotation;

		}

	}

	function onDocumentTouchEnd( event ) {

		if (event.touches.length === 0) {

			document.removeEventListener( 'touchmove', onDocumentMouseMove, false );
			document.removeEventListener( 'touchend', onDocumentTouchEnd, false );
			document.removeEventListener( 'touchcancel', onDocumentTouchEnd, false );

			// анимимруем до нужного положения
			cubeAnim();
		}
	}

	function cubeAnim() {
		var position = {y: cube.rotation.y};
		var tween = new TWEEN.Tween(position);

		cube.rotation.y = null;

		tween.to({y: Math.PI/4*targetScale}, 250);
		tween.start();
		tween.onUpdate(function(object) {
			cube.rotation.y = position.y
		});
		tween.onStart(function() {
			document.removeEventListener( 'mousedown', onDocumentMouseDown, false );
			document.removeEventListener( 'touchmove', onDocumentTouchMove, false );
		});
		tween.easing(TWEEN.Easing.Quartic.Out)
		tween.onComplete(function() {
			cube.rotation.y = Math.PI/4*targetScale;
			targetRotation = cube.rotation.y;
			document.addEventListener( 'mousedown', onDocumentMouseDown, false );
			document.addEventListener( 'touchmove', onDocumentTouchMove, false );
		});
	}

	//

	function animate() {

		requestAnimationFrame( animate );
		render();

	}

	function render() {

		TWEEN.update();
		renderer.render( scene, camera );

	}


	init();
})();