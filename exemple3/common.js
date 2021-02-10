import * as THREE from './../threejs/build/three.module.js';
import { HDRCubeTextureLoader } from './../threejs/examples/jsm/loaders/HDRCubeTextureLoader.js';

// note: Load HDR texture cube maps.
function createHDRTexture(path, pmreGenerator=null){
	const hdrUrls = [ 'px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr' ];
	let hdrCubeMap =  new HDRCubeTextureLoader()
	.setPath( path )
	.setDataType( THREE.UnsignedByteType )
	.load( hdrUrls, function () {
		// https://threejs.org/docs/#api/en/extras/PMREMGenerator
		if( pmreGenerator != null )
			pmreGenerator = pmremGenerator.fromCubemap( hdrCubeMap );
		hdrCubeMap.magFilter = THREE.LinearFilter;
		hdrCubeMap.needsUpdate = true;

	});
	return hdrCubeMap;
}

export{createHDRTexture}