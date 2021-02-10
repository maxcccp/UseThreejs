import Stats from './../threejs/examples/jsm/libs/stats.module.js';
import * as THREE from './../threejs/build/three.module.js';
import { OrbitControls }  from './../threejs/examples/jsm/controls/OrbitControls.js';

// note: my common module.
import {createHDRTexture} from './common.js';

// note: Create variables  declaration.
let container = null, stats = null, clock = null;
let physicsWorld = null, rigidBodies = [], tmpTrans = null;
let colGroupPlane = 1, colGroupRedBall = 2, colGroupGreenBall = 4;
let scene = null, camera = null, cameraControls = null, renderer = null;

let hdrCubeRenderTarget = null, cubeMap = null, texPlaneDef = null, texPlaneNor = null;

let materialPlanePBR = null, materialBallPBR = null, materialBallPlasicPBR = null;


// note: Loaders functions.
const loaderTexture = new THREE.TextureLoader();


// note: Initialization physic library Ammojs.
Ammo().then( startGameLoop );

// note: Function loop game.
function startGameLoop(){

    // note: call setup physic engine.
    setupPhysicsWorld();
    // note: call setup init graphics scene.
    setupGraphics();
    
    // note: call setup create plane block shape.
    createBlock();
    // note: call setup create ball shape.
    createBall();
    // note: call mask physic shape.
    createMaskBall();

    createJointObjects();

    // note: call render frames.
    renderFrame();

}



// note: Init Physic world.
function setupPhysicsWorld(){

    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher( collisionConfiguration ),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();

        physicsWorld            = new Ammo.btDiscreteDynamicsWorld( dispatcher, overlappingPairCache, solver, collisionConfiguration );
        // physicsWorld         = new Ammo.btSoftRigidDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration); //для моделирования мягкого тела.
        physicsWorld.setGravity(new Ammo.btVector3(0, -9.9, 0));

        // note: btTransform();
        // note: Предназначен для временного объекта преобразования будем использовать повторно.
        // note: Поддерживает жесткие преобразования только с перемещением и вращением и без масштабирования.
        tmpTrans = new Ammo.btTransform();

}

