$(function() {
	var container, stats;

	var lock = true;

	var camera, scene, renderer;

	var cube, plane;

	var targetRotation = 0;
	var targetRotationOnMouseDown = 0;
	var targetScale = 0; // нужен для анимации после touchend или mouseup

	var mouseX = 0;
	var mouseXOnMouseDown = 0;

	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	var position;
	var tween = new TWEEN.Tween();

	init();
	animate();

	function init() {

		container = document.createElement( 'div' );
		document.body.appendChild( container );

		var info = document.createElement( 'div' );
		info.style.position = 'absolute';
		info.style.top = '10px';
		info.style.width = '100%';
		info.style.textAlign = 'center';
		info.innerHTML = 'Drag to spin the cube';
		container.appendChild( info );

		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.y = 150;
		camera.position.z = 500;

		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xf0f0f0 );


		// Cube

		var geometry = new THREE.BoxGeometry( 200, 200, 200 );

		for ( var i = 0; i < geometry.faces.length; i += 2 ) {

			var hex = Math.random() * 0xffffff;
			geometry.faces[ i ].color.setHex( hex );
			geometry.faces[ i + 1 ].color.setHex( hex );

		}

		var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, overdraw: 0.5 } );

		cube = new THREE.Mesh( geometry, material );
		cube.position.y = 150;
		scene.add( cube );

		// Plane

		var geometry = new THREE.PlaneBufferGeometry( 200, 200 );
		geometry.rotateX( - Math.PI / 2 );

		var material = new THREE.MeshBasicMaterial( { color: 0xe0e0e0, overdraw: 0.5 } );

		plane = new THREE.Mesh( geometry, material );
		scene.add( plane );

		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( renderer.domElement );

		document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		document.addEventListener( 'touchstart', onDocumentTouchStart, false );

		//

		window.addEventListener( 'resize', onWindowResize, false );

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
		plane.rotation.y = cube.rotation.y = targetRotation;
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
			plane.rotation.y = cube.rotation.y = targetRotation;

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

		plane.rotation.y = cube.rotation.y = null;

		tween.to({y: Math.PI/4*targetScale}, 250);
		tween.start();
		tween.onUpdate(function(object) {
			plane.rotation.y = cube.rotation.y = position.y
		});
		tween.onStart(function() {
			document.removeEventListener( 'mousedown', onDocumentMouseDown, false );
			document.removeEventListener( 'touchmove', onDocumentTouchMove, false );
		});
		tween.easing(TWEEN.Easing.Quartic.Out)
		tween.onComplete(function() {
			plane.rotation.y = cube.rotation.y = Math.PI/4*targetScale;
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
});