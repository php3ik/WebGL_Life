"use strict";
// ---------------------------------------------
// Перевірим чи підтримує браузер WebGL
if (!Detector.webgl) Detector.addGetWebGLMessage();
// ---------------------------------------------

// ---------------------------------------------
// оголошуєм глобальні змінні
// ---------------------------------------------
var container, controls, stats;
var camera, scene, renderer;
var projector, plane, Wire, renderingGeometry;
var mouse2D, raycaster;
var isShiftDown = false, isCtrlDown = 0;
var TorGeomerty, PlaneGeometry;
var objects = [];
var tmpVec = new THREE.Vector3();
var materials;
var i, intersector;
var geometries = [];
var gui;

var interval = 5000;
var last_t = 1, t;
var current = 0;
var next = {}
    next.shape = 0;

var loadString = '{"2939":100,"2940":100,"3038":100,"3042":100,"3122":100,"3123":100,"3137":100,"3143":100,"3215":100,"3216":100,"3217":100,"3222":100,"3223":100,"3237":100,"3241":100,"3243":100,"3244":100,"3247":100,"3248":100,"3314":100,"3315":100,"3316":100,"3317":100,"3318":100,"3325":100,"3326":100,"3337":100,"3343":100,"3347":100,"3348":100,"3413":100,"3415":100,"3419":100,"3425":100,"3426":100,"3427":100,"3438":100,"3442":100,"3513":100,"3514":100,"3518":100,"3525":100,"3526":100,"3539":100,"3540":100,"3622":100,"3623":100,"3633":100,"3635":100,"3722":100,"3723":100,"3734":100,"3735":100,"3834":100}'


init();
animate();

