
Builder = function( object, domElement ) {

    this.object = object;

    this.domElement = ( domElement !== undefined ) ? domElement : document;

    this.r = 1;

    this.tetras = function() {
	const geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [], 3 ) );

	const lineMaterial = new THREE.LineBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.5 } );
	const meshMaterial = new THREE.MeshPhongMaterial( { color: 0xff33bb, emissive: 0xff33bb, side: THREE.DoubleSide, flatShading: true } );

	const one_eighty = Math.PI;
	const ninety = one_eighty / 2;
	const tan_thirty = Math.tan(Math.PI/6);
	
	const group = new THREE.Object3D();
	
	for (let i = 0; i < 2; ++i) {
	    group.add( new THREE.LineSegments( geometry, lineMaterial ) );
	    group.add( new THREE.Mesh( geometry, meshMaterial ) );

	    group.children[ 2*i ].geometry.dispose();
	    group.children[ 2*i+1 ].geometry.dispose();

	    const tetra = new THREE.TetrahedronGeometry( this.r, 0 );
	    const origin = new THREE.Matrix4().makeTranslation( -tan_thirty, -tan_thirty, -tan_thirty );
	    tetra.applyMatrix(origin);  
	
	    if (i % 2 == 1) {
		const flipMat = new THREE.Matrix4().makeRotationX( one_eighty );   
		tetra.applyMatrix(flipMat);
            
		const flopMat = new THREE.Matrix4().makeRotationZ( ninety );   
		tetra.applyMatrix(flopMat);
	    }
	    
	    group.children[ 2*i ].geometry = new THREE.WireframeGeometry( tetra );
	    group.children[ 2*i+1 ].geometry = tetra;
	}

	return group;
    }
};