// note: Init graphics scene.
function setupGraphics(){

    // note: create clock for timing
    clock = new THREE.Clock();

    // note: Create bube map hdr envairment.
	cubeMap = createHDRTexture( './../threejs/examples/textures/cube/pisaHDR/', hdrCubeRenderTarget );
    
   

    // note: load textures for material pbr plane.
    let repeatTesture = 5;
    let texColor    = loaderTexture.load( './../threejs/examples/textures/pbr/wall/albedo.png' );
        texColor.wrapS = THREE.RepeatWrapping;
        texColor.wrapT = THREE.RepeatWrapping;
        texColor.repeat.x = repeatTesture;
		texColor.repeat.y = repeatTesture;
    
        let texNormal   = loaderTexture.load( './../threejs/examples/textures/pbr/wall/normal.png' );
        texNormal.wrapS = THREE.RepeatWrapping;
        texNormal.wrapT = THREE.RepeatWrapping;
        
    let texAO       = loaderTexture.load( './../threejs/examples/textures/pbr/wall/ao.png' );
        texAO.wrapS = THREE.RepeatWrapping;
        texAO.wrapT = THREE.RepeatWrapping;
        texAO.repeat.x = repeatTesture;
        texAO.repeat.y = repeatTesture;

    let texMetallic   = loaderTexture.load( './../threejs/examples/textures/pbr/wall/metallic.png' );
        texMetallic.wrapS = THREE.RepeatWrapping;
        texMetallic.wrapT = THREE.RepeatWrapping;
        texMetallic.repeat.x = repeatTesture;
        texMetallic.repeat.y = repeatTesture;
    
        let texRoughness = loaderTexture.load( './../threejs/examples/textures/pbr/wall/roughness.png' );
        texRoughness.wrapS = THREE.RepeatWrapping;
        texRoughness.wrapT = THREE.RepeatWrapping;
        texRoughness.repeat.x = repeatTesture;
        texRoughness.repeat.y = repeatTesture;
    
    // note: MeshStandardMaterial, MeshPhysicalMaterial
    materialPlanePBR = new THREE.MeshPhysicalMaterial({
        clearcoat: 0.0,
        clearcoatRoughness: 0.5,
        metalness: 0.0,
        roughness: 0.9,
        bumpScale:0.5,
        // color: 0xaaaaaa,
        map: texColor,
        aoMap: texAO,
        normalMap: texNormal,
        bumpMap: texNormal,
        metalnessMap: texMetallic,
        //roughnessMap:  texRoughness,
        normalScale: new THREE.Vector2( 1.0, 1.0 ),
        clearcoatNormalScale: new THREE.Vector2( 8.0,  -8.0 )
    });
   


    // note: load textures for material pbr iron.
    let repeatTestureBull = 1;
    texColor    = loaderTexture.load( './../threejs/examples/textures/pbr/rusted_iron/albedo.png' );
    texColor.wrapS = THREE.RepeatWrapping;
    texColor.wrapT = THREE.RepeatWrapping;
    texColor.repeat.x = repeatTestureBull;
    texColor.repeat.y = repeatTestureBull;
    
    texNormal   = loaderTexture.load( './../threejs/examples/textures/pbr/rusted_iron/normal.png' );
    texNormal.wrapS = THREE.RepeatWrapping;
    texNormal.wrapT = THREE.RepeatWrapping;
        
    texAO       = loaderTexture.load( './../threejs/examples/textures/pbr/rusted_iron/ao.png' );
    texAO.wrapS = THREE.RepeatWrapping;
    texAO.wrapT = THREE.RepeatWrapping;
    texAO.repeat.x = repeatTestureBull;
    texAO.repeat.y = repeatTestureBull;

    texMetallic   = loaderTexture.load( './../threejs/examples/textures/pbr/rusted_iron/metallic.png' );
    texMetallic.wrapS = THREE.RepeatWrapping;
    texMetallic.wrapT = THREE.RepeatWrapping;
    texMetallic.repeat.x = repeatTestureBull;
    texMetallic.repeat.y = repeatTestureBull;

    texRoughness = loaderTexture.load( './../threejs/examples/textures/pbr/rusted_iron/roughness.png' );
    texRoughness.wrapS = THREE.RepeatWrapping;
    texRoughness.wrapT = THREE.RepeatWrapping;
    texRoughness.repeat.x = repeatTestureBull;
    texRoughness.repeat.y = repeatTestureBull;


     
    // note: MeshStandardMaterial, MeshPhysicalMaterial
    materialBallPBR = new THREE.MeshPhysicalMaterial({
        // clearcoat: 0.1,
        clearcoatRoughness: 0.9,
        metalness: 0.9,
        roughness: 0.6,
        // bumpScale:0.5,
        // color: 0xaaaaaa,
        map: texColor,
        aoMap: texAO,
        normalMap: texNormal,
        bumpMap: texNormal,
        metalnessMap: texMetallic,
        roughnessMap: texRoughness,
        normalScale: new THREE.Vector2( 2.0, 2.0 ),
        clearcoatNormalScale: new THREE.Vector2( 2.0, -2.0 )
    });


    // note: load textures for material pbr plasic red.
    texColor    = loaderTexture.load( './../threejs/examples/textures/pbr/plastic/albedo.png' );
    texColor.wrapS = THREE.RepeatWrapping;
    texColor.wrapT = THREE.RepeatWrapping;
    texColor.repeat.x = repeatTestureBull;
    texColor.repeat.y = repeatTestureBull;
    
    texNormal   = loaderTexture.load( './../threejs/examples/textures/pbr/plastic/normal.png' );
    texNormal.wrapS = THREE.RepeatWrapping;
    texNormal.wrapT = THREE.RepeatWrapping;
        
    texAO       = loaderTexture.load( './../threejs/examples/textures/pbr/plastic/ao.png' );
    texAO.wrapS = THREE.RepeatWrapping;
    texAO.wrapT = THREE.RepeatWrapping;
    texAO.repeat.x = repeatTestureBull;
    texAO.repeat.y = repeatTestureBull;

    texMetallic   = loaderTexture.load( './../threejs/examples/textures/pbr/plastic/metallic.png' );
    texMetallic.wrapS = THREE.RepeatWrapping;
    texMetallic.wrapT = THREE.RepeatWrapping;
    texMetallic.repeat.x = repeatTestureBull;
    texMetallic.repeat.y = repeatTestureBull;

    texRoughness = loaderTexture.load( './../threejs/examples/textures/pbr/plastic/roughness.png' );
    texRoughness.wrapS = THREE.RepeatWrapping;
    texRoughness.wrapT = THREE.RepeatWrapping;
    texRoughness.repeat.x = repeatTestureBull;
    texRoughness.repeat.y = repeatTestureBull;


     
    // note: MeshStandardMaterial, MeshPhysicalMaterial
    materialBallPlasicPBR = new THREE.MeshPhysicalMaterial({
        // clearcoat: 0.1,
        clearcoatRoughness: 0.9,
        metalness: 0.9,
        roughness: 0.6,
        // bumpScale:0.5,
        color: 0xff5555,
        map: texColor,
        aoMap: texAO,
        normalMap: texNormal,
        bumpMap: texNormal,
        metalnessMap: texMetallic,
        roughnessMap: texRoughness,
        normalScale: new THREE.Vector2( 2.0, 2.0 ),
        clearcoatNormalScale: new THREE.Vector2( 2.0, -2.0 )
    });
   


    // note: create the scene
    scene = new THREE.Scene();
    scene.background = cubeMap;
    scene.environment = cubeMap;
    // scene.background = new THREE.Color( 0xbfd1e5 );
    
    // note: Add axes helper for scene.
    let axesHelper = new THREE.AxesHelper(5);
    axesHelper.geometry.translate( 0, 10, 0 );
    scene.add(axesHelper);
    

    // note: create camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.2, 5000 );
    camera.position.set( 0, 20, 30 );
    camera.lookAt(new THREE.Vector3(0, 0, 0));

   
    // note: Add hemisphere light
    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
    hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
    hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );

    // note: Add directional light.
    let dirLight = new THREE.DirectionalLight( 0xffffff , 0.8);
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( -1, 1.75, 1 );
    dirLight.position.multiplyScalar( 100 );
    scene.add( dirLight );

    let cameraShadowVal = 50;
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width   = 2048;
    dirLight.shadow.mapSize.height  = 2048;
    dirLight.shadow.camera.left     = -cameraShadowVal;
    dirLight.shadow.camera.right    = cameraShadowVal;
    dirLight.shadow.camera.top      = cameraShadowVal;
    dirLight.shadow.camera.bottom   = -cameraShadowVal;
    dirLight.shadow.camera.far      = 500;

    // note: Setup the renderer.
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    {
        //renderer.setClearColor( 0xbfd1e5 );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        
        renderer.shadowMap.enabled = true;

        // note: Turn on the physically correct lighting model.
        renderer.physicallyCorrectLights = false;
        // note: ToneMapping == THREE.ReinhardToneMapping or THREE.LinearToneMapping or ACESFilmicToneMapping
        renderer.toneMappingExposure = 0.7;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.outputEncoding = THREE.sRGBEncoding;

        container = document.getElementById( 'container' );
        container.appendChild( renderer.domElement );

        const pmremGenerator = new THREE.PMREMGenerator( renderer );
        pmremGenerator.compileEquirectangularShader();
    }
    
    // note: For camera move and rotate.
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.minDistance = 5;
    cameraControls.maxDistance = 500;
    cameraControls.target.set( 0, 2, 0 );
    cameraControls.update();
    

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

}

