var camera, controls, scene, renderer; // base three.js 3D objects needed to render scene
var points; // three.js point cloud object
var color_array; // contains the color gradient
var generated_points = []; // contains the point values (x,y,z) of the exoplanets

color_array = [
    "#1f78b4",
    "#b2df8a",
    "#33a02c",
    "#fb9a99",
    "#e31a1c",
    "#fdbf6f",
    "#ff7f00",
    "#6a3d9a",
    "#cab2d6",
    "#ffff99"
];

circle_sprite= new THREE.TextureLoader().load(
    "https://fastforwardlabs.github.io/visualization_assets/circle-sprite.png",
    function(texture){
        var material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.5
        });
    }
);

function init() {

    // create scene and set its background color
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0,0,0.1);

    // create the scene lighting for earth
    var ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    // set render properties
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

    // create camera and set initial camera position
    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 400, 200, 0 );

    // create orbit controls
    controls = new THREE.OrbitControls( camera, renderer.domElement );

    controls.maxPolarAngle = Math.PI;
    controls.minDistance = 0;
    controls.maxDistance = 6500;

    // set control properties
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;

    controls.enableDamping = true;
    controls.dampingFactor = 0.2;

    controls.screenSpacePanning = false;

   

    

 
    // for debugging purposes, tests by adding random points

    // let point_num = 10000;
    // let radius = 2000;

    // // Random point in circle code from https://stackoverflow.com/questions/32642399/simplest-way-to-plot-points-randomly-inside-a-circle
    // function randomPosition(radius) {
    // 	var pt_angle = Math.random() * 2 * Math.PI;
    // 	var pt_radius_sq = Math.random() * radius * radius;
    // 	var pt_x = Math.sqrt(pt_radius_sq) * Math.cos(pt_angle);
    // 	var pt_y = Math.sqrt(pt_radius_sq) * Math.sin(pt_angle);
    // 	return [pt_x, pt_y];
    // }

    window.addEventListener( 'resize', onWindowResize, false );

}

// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// gets a random number between min and max
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

// converts degrees to radians
function degToRad(degrees){
    var pi = Math.PI;
    return degrees * (pi/180);
}

// converts radians to degrees
function radToDeg(rad){
    var pi = Math.PI;
    return rad * (180/pi);
}

// converts right ascension and declination values into (x, y, z) coordinates
// distance is in parsecs
// uses formulas from http://www.projectrho.com/public_html/starmaps/trigonometry.php
// and http://fmwriters.com/Visionback/Issue14/wbputtingstars.htm
function raDecToXYZ(ra, dec, distance){
    let phi = ra; // A // initially screwed this value up by multiplying it by 15, NASA already did that with the ra data value
    let theta = dec; // B
    let rho = distance; // C
    
    // (C * cos(B))
    let rVect = rho * Math.cos(degToRad(theta)); // gets the radian vector

    // (C * cos(B)) * cos(A)
    let x = rVect * Math.cos(degToRad(phi));

    // (C * cos(B)) * sin(A)
    let y = rVect * Math.sin(degToRad(phi));

    // C * sin(B)
    let z = rho * Math.sin(degToRad(theta));

    // console.log("X: " + x + ", Y: " + y + ", Z: " + z);
    return [parseFloat(x.toFixed(2)), parseFloat(y.toFixed(2)), parseFloat(z.toFixed(2))];
}

// when window resizes, moves the camera accordingly and changes the size of the render window
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

// animates the scene
// with control dampening on, also animates camera movement
function animate() {
    requestAnimationFrame( animate );

    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    render();
}

// renders the scene
function render() {
    renderer.render( scene, camera );
}

// adds the earth sphere object to the scene
function addEarth(scene){
    let earthGeometry = new THREE.SphereGeometry(1, 32, 32);
    let earthMaterial = new THREE.MeshPhongMaterial();
    earthMaterial.map = THREE.ImageUtils.loadTexture('images/earthmap1k.jpg');
    let earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);

    earthMesh.rotation.y = 1.5; // roughly the rotation needed to match earth texture with planet alignment in cartesian space
    scene.add(earthMesh);
}