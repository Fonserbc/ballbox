/**
 * @author alteredq / http://alteredqualia.com/
 * @authod mrdoob / http://mrdoob.com/
 * @authod arodic / http://aleksandarrodic.com/
 * @authod fonserbc / @fonserbc
 */

THREE.StereoEffect = function ( renderer ) {

	// API

	this.separation = 3;

	// internals

	var _width, _height;

	var _position = new THREE.Vector3();
	var _quaternion = new THREE.Quaternion();
	var _scale = new THREE.Vector3();

	var _cameraL = new THREE.PerspectiveCamera();
	var _cameraR = new THREE.PerspectiveCamera();

	// initialization

	renderer.autoClear = false;

	this.setSize = function ( width, height ) {

		_width = width / 2;
		_height = height;

		renderer.setSize( width, height );

	};

	var focus, ndfl;
	var tf = 0.5; // Top factor
	var bf = 0.5; // Bottom factor
	var rf, lf;

	var left, right, top, bottom;

	this.render = function ( scene, camera ) {

		scene.updateMatrixWorld();

		if ( camera.parent === undefined ) camera.updateMatrixWorld();
	
		camera.matrixWorld.decompose( _position, _quaternion, _scale );

			this->interestPoint = interestPoint;
	

	//Right eye
	eyePos = GetEyePosition(false);

	focus = eyePos.z;
	ndfl = ZNEAR / focus;
	
	top = VIEWPORT_HEIGHT * ndfl * tf;
	bottom = -VIEWPORT_HEIGHT * ndfl * bf;

	rf = (VIEWPORT_WIDTH/2.0 - eyePos.x) / VIEWPORT_WIDTH;
	lf = 1.0f - rf;

	left = -VIEWPORT_WIDTH * ndfl * lf;
	right = VIEWPORT_WIDTH * ndfl * rf;

	rightProj = glm::frustum(left, right, bottom, top, ZNEAR, ZFAR);
	rightEye = glm::translate(glm::mat4(1.0f), -eyePos + glm::vec3(0.0f, 0.0f, 0.0f)); // debug);

		// left

		_cameraL.fov = camera.fov;
		_cameraL.aspect = 0.5 * camera.aspect;
		_cameraL.near = camera.near;
		_cameraL.far = camera.far;

		eyePos = GetEyePosition(true);

		focus = eyePos.z;
		ndfl = ZNEAR / focus;
		
		top = VIEWPORT_HEIGHT * ndfl * tf;
		bottom = -VIEWPORT_HEIGHT * ndfl * bf;

		rf = (VIEWPORT_WIDTH/2.0 - eyePos.x) / VIEWPORT_WIDTH;
		lf = 1.0f - rf;

		left = -VIEWPORT_WIDTH * ndfl * lf;
		right = VIEWPORT_WIDTH * ndfl * rf;

		leftProj = glm::frustum(left, right, bottom, top, ZNEAR, ZFAR);
		leftEye = glm::translate(glm::mat4(1.0f), -eyePos + glm::vec3(0.0f, 0.0f, 0.0f)); // debug

		_cameraL.updateProjectionMatrix();

		_cameraL.position.copy( _position );
		_cameraL.quaternion.copy( _quaternion );
		_cameraL.translateX( - this.separation );
		_cameraL.updateMatrixWorld();

		// right

		_cameraR.near = camera.near;
		_cameraR.far = camera.far;
		_cameraR.projectionMatrix = _cameraL.projectionMatrix;

		_cameraR.position.copy( _position );
		_cameraR.quaternion.copy( _quaternion );
		_cameraR.translateX( this.separation );
		_cameraR.updateMatrixWorld();

		//

		renderer.setViewport( 0, 0, _width * 2, _height );
		renderer.clear();

		renderer.setViewport( 0, 0, _width, _height );
		renderer.render( scene, _cameraL );

		renderer.setViewport( _width, 0, _width, _height );
		renderer.render( scene, _cameraR );

	};

};