// note: Function call will evety second
function renderFrame(){

    let deltaTime = clock.getDelta();

    updatePhysics( deltaTime );

    renderer.render( scene, camera );
    
    stats.update();

    requestAnimationFrame( renderFrame );

}


// note: Create physic shape plane.
function createBlock(){

    let pos = {x: 0, y: 0, z: 0};
    let scale = {x: 150, y: 2, z: 150};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    // note: Create mesh plane.
    let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), materialPlanePBR);
    // note: Material realizationed old version.
    // let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({
    //     color: 0xa0afa4,
    //     bumpScale: 0.2,
    //     roughness: 0.8, 
    //     map:texPlaneDef,
    //     bumpMap: texPlaneNor
    // }));

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);

    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;

    scene.add(blockPlane);


    // Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );


    // physicsWorld.addRigidBody( body );
    physicsWorld.addRigidBody( body, colGroupPlane, colGroupRedBall );
}

// note: Create physic shape ball.
function createBall(){
    
    let pos = {x: 0, y: 20, z: 0};
    let radius = 4, sigments = 32;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1.1;

    // note: Create ball red material MeshPhongMaterial - A material for shiny surfaces with specular highlights.
    let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius,sigments,sigments), materialBallPBR);

    ball.position.set(pos.x, pos.y, pos.z);
    
    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btSphereShape( radius );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );


    // physicsWorld.addRigidBody( body );
    physicsWorld.addRigidBody( body, colGroupRedBall, colGroupPlane | colGroupGreenBall );
    
    // note: Add fter the rigid body is added to the physics world, it is also added to userData object property of the three.js ball we created. DINAMIC OBJECTS!!!
    ball.userData.physicsBody = body;

    rigidBodies.push(ball);
}

