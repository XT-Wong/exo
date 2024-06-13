document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('touchstart', onMouseDown, false);

var selectedDatums = [];
var selectedDatums_tt = [];
var multipleSelectionMode = false;

// on mouse down, translate cursor coordinates to three.js coords, and check any intersections with any points
function onMouseDown(event){

    let mouseVector = new THREE.Vector3(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        1);
    let mouse_position = [(event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1];
    checkIntersects(mouseVector, mouse_position);
}
function colormap(x) {
    const ratio = x;
    
    // 灰色 RGB (128, 128, 128)
    const gray = { r: 64, g: 64, b: 64 };
    
    // 绿色 RGB (0, 255, 0)
    const green = { r: 35, g: 70, b: 210 };

    // 计算线性插值
    const r = Math.round(gray.r * (1 - ratio) + green.r * ratio);
    const g = Math.round(gray.g * (1 - ratio) + green.g * ratio);
    const b = Math.round(gray.b * (1 - ratio) + green.b * ratio);
    
    // 返回十六进制颜色值
    const toHex = (value) => {
        const hex = value.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    // 返回十六进制颜色值
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function quarterAlphaColor(val){
    if (val < DensityQs[2]){
        return val/DensityQs[2]*0.2+0.2;
    }
    else if (val < DensityQs[3]){
        return (val - DensityQs[2])/(DensityQs[3] - DensityQs[2])*0.2 + 0.4;
    }
    else if (val < DensityQs[4]){
        return (val - DensityQs[3])/(DensityQs[4] - DensityQs[3])*0.2 + 0.6;
    }
    else{
        return (val - DensityQs[4])/(80 - DensityQs[4])*0.2 + 0.8;
    }


}
function twoColorHeatMap(val, minVal, maxVal, RGBa, RGBb){
    // if(val == null) return [255, 255, 0];

    let value = (val - minVal)/(maxVal - minVal);
    if (value > 1) value = 1;

    let aR = RGBa[0], aG = RGBa[1], aB = RGBa[2];
    let bR = RGBb[0], bG = RGBb[1], bB = RGBb[2];

    let finalRed = (bR - aR) * value + aR;
    let finalGreen = (bG - aG) * value + aG;
    let finalBlue = (bB - aB) * value + aB;

    return [finalRed, finalGreen, finalBlue];
}
// given a mouse vector [x, y], checks for any objects intersected using raycasting
// if intersects an object, highlights the closest point and shows the tooltip of the point
// otherwise, removes any highlights of points and hides the tooltip
function checkIntersects(mouse_vector, mouse_position) {
    raycaster.setFromCamera(mouse_vector, camera);
    let intersects = raycaster.intersectObject(points);
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
        //hideMainTooltip();
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
`<div id="tooltip" style="border-right: 0px solid #000000; border-bottom: 0px solid #00257c; display: none; position: absolute; font-size: 12px; width: 320px; text-align: center; line-height: 1; padding: 6px; background: rgba(0,0,0,0.3); color:white; overflow: auto; max-height: 800px; font-family: sans-serif;">
    <div id="name_tip" style="text-decoration: underline; text-align: center; padding: 4px; margin-bottom: 4px;font-size: 14px; font-weight: bold;"></div>
    <div id="distance_tip" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
    <div id="radius_tip" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
    <div id="temp_tip" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
    <div id="star_tip" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
    <div id="sibling_tip" style="text-align: left; padding: 4px; margin-bottom: 4px;"></div>
    
</div>`);
document.body.append(tooltip_template);
// update the tooltip's attributes when necessary
let $tooltip = document.querySelector('#tooltip');
let $name_tip = document.querySelector('#name_tip');
let $distance_tip = document.querySelector('#distance_tip');
let $radius_tip = document.querySelector('#radius_tip');
let $temp_tip = document.querySelector('#temp_tip');
let $star_tip = document.querySelector('#star_tip');
let $sibling_tip = document.querySelector('#sibling_tip');
// let $cart_tip = document.querySelector('#cart_tip');

// update tooltip content using jquery
function updateTooltip() {
    $tooltip.style.display = tooltip_state.display;
    $tooltip.style.left = tooltip_state.left + 'px';
    $tooltip.style.top = tooltip_state.top + 'px';
    $name_tip.innerText = "Star Name: " + tooltip_state.name;    
    $distance_tip.innerText = "Distance (Parsecs): " + tooltip_state.distance;
    $radius_tip.innerText = "Radius (AU): " + tooltip_state.radius;
    $temp_tip.innerText = "Effective Temperature (K): " + tooltip_state.temp;
    $star_tip.innerText = "Stars: " + tooltip_state.starcnt;
    $sibling_tip.innerText = "Planets: " + tooltip_state.sibcnt;

    Object.keys(tooltip_state).forEach((key) => {

        
        if (key.startsWith('planet'))
        {
            //console.log(key);
            if(parseInt(key.slice(6)) < tooltip_state.discovered_planets) {
                let $planet_tip = document.querySelector('#' + key + '_tip');
                if (!$planet_tip) {
                    $planet_tip = document.createElement('div');
                    $planet_tip.id = key + '_tip';
                    $planet_tip.style.lineHeight = '1.5';
                    $tooltip.appendChild($planet_tip);
                    //行距4px
                    $planet_tip.style.textAlign = 'left';
                    $planet_tip.style.padding = '4px';
                    $planet_tip.style.marginBottom = '4px';
                }
                else{
                    $planet_tip.style.display = 'block';
                }
                
                let $ball = document.createElement('span');
                $ball.style.display = 'inline-block';
                $ball.style.width = '5px';
                $ball.style.height = '5px';
                
                $ball.style.borderRadius = '50%';
                $ball.style.backgroundColor = 'white';
                $ball.style.marginRight = '10px';
                
                let $ball_right = document.createElement('span');
                $ball_right.style.display = 'inline-block';
                $ball_right.id = 'ball'+key.slice(6);
                
                $ball_right.style.width = (Math.pow(tooltip_state[key].pl_radj,2/3) * 30) + 'px';
                $ball_right.style.height = $ball_right.style.width;
                $ball_right.style.borderRadius = '50%';
                $ball_right.style.backgroundColor = colormap(tooltip_state[key].esi);
                //console.log(colormap(tooltip_state[key].esi),tooltip_state[key].esi);
                $ball_right.style.position = 'absolute'; // 设置$ball_right为绝对定位
                $ball_right.style.left = '270px'; // 设置$ball_right的右边距
                $ball_right.style.top = (220+parseInt(key.slice(6))*156)+'px'; // 设置$ball_right的上边距
                $ball_right.style.transform = 'translate(-50%, -50%)'; 
                //透明度与密度线性相关，最小透明度为0.3，最大透明度为1，密度最小值为2，最大值为80
                //$ball_right.style.opacity = ((tooltip_state[key].pl_dens-2)/78*0.7 + 0.3);
                //增加onclick事件，让全局变量PlanetofInterest等于tooltip_state.idx
                
                $planet_tip.innerHTML = '';
                $planet_tip.appendChild($ball);
                
                let nameNode = document.createElement('span');
                //nameNode.style.paddingLeft = '4px';
                nameNode.appendChild(document.createTextNode(tooltip_state[key].pl_name));
                $planet_tip.appendChild(nameNode);
                
                //第二行添加显示行星半径，换行,行距为6px
                $planet_tip.appendChild(document.createElement('br'));
                let radiusNode = document.createElement('span');
                radiusNode.style.paddingLeft = '12px';
                radiusNode.appendChild(document.createTextNode(' Earth Radius: ' + tooltip_state[key].pl_rade));
                $planet_tip.appendChild(radiusNode);
               
                //第三行显示行星轨道周期
                $planet_tip.appendChild(document.createElement('br'));
                let periodNode = document.createElement('span');
                periodNode.style.paddingLeft = '12px';
                periodNode.appendChild(document.createTextNode(' Orbital Period: ' + tooltip_state[key].pl_orbper.toFixed(2) + ' days'));
                $planet_tip.appendChild(periodNode);
                
                //第四行显示发现年份
                $planet_tip.appendChild(document.createElement('br'));
                let yearNode = document.createElement('span');
                yearNode.style.paddingLeft = '12px';
                yearNode.appendChild(document.createTextNode(' Discovery Time: ' + tooltip_state[key].disc_pubdate));
                $planet_tip.appendChild(yearNode);
                $planet_tip.appendChild($ball_right);
                //第五行显示发现方法
                $planet_tip.appendChild(document.createElement('br'));
                let methodNode = document.createElement('span');
                methodNode.style.paddingLeft = '12px';
                methodNode.appendChild(document.createTextNode(' Discovery Method: ' + tooltip_state[key].discoverymethod));
                $planet_tip.appendChild(methodNode);
                

                //第六行显示行星温度
                $planet_tip.appendChild(document.createElement('br'));
                let tempNode = document.createElement('span');
                tempNode.style.paddingLeft = '12px';
                tempNode.appendChild(document.createTextNode(' Effective Temperature: ' + tooltip_state[key].pl_eqt + ' K'));
                $planet_tip.appendChild(tempNode);
                //$planet_tip.appendChild(document.createTextNode(tooltip_state[key].pl_name + ' Jupiter Radius: ' + tooltip_state[key].pl_radj + ' Orbital Period: ' + tooltip_state[key].pl_orbper.toFixed(2) + ' days'));
                //show planet density
                //$planet_tip.appendChild(document.createElement('br'));
                //let densityNode = document.createElement('span');
                //densityNode.style.paddingLeft = '12px';
                //densityNode.appendChild(document.createTextNode(' Density: ' + tooltip_state[key].pl_dens + ' g/cm^3'));
                //$planet_tip.appendChild(densityNode);
                
                $planet_tip.appendChild(document.createElement('br'));
                let massNode = document.createElement('span');
                massNode.style.paddingLeft = '12px';
                massNode.appendChild(document.createTextNode(' Earth Mass: ' + tooltip_state[key].pl_bmasse));
                $planet_tip.appendChild(massNode);
                //第七行显示d.esi
                $planet_tip.appendChild(document.createElement('br'));
                let esiNode = document.createElement('span');
                esiNode.style.paddingLeft = '12px';
                esiNode.appendChild(document.createTextNode(' Earth Similarity: ' + tooltip_state[key].esi));
                $planet_tip.appendChild(esiNode);

            }
            else{
                //console.log('hide planet tip',key);
                let $planet_tip = document.querySelector('#' + key + '_tip');
                $planet_tip.style.display = 'none';
            
             }
             
    }

    
    });
   //console.log(tooltip_state.discovered_planets);
    for(let i = 0; i < tooltip_state.discovered_planets; i++){
        let $ball_right = document.getElementById('ball'+i);
        //console.log($ball_right);
        $ball_right.onclick = function(){
            PlanetofInterest = tooltip_state['idx'+i];
            console.log(PlanetofInterest); 
        }
    }
}

// shows the tooltip at the given position and uses the given data
function showTooltip(mouse_position, datum, index) {
   
    
        tooltip_state.name = datum.hostname;
        tooltip_state.distance = datum.sy_dist;
        tooltip_state.radius = datum.st_rad;
        tooltip_state.temp = datum.st_teff;
        tooltip_state.starcnt = datum.sy_snum;
        tooltip_state.sibcnt = datum.sy_pnum;
        
        // tooltip_state.cart = cartesianCoords[index];
    
        //
        //console.log(datum.planets);
        datum.planets.forEach((planetIndex, i) => {
            // 为每个planet创建一个新的tooltip属性
            tooltip_state['planet' + i] = filtered_RawplanetData[planetIndex];
            tooltip_state['idx' + i] = planetIndex;
            //console.log(tooltip_state['planet' + i]);
        });
    tooltip_state.discovered_planets = datum.planets.length;
    tmp = datum.planets.length;
    //console.log(datum.planets);
    let tooltip_width = 120;
    let x_offset = -tooltip_width/2;
    let y_offset = 30;
    // 删除多余的tooltip属性

    tooltip_state.display = "block";
    tooltip_state.left = mouse_position[0] + x_offset + 60;
    tooltip_state.top = mouse_position[1] + y_offset - 32;
    
    
    updateTooltip();
}

// hides the tool tip
function hideMainTooltip() {
    tooltip_state.display = "none";
    updateTooltip();
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
    console.log("zoom:",currentZoom);
    let useAttenuation = true;

    
    if(currentZoom >=0 && currentZoom <= 50){
        size = pointSizes[index]*1.4;
    }
    else if(currentZoom > 50 && currentZoom <= 100){
        size = pointSizes[index]*1.6;
    }
    else if(currentZoom > 100 && currentZoom <= 200){
        size = pointSizes[index]*1.8;
    }
    else if(currentZoom > 200 && currentZoom <= 500){
        size = pointSizes[index]*2;
    }
    else if(currentZoom > 500 && currentZoom <= 1000){
        size = pointSizes[index]*2.2;
    }
    else{
        size = pointSizes[index]*(1.4+currentZoom/1000);
    }
    //console.log("size:",size);
    
   
    

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
