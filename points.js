document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('touchstart', onMouseDown, false);

var selectedDatums = [];
var selectedDatums_tt = [];
var multipleSelectionMode = false;

// on mouse down, translate cursor coordinates to three.js coords, and check any intersections with any points
function onMouseDown(event){
    if (event.type === 'touchstart') {
        event.preventDefault();
        event.stopPropagation();
    }

    let mouseVector = new THREE.Vector3(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        1);
    let mouse_position = [(event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1];
    checkIntersects(mouseVector, mouse_position);
}

// given a mouse vector [x, y], checks for any objects intersected using raycasting
// if intersects an object, highlights the closest point and shows the tooltip of the point
// otherwise, removes any highlights of points and hides the tooltip
function checkIntersects(mouse_vector, mouse_position) {
    raycaster.setFromCamera(mouse_vector, camera);
    let intersects = raycaster.intersectObject(points);

    if(multipleSelectionMode){
        if (intersects[0]) {
            let sorted_intersects = sortIntersectsByDistanceToRay(intersects); // sort the intersected objects
            let intersect = sorted_intersects[0]; // use the closest intersect
            let index = intersect.index;
            let datum = generated_points[index];
            let datum_tt = exoplanetData[index];

            selectedDatums.push(datum);
            selectedDatums_tt.push(datum_tt);

            console.log(selectedDatums_tt);
    
            highlightPoint(datum, index);
            

            if(selectedDatums_tt.length == 2){
                showTooltip2(mouse_position, selectedDatums_tt[1], index);
                showTooltip(mouse_position, selectedDatums_tt[0], index);
            }
            else{
                hideTooltip2();
                showTooltip(mouse_position, datum_tt, index);
            }
        }
    }
    else{
        if (intersects[0]) {
            let sorted_intersects = sortIntersectsByDistanceToRay(intersects); // sort the intersected objects
            let intersect = sorted_intersects[0]; // use the closest intersect
            let index = intersect.index;
            let datum = generated_points[index];
            let datum_tt = exoplanetData[index];
    
            highlightPoint(datum, index);
            showTooltip(mouse_position, datum_tt, index);

        } else {
            removeHighlights();
            hideMainTooltip();
        }
    }
    
}

// sorts all of the given intersected objects
function sortIntersectsByDistanceToRay(intersects) {
    return _.sortBy(intersects, "distanceToRay");
}


// -------- Tooltip functions ---------


// Initial tooltip state
let tooltip_state = { display: "none" }

// create tooltip html attributes
let tooltip_template = document.createRange().createContextualFragment(
`<div id="tooltip" style="border-right: 6px solid #00257c; border-bottom: 6px solid #00257c; display: none; position: absolute; font-size: 13px; width: 280px; text-align: center; line-height: 1; padding: 6px; background: white; font-family: sans-serif;">
    <div id="name_tip" style="text-decoration: underline; text-align: center; padding: 4px; margin-bottom: 4px;"></div>
    <div id="discovery_tip" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
    <div id="distance_tip" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
    <div id="radius_tip" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
    <div id="temp_tip" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
    <div id="inclination_tip" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
    <div id="RA_tip" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
    <div id="dec_tip" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
    
</div>`);
document.body.append(tooltip_template);



// update the tooltip's attributes when necessary
let $tooltip = document.querySelector('#tooltip');
let $name_tip = document.querySelector('#name_tip');
let $discovery_tip = document.querySelector('#discovery_tip');
let $distance_tip = document.querySelector('#distance_tip');
let $radius_tip = document.querySelector('#radius_tip');
let $temp_tip = document.querySelector('#temp_tip');
let $inclination_tip = document.querySelector('#inclination_tip');
let $RA_tip = document.querySelector('#RA_tip');
let $dec_tip = document.querySelector('#dec_tip');
// let $cart_tip = document.querySelector('#cart_tip');

// update tooltip content using jquery
function updateTooltip() {
    $tooltip.style.display = tooltip_state.display;
    $tooltip.style.left = tooltip_state.left + 'px';
    $tooltip.style.top = tooltip_state.top + 'px';
    
    if(selectedDatums_tt.length == 2){
        $name_tip.innerText = "Exoplanet 1 Name: " + tooltip_state.name;
    }
    else if(selectedDatums_tt.length > 2){
        $name_tip.innerText = "Averages of Selected Exoplanets' Data";
    }
    else{
        $name_tip.innerText = "Exoplanet Name: " + tooltip_state.name;
    }
    
    if(selectedDatums_tt.length == 2){
        $discovery_tip.innerText = "Discovery Method: " + tooltip_state.discovery;
    }
    else if(selectedDatums_tt.length > 2){
        $discovery_tip.innerText = "";
    }
    else{
        $discovery_tip.innerText = "Discovery Method: " + tooltip_state.discovery;
    }


    if(selectedDatums_tt.length > 2){
        $distance_tip.innerText = "Avg Distance (Parsecs): " + tooltip_state.distance;
    }
    else{
        $distance_tip.innerText = "Distance (Parsecs): " + tooltip_state.distance;
    }

    if(selectedDatums_tt.length > 2){
        $radius_tip.innerText = "Avg Jupiter Radius: " + tooltip_state.radius;
    }
    else{
        $radius_tip.innerText = "Jupiter Radius: " + tooltip_state.radius;
    }

    if(selectedDatums_tt.length > 2){
        $temp_tip.innerText = "Avg Effective Temp (K): " + tooltip_state.temp;
    }
    else{
        $temp_tip.innerText = "Effective Temperature (K): " + tooltip_state.temp;
    }

    if(selectedDatums_tt.length > 2){
        $inclination_tip.innerText = "Avg Inclination (Degrees): " + tooltip_state.inclination;
    }
    else{
        $inclination_tip.innerText = "Inclination (Degrees): " + tooltip_state.inclination;
    }

    if(selectedDatums_tt.length > 2){
        $RA_tip.innerText = "Avg Right Ascension (Degrees): " + tooltip_state.ra;
    }
    else{
        $RA_tip.innerText = "Right Ascension (Degrees): " + tooltip_state.ra;
    }

    if(selectedDatums_tt.length > 2){
        $dec_tip.innerText = "Avg Declination (Degrees): " + tooltip_state.dec;
    }
    else{
        $dec_tip.innerText = "Declination (Degrees): " + tooltip_state.dec;
    }

    // if(selectedDatums_tt.length > 2){
    //     $cart_tip.innerText = "";
    // }
    // else{
    //     $cart_tip.innerText = "X: " + tooltip_state.cart[0] + ", Y: " + tooltip_state.cart[1] + ", Z: " + tooltip_state.cart[2];
    // }

    // $discovery_tip.innerText = "Discovery Method: " + tooltip_state.discovery;
    // $distance_tip.innerText = "Distance (Parsecs): " + tooltip_state.distance;
    // $radius_tip.innerText = "Jupiter Radius: " + tooltip_state.radius;
    // $temp_tip.innerText = "Effective Temperature: " + tooltip_state.temp;
    // $inclination_tip.innerText = "Inclination (Degrees): " + tooltip_state.inclination;
    // $RA_tip.innerText = "Right Ascension (Degrees): " + tooltip_state.ra;
    // $dec_tip.innerText = "Declination (Degrees): " + tooltip_state.dec;
}

// shows the tooltip at the given position and uses the given data
function showTooltip(mouse_position, datum, index) {
    if(selectedDatums_tt.length > 2){
        let avgDist = null;
        let avgRad = null;
        let avgTemp = null;
        let avgInclination = null;
        let avgRA = null;
        let avgDec = null;

        for(var i = 0; i < selectedDatums_tt.length; i++){
            avgDist += selectedDatums_tt[i].st_dist
            avgRad += selectedDatums_tt[i].pl_radj;
            avgTemp += selectedDatums_tt[i].st_teff;
            avgInclination += selectedDatums_tt[i].pl_orbincl;
            avgRA += selectedDatums_tt[i].ra;
            avgDec += selectedDatums_tt[i].dec;
        }
        avgDist = avgDist/selectedDatums_tt.length;
        avgRad = avgRad/selectedDatums_tt.length;
        avgTemp = avgTemp/selectedDatums_tt.length;
        avgInclination = avgInclination/selectedDatums_tt.length;
        avgRA = avgRA/selectedDatums_tt.length;
        avgDec = avgDec/selectedDatums_tt.length;
        
        tooltip_state.name = datum.pl_name;
        tooltip_state.discovery = datum.pl_discmethod;
        tooltip_state.distance = avgDist
        tooltip_state.radius = avgRad
        tooltip_state.temp = avgTemp
        tooltip_state.inclination = avgInclination
        tooltip_state.ra = avgRA
        tooltip_state.dec = avgDec
    }
    else{
        tooltip_state.name = datum.pl_name;
        tooltip_state.discovery = datum.pl_discmethod;
        tooltip_state.distance = datum.st_dist;
        tooltip_state.radius = datum.pl_radj;
        tooltip_state.temp = datum.st_teff;
        tooltip_state.inclination = datum.pl_orbincl;
        tooltip_state.ra = datum.ra;
        tooltip_state.dec = datum.dec;
        // tooltip_state.cart = cartesianCoords[index];
    }

    let tooltip_width = 120;
    let x_offset = -tooltip_width/2;
    let y_offset = 30;

    tooltip_state.display = "block";
    tooltip_state.left = mouse_position[0] + x_offset + 60;
    tooltip_state.top = mouse_position[1] + y_offset - 32;
    
    
    updateTooltip();
}


// Initial tooltip state
let tooltip_state2 = { display: "none" }

// create tooltip html attributes
let tooltip_template2 = document.createRange().createContextualFragment(
    `<div id="tooltip2" style="border-right: 6px solid #00257c; border-bottom: 6px solid #00257c; display: none; position: absolute; font-size: 13px; width: 280px; text-align: center; line-height: 1; padding: 6px; background: white; font-family: sans-serif;">
        <div id="name_tip2" style="text-decoration: underline; text-align: center; padding: 4px; margin-bottom: 4px;"></div>
        <div id="discovery_tip2" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
        <div id="distance_tip2" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
        <div id="radius_tip2" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
        <div id="temp_tip2" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
        <div id="inclination_tip2" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
        <div id="RA_tip2" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
        <div id="dec_tip2" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
        
        
</div>`);
document.body.append(tooltip_template2);

// update the tooltip's attributes when necessary
let $tooltip2 = document.querySelector('#tooltip2');
let $name_tip2 = document.querySelector('#name_tip2');
let $discovery_tip2 = document.querySelector('#discovery_tip2');
let $distance_tip2 = document.querySelector('#distance_tip2');
let $radius_tip2 = document.querySelector('#radius_tip2');
let $temp_tip2 = document.querySelector('#temp_tip2');
let $inclination_tip2 = document.querySelector('#inclination_tip2');
let $RA_tip2 = document.querySelector('#RA_tip2');
let $dec_tip2 = document.querySelector('#dec_tip2');
// let $cart_tip2 = document.querySelector('#cart_tip2');

// update tooltip content using jquery
function updateTooltip2() {
    $tooltip2.style.display = tooltip_state2.display;
    $tooltip2.style.left = tooltip_state2.left + 'px';
    $tooltip2.style.top = tooltip_state2.top + 'px';
    $name_tip2.innerText = "Exoplanet 2 Name: " + tooltip_state2.name;
    // $name_tip.style.background = color_array[tooltip_state.group];
    $discovery_tip2.innerText = "Discovery Method: " + tooltip_state2.discovery;
    $distance_tip2.innerText = "Distance (Parsecs): " + tooltip_state2.distance;
    $radius_tip2.innerText = "Jupiter Radius: " + tooltip_state2.radius;
    $temp_tip2.innerText = "Effective Temperature: " + tooltip_state2.temp;
    $inclination_tip2.innerText = "Inclination (Degrees): " + tooltip_state2.inclination;
    $RA_tip2.innerText = "Right Ascension (Degrees): " + tooltip_state2.ra;
    $dec_tip2.innerText = "Declination (Degrees): " + tooltip_state2.dec;
    // $cart_tip2.innerText = "X: " + tooltip_state.cart[0] + ", Y: " + tooltip_state.cart[1] + ", Z: " + tooltip_state.cart[2];
}

// shows the tooltip at the given position and uses the given data
function showTooltip2(mouse_position, datum, index) {
    let tooltip_width = 120;
    let x_offset = -tooltip_width/2;
    let y_offset = 30;
    tooltip_state2.display = "block";
    tooltip_state2.left = mouse_position[0] + x_offset + 60;
    tooltip_state2.top = mouse_position[1] + y_offset + 185;
    tooltip_state2.name = datum.pl_name;
    // tooltip_state.group = datum.group;
    tooltip_state2.discovery = datum.pl_discmethod;
    tooltip_state2.distance = datum.st_dist;
    tooltip_state2.radius = datum.pl_radj;
    tooltip_state2.temp = datum.st_teff;
    tooltip_state2.inclination = datum.pl_orbincl;
    tooltip_state2.ra = datum.ra;
    tooltip_state2.dec = datum.dec;
    updateTooltip2();
}

// hides the tool tip
function hideMainTooltip() {
    tooltip_state.display = "none";
    updateTooltip();
}

// hides the tool tip
function hideTooltip2() {
    tooltip_state2.display = "none";
    updateTooltip2();
}

// highlights a point, making its size bigger 
function highlightPoint(datum, index) {
    //console.log("index: " + index);

    if(!multipleSelectionMode) removeHighlights();
    
    
    let geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(
            datum.coords[0],
            datum.coords[1],
            datum.coords[2]
        )
    );
    if(!multipleSelectionMode) geometry.colors = [ pointColors[index] ];
    else geometry.colors = [ new THREE.Color(0xffffff) ];
    

    let currentZoom = getZoom();

    let size = 26;
    // console.log("zoom: " + currentZoom);
    // console.log("size: " + pointSizes[index]);

    let useAttenuation = true;

    if(!renderWithAttenuation){
        if(currentZoom >=0 && currentZoom <= 50){
            size = pointSizes[index] + 1;
        }
        else if(currentZoom > 50 && currentZoom <= 100){
            size = pointSizes[index] + 4;
        }
        else if(currentZoom > 100 && currentZoom <= 200){
            size = pointSizes[index] + 7;
        }
        else if(currentZoom > 200 && currentZoom <= 500){
            size = pointSizes[index] + 15;
        }
        else if(currentZoom > 500 && currentZoom <= 1000){
            size = pointSizes[index] + 30;
        }
        else{
            useAttenuation = false;
        }
    }
    else useAttenuation = false;
   
    

    let material = new THREE.PointsMaterial({
        size: size,
        sizeAttenuation: true,
        vertexColors: THREE.VertexColors,
        map: circle_sprite,
        transparent: true	
    });

    let attenuationMaterial = new THREE.PointsMaterial({
        size: 26,
        sizeAttenuation: false,
        vertexColors: THREE.VertexColors,
        map: circle_sprite,
        transparent: true	
    });

    material.alphaTest = 0.5;
    attenuationMaterial.alphaTest = 0.5;

    let point = null;
    
    if(useAttenuation){
        point = new THREE.Points(geometry, material);
    }
    else {
        point = new THREE.Points(geometry, attenuationMaterial);
    }

    hoverContainer.add(point);
}

function removeHighlights() {
    hoverContainer.remove(...hoverContainer.children);
    selectedDatums = [];
    selectedDatums_tt = [];
}

function getZoom(){
    return controls.target.distanceTo(controls.object.position);
}
