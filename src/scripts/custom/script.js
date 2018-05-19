(function() {
	//
	var container;

	var camera, scene, renderer;
	var cube, plane;
	var raycaster, mouse;

	var cubeBottom = {
		name: 'Bottom',
		position: {
			y: 0
		},
		side: {
			left: new THREE.TextureLoader().load( '../img/c1.jpg' ),
			right: new THREE.TextureLoader().load( '../img/c2.jpg' ),
			top: 0xf0f0f0,
			bottom: 0xf0f0f0,
			front: new THREE.TextureLoader().load( '../img/c5.jpg' ),
			back: new THREE.TextureLoader().load( '../img/c6.jpg' ),
		},
	}
	var cubeMiddle = {
		name: 'Middle',
		position: {
			y: 225
		},
		side: {
			left: new THREE.TextureLoader().load( '../img/b1.jpg' ),
			right: new THREE.TextureLoader().load( '../img/b2.jpg' ),
			top: 0xf0f0f0,
			bottom: 0xf0f0f0,
			front: new THREE.TextureLoader().load( '../img/b5.jpg' ),
			back: new THREE.TextureLoader().load( '../img/b6.jpg' ),
		},
	}
	var cubeTop = {
		name: 'Top',
		position: {
			y: 450
		},
		side: {
			left: new THREE.TextureLoader().load( '../img/a1.jpg' ),
			right: new THREE.TextureLoader().load( '../img/a2.jpg' ),
			top: 0xf0f0f0,
			bottom: 0xf0f0f0,
			front: new THREE.TextureLoader().load( '../img/a5.jpg' ),
			back: new THREE.TextureLoader().load( '../img/a6.jpg' ),
		},
	}

	var cubesArr = [
		cubeTop,
		cubeMiddle,
		cubeBottom
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
		camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.y = 225;
		camera.position.z = 900;

		// create scene
		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xf0f0f0 );

		var left = new THREE.TextureLoader().load( '../img/a1.jpg' );
		var right = new THREE.TextureLoader().load( '../img/a2.jpg' );
		var top = 0x465596;
		var bottom = 0x465596;
		var front = new THREE.TextureLoader().load( '../img/a5.jpg' );
		var back = new THREE.TextureLoader().load( '../img/a6.jpg' );

		// create Cubes

		for ( var j = 0; j < cubesArr.length; j++) {
			var item = cubesArr[j];
			var geometry = new THREE.BoxGeometry( 700, 200, 700 );

			for ( var i = 0; i < geometry.faces.length; i += 2 ) {

				// var hex = Math.random() * 0xffffff;
				geometry.faces[ i ].color.setHex( item.color );
				geometry.faces[ i + 1 ].color.setHex( item.color );

			}

			var material = [

				new THREE.MeshBasicMaterial( { map: item.side.left } ),
				new THREE.MeshBasicMaterial( { map: item.side.right } ),
				new THREE.MeshBasicMaterial( { color: item.side.top } ),
				new THREE.MeshBasicMaterial( { color: item.side.bottom } ),
				new THREE.MeshBasicMaterial( { map: item.side.front } ),
				new THREE.MeshBasicMaterial( { map: item.side.back } )

			];

			cube = new THREE.Mesh( geometry, material );
			cube.position.y = item.position.y;
			cube.position.z = -200;
			cube.name = item.name;
			scene.add( cube );
		}

		// ray
		raycaster = new THREE.Raycaster();
		mouse = new THREE.Vector2();

		// render
		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth - 4, window.innerHeight - 4 );
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

		renderer.setSize( window.innerWidth - 4, window.innerHeight - 4 );

	}

	//

	function onDocumentMouseDown( event ) {

		event.preventDefault();

		tween.stop();

		// какие то вычисления для положения курсора
		mouseXOnMouseDown = event.clientX - windowHalfX;

		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);

		var intersects = raycaster.intersectObjects( scene.children, true);

		if (intersects.length > 0) {

			cube = intersects[0].object;

			targetRotationOnMouseDown = targetRotation = cube.rotation.y;

			setRotationScale(targetRotation);

			document.addEventListener( 'mousemove', onDocumentMouseMove, false );
			document.addEventListener( 'mouseup', onDocumentMouseUp, false );
			document.addEventListener( 'mouseout', onDocumentMouseOut, false );

		} else {

			cube = null;

		}

	}

	var prevAngle = 0;
	function onDocumentMouseMove( event ) {
		var fixedAngle =  Math.PI/4*targetScale;

		mouseX = event.clientX - windowHalfX;

		// вычесляем куда куб должен повернутся
		targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) / (360);

		setRotationScale(targetRotation);

		if (fixedAngle !== prevAngle) {
			console.log(prevAngle, fixedAngle);
		}

		// применяем положение куба
		cube.rotation.y = targetRotation;


		prevAngle = fixedAngle;

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

			console.log(event.touches[0].pageX)

			tween.stop();

			// какие то вычисления для положения курсора
			mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;

			mouse.x = ( event.touches[0].pageX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( event.touches[0].pageY / window.innerHeight ) * 2 + 1;

			raycaster.setFromCamera(mouse, camera);

			var intersects = raycaster.intersectObjects( scene.children, true);

			if (intersects.length > 0) {

				cube = intersects[0].object;

				targetRotationOnMouseDown = targetRotation = cube.rotation.y;

				setRotationScale(targetRotation);

				document.addEventListener( 'touchmove', onDocumentTouchMove, false );
				document.addEventListener( 'touchend', onDocumentTouchEnd, false );
				document.addEventListener( 'touchcancel', onDocumentTouchEnd, false );

			} else {

				cube = null;

			}

		}

	}

	function onDocumentTouchMove( event ) {

		if ( event.touches.length === 1) {

			event.preventDefault();

			mouseX = event.touches[ 0 ].pageX - windowHalfX;

			// вычесляем куда куб должен повернутся
			targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) / 360;

			setRotationScale(targetRotation);

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

		tween = new TWEEN.Tween(position);
		cube.rotation.y = null;

		tween.to({y: Math.PI/4*targetScale}, 850);
		tween.start();
		tween.onUpdate(function(object) {
			cube.rotation.y = position.y
		});
		tween.easing(TWEEN.Easing.Quartic.Out)
		tween.onComplete(function() {
			cube.rotation.y = Math.PI/4*targetScale;
			targetRotation = cube.rotation.y;
		});
	}

	function setRotationScale(targetRotation) {
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
	};

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