// note: Create mask physic collision.
function createMaskBall(){

    let pos = {x: 0.5, y: 30, z: 0};
    let radius = 2, sigments = 32;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 5;

    //threeJS Section
    let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius,sigments,sigments), new THREE.MeshPhongMaterial({color: 0x00ff08}));

    ball.position.set(pos.x, pos.y, pos.z);
    
    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btSphereShape( radius );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    // note: 1-твердое тело, 2- к какой группе относется, 3- скоакй группой должен взаимодействовать.
    physicsWorld.addRigidBody( body, colGroupGreenBall, colGroupRedBall );
    
    ball.userData.physicsBody = body;
    rigidBodies.push(ball);
}

// note: Create joint 2 object sphere and block.
function createJointObjects(){
    
    let posSphere = {x: -10, y: 10, z: 0};
    let posBlock = {x: -10, y: 5, z: 0};

    let radiusSphere = 2, sigmentsSphere = 32;
    let scale = {x: 5, y: 2, z: 2};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass1 = 0;
    let mass2 = 0.81;

    let transform = new Ammo.btTransform();

    // note: Create sphere graphics.
    let ball = new THREE.Mesh(new THREE.SphereBufferGeometry( radiusSphere, sigmentsSphere, sigmentsSphere ), materialBallPlasicPBR );

    ball.position.set(posSphere.x, posSphere.y, posSphere.z);

    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);


    // note: Sphere Physics
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( posSphere.x, posSphere.y, posSphere.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let sphereColShape = new Ammo.btSphereShape( radiusSphere );
    sphereColShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    sphereColShape.calculateLocalInertia( mass1, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass1, motionState, sphereColShape, localInertia );
    let sphereBody = new Ammo.btRigidBody( rbInfo );

    physicsWorld.addRigidBody( sphereBody, colGroupGreenBall, colGroupRedBall );

    ball.userData.physicsBody = sphereBody;
    rigidBodies.push(ball);
    

    // Block Graphics
    let block = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0xf78a1d}));

    block.position.set(posBlock.x, posBlock.y, posBlock.z);
    block.scale.set(scale.x, scale.y, scale.z);

    block.castShadow = true;
    block.receiveShadow = true;

    scene.add(block);


    // note: Create block physics children.
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( posBlock.x, posBlock.y, posBlock.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    motionState = new Ammo.btDefaultMotionState( transform );

    let blockColShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    blockColShape.setMargin( 0.05 );

    localInertia = new Ammo.btVector3( 0, 0, 0 );
    blockColShape.calculateLocalInertia( mass2, localInertia );

    rbInfo = new Ammo.btRigidBodyConstructionInfo( mass2, motionState, blockColShape, localInertia );
    let blockBody = new Ammo.btRigidBody( rbInfo );

    physicsWorld.addRigidBody( blockBody, colGroupGreenBall, colGroupRedBall );
    
    block.userData.physicsBody = blockBody;
    rigidBodies.push(block);



    // note: Create Joints
    let spherePivot = new Ammo.btVector3( 0, -radiusSphere, 0 );
    let blockPivot = new Ammo.btVector3( - scale.x * 0.5, 1, 1 );

    let p2p = new Ammo.btPoint2PointConstraint( sphereBody, blockBody, spherePivot, blockPivot);
    physicsWorld.addConstraint( p2p, false );

}

// note: Create function for update physical world and any physic shapes.
function updatePhysics( deltaTime ){

    // note: Step world (1 timeStep - time passed after last simulation, 2 maxSubSteps - the maximum number of steps that Bullet is allowed to take each time you call it. (fixedTimeStep ~~~ 0.01666666 = 1/60) )
    physicsWorld.stepSimulation( deltaTime, 10 );

    // note: Update rigid bodies
    for ( let i = 0; i < rigidBodies.length; i++ ) {
        let objThree = rigidBodies[ i ];
        let objAmmo = objThree.userData.physicsBody;
        // note: Allows to automatic synchronize the world transform for active objects
        let ms = objAmmo.getMotionState(); 
        if ( ms ) {

            ms.getWorldTransform( tmpTrans );
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

        }
    }

}


// note: Event resize window (update camera, renderer).
window.addEventListener('resize', (event)=>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
});