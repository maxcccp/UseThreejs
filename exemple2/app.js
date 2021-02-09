import Stats from './../threejs/examples/jsm/libs/stats.module.js';
import * as THREE from './../threejs/build/three.module.js';
import { OrbitControls }  from './../threejs/examples/jsm/controls/OrbitControls.js';

// note: Create variables  declaration.
let container = null, stats = null, clock = null;
let physicsWorld = null, rigidBodies = [], tmpTrans = null;
let colGroupPlane = 1, colGroupRedBall = 2, colGroupGreenBall = 4;
let scene = null, camera = null, cameraControls = null, renderer = null;

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

    // note: call render frames.
    renderFrame();

}


// note: Init Physic world.
function setupPhysicsWorld(){

    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();

        physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        // physicsWorld           = new Ammo.btSoftRigidDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration); //для моделирования мягкого тела.
        physicsWorld.setGravity(new Ammo.btVector3(0, -9.9, 0));

        tmpTrans = new Ammo.btTransform();

}

// note: Init graphics scene.
function setupGraphics(){

   

    // note: create clock for timing
    clock = new THREE.Clock();

    // note: create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xbfd1e5 );

    // note: create camera
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 5000 );
    camera.position.set( 0, 20, 50 );
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    

    // note: Add hemisphere light
    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
    hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
    hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );

    //Add directional light
    let dirLight = new THREE.DirectionalLight( 0xffffff , 1);
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( -1, 1.75, 1 );
    dirLight.position.multiplyScalar( 100 );
    scene.add( dirLight );

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    let d = 50;

    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.camera.far = 13500;

    //Setup the renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xbfd1e5 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;

    container = document.getElementById( 'container' );
    container.appendChild( renderer.domElement );


    cameraControls = new OrbitControls( camera, renderer.domElement );
    // cameraControls.minDistance = 5;
    // cameraControls.maxDistance = 1000;
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
    let scale = {x: 50, y: 2, z: 50};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    // threeJS Section
    let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0xa0afa4}));

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
    let mass = 1.0;

    //threeJS Section
    let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius,sigments,sigments), new THREE.MeshPhongMaterial({color: 0xff0505}));

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

// note: Create function for update physical world and any physic shapes.
function updatePhysics( deltaTime ){

    // Step world
    physicsWorld.stepSimulation( deltaTime, 10 );

    // Update rigid bodies
    for ( let i = 0; i < rigidBodies.length; i++ ) {
        let objThree = rigidBodies[ i ];
        let objAmmo = objThree.userData.physicsBody;
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