function init() {
    // ---------------------------------------------
    // створюєм робочий контейнер для виводу
    container = document.createElement('div');
    document.body.appendChild(container);
    // ---------------------------------------------
    // додаєм камеру
    camera = new THREE.CombinedCamera(window.innerWidth, window.innerHeight, 45, 1, 10000, -2000, 10000);
    camera.position.x = 0;
    camera.position.y = 1500;
    camera.position.z = 0;
    // ---------------------------------------------
    // додаєм кекування камерою
    controls = new THREE.OrbitControls(camera);
    controls.rotateSpeed = 5.0;
    controls.zoomSpeed = 5;
    controls.panSpeed = 2;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    // ---------------------------------------------
    // створюєм сцену
    scene = new THREE.Scene();
    // додаєм проекторну матрицю для кліків
    projector = new THREE.Projector();
    // ---------------------------------------------
    // створюєм площини для гри
    var geometry;
    // ---------------------------------------------
    // площина
    geometry = new THREE.PlaneGeometry(1500, 1500, Life.nRow, Life.nCol);
    geometries.push(geometry);
    // ---------------------------------------------
    // сфера
    var size = 500;

    function sphere(u, v) {
        u *= Math.PI;
        v *= 2 * Math.PI;

        var x = size * Math.sin(u) * Math.cos(v);
        var y = size * Math.sin(u) * Math.sin(v);
        var z = size * Math.cos(u);


        return new THREE.Vector3(x, y, z);
    }

    geometry = new THREE.ParametricGeometry(sphere, Life.nRow, Life.nCol);
    geometries.push(geometry);
    // ---------------------------------------------
    // тор
    geometry = new THREE.TorusGeometry(500, 400, Life.nRow, Life.nCol);
    geometries.push(geometry);
    // ---------------------------------------------
    // стартова площина
    renderingGeometry = new THREE.PlaneGeometry(1500, 1500, Life.nRow, Life.nCol);
    renderingGeometry.dynamic = true;


    //----------------------------------------------
    var k = 0;
    //створюєм об'єкт для збереження індексів клітинок
    renderingGeometry.names = {};
    //заповнюєм поле пустими клітинками
    for (var x = 0; x < Life.nRow; x++) {
        for (var y = 0; y < Life.nCol; y++) {

            renderingGeometry.faces[k].color.setRGB(Life.emptyCell, Life.emptyCell, Life.emptyCell);
            renderingGeometry.faces[k].nameID = x + '_' + y;
            renderingGeometry.names[x + '_' + y] = k;


            k++;
        }
    }

    //створюєм матеріали для площин
    //основний матеріал
    var triangleMaterial = new THREE.MeshLambertMaterial({ vertexColors:THREE.FaceColors, side:THREE.DoubleSide, blending:THREE.SubtractiveBlending });
    //матеріал сітки
    var wireMaterial = new THREE.MeshBasicMaterial({ vertexColors:THREE.FaceColors, color:0x000000, wireframe:true, opacity:0.8, side:THREE.DoubleSide, blending:THREE.SubtractiveBlending });
    //створюєм модель плошини з основним матеріалом
    plane = new THREE.Mesh(renderingGeometry, triangleMaterial);
    //створюєм модель плошини з матеріалом сітки
    Wire = new THREE.Mesh(renderingGeometry, wireMaterial);
    //задаєм параметри площин
    plane.dynamic = true;
    renderingGeometry.colorsNeedUpdate = true;
    renderingGeometry.dynamic = true;
    renderingGeometry.dirty = true;
    renderingGeometry.__dirtyColors = true;
    plane.overdraw = true;
    plane.castShadow = true;
    plane.receiveShadow = false;
    plane.rotation.x = -Math.PI / 2;
    Wire.rotation.x = plane.rotation.x;
    //додаєм площини в сцену
    scene.add(plane);
    scene.add(Wire);
    //додаєм площини в список об'єктів для кліків
    objects.push(plane);
    //створюэм парсер проекцій кліку на площину
    mouse2D = new THREE.Vector3(0, 100000, 0.5);

    //додаєм освітлення
    scene.add(new THREE.AmbientLight(0x111111));

    var directionalLight = new THREE.DirectionalLight(/*Math.random() * */ 0xffffff, 0.125);

    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;

    directionalLight.position.normalize();

    scene.add(directionalLight);

    //синхронізовуєм позицію джерела світла з камерою
    directionalLight.position = camera.position


    scene.add(new THREE.AmbientLight(0x222222, 0.004));

    var light = new THREE.SpotLight(0xffffff, 0.2, 1);
    light.position.set(1000, 1200, 100).normalize();
    ;

    light.castShadow = true;
    light.shadowMapWidth = 1924;
    light.shadowMapHeight = 1924;
    light.shadowMapDarkness = 0.05;
    //light.shadowCameraVisible = true;

    scene.add(light);

    // ---------------------------------------------
    // RENDERER


    renderer = new THREE.WebGLRenderer({
        antialias:true,
        preserveDrawingBuffer:true
    });
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.setClearColorHex(0x020729, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "relative";
    container.appendChild(renderer.domElement);

    //додаєм лічильник FPS
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('keyup', onDocumentKeyUp, false);
    window.addEventListener('resize', onWindowResize, false);

    // додаєм інтервейс керування


    var guiVars = function () {

        this.Plane = function () {
            next.shape = 0;              //зміна форми на площину
        }
        this.Sphere = function () {      //зміна форми на сферу
            next.shape = 1;
        }
        this.Torus = function () {       //зміна форми на тор
            next.shape = 2;
        }

        this.DrawMode = function () {    // режим малювання (також перемикаэться Сtrl)
            isCtrlDown = 0;
        }
        this.PlayMode = function () {    // режим гри (також перемикаэться Сtrl)
            isCtrlDown = 1;
        }

        this.Clear = function () {       // очистити площину
            Life.clear();
        }
        this.SaveImage = function () {   // збереження стану канвасу
            save();
        }
        this.LoadPattern = function () {               //завантаження шаблону
            Life.generation(JSON.parse(loadString));
        }
    }
    guiVars = new guiVars();

    gui = new dat.GUI();
    gui.add(Life, 'Speed').min(1).max(1000).step(1);

    var f1 = gui.addFolder('Shape');
    f1.add(guiVars, 'Plane');
    f1.add(guiVars, 'Sphere');
    f1.add(guiVars, 'Torus');

    var f2 = gui.addFolder('Mode');
    f2.add(guiVars, 'DrawMode');
    f2.add(guiVars, 'PlayMode');

    var f3 = gui.addFolder('Actions');
    f3.add(guiVars, 'Clear');
    f3.add(guiVars, 'SaveImage');
    f3.add(guiVars, 'LoadPattern');

    f1.open();
    f2.open();
    f3.open();


}
//-----------------------------------------------
//функція обробки кроку зміни типу площини
function tween(t, next) {


    var from = geometries[current];
    var to = geometries[next];

    var tmp = new THREE.Vector3();

    var i, il;
    for (i = 0, il = from.vertices.length; i < il; i++) {

        tmp
            .copy(to.vertices[i])
            .subSelf(from.vertices[i])
            .multiplyScalar(t)
            .addSelf(from.vertices[i]);

        renderingGeometry.vertices[i].copy(tmp);

    }

    renderingGeometry.verticesNeedUpdate = true;
    renderingGeometry.colorsNeedUpdate = true;
    renderingGeometry.normalsNeedUpdate = true;


}


function onWindowResize() {

    camera.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}


function getRealIntersector(intersects) {
        intersector = intersects[ 0 ];
        return intersector;

}

// обробка руху мишки та її проекції на об'єкт
function onDocumentMouseMove(event) {

    event.preventDefault();

    var intersects = raycaster.intersectObjects(objects, true);


    mouse2D.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse2D.y = -( event.clientY / window.innerHeight ) * 2 + 1;

}
// обробка кліку
function onDocumentMouseDown(event) {

    //event.preventDefault();

    var intersects = raycaster.intersectObjects(objects, true);

    if (intersects.length > 0) {

        intersector = getRealIntersector(intersects);

        if (intersector) {

            Life.changeCellStatus(0, 0, intersector.faceIndex);
            renderingGeometry.colorsNeedUpdate = true;


        }

    }
}
// обробка клавіш ctrl та shift
function onDocumentKeyDown(event) {

    switch (event.keyCode) {

        case 16:
            isShiftDown = true;
            (next.shape < geometries.length - 1) ? next.shape = next.shape + 1 : next.shape = 0;
            break;
        case 17:
            ( isCtrlDown == 0) ? isCtrlDown = 1 : isCtrlDown = 0;
            break;

    }

}

function onDocumentKeyUp(event) {

    switch (event.keyCode) {

        case 16:
            isShiftDown = false;
            break;
        //case 17: isCtrlDown = false; counter = 0; break;

    }
}
// створення "скріншоту"
function save() {

    window.open(renderer.domElement.toDataURL('image/png'), 'mywindow');

}

//
function animate() {

    requestAnimationFrame(animate);

    render();
    stats.update();
}


var time;
var currTime;
var lastTime = 0;

function render() {

    raycaster = projector.pickingRay(mouse2D.clone(), camera);

    var intersects = raycaster.intersectObjects(objects, true);

    currTime = Date.now();

    if (currTime > lastTime) {

        Life.generation();

        renderingGeometry.colorsNeedUpdate = true;

        lastTime = currTime + (1000 / Life.Speed);
    }


    //-----------------------------------------
    t = Date.now() % interval / interval;

    if (last_t > (t)) {
        current = next.shape;
        tween(t, next.shape);
    }

    if (current !== next.shape) {
        tween(t, next.shape);
    }


    last_t = t;
    //---------------------------------

    var timer = 0.0001 * Date.now();

    camera.lookAt(plane.position);
    controls.update();


    renderer.render(scene, camera);

}


