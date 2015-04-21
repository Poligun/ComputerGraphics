$(document).ready(function() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer({ alpha: false });

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    $(renderer.domElement).css({
        'position': 'absolute',
        'left': '0',
        'top': '0'
    })

    var moveAmount = 0.1;

    $(document).keydown(function(event) {
        if (event.keyCode == 37)
            camera.position.x -= moveAmount;
        else if (event.keyCode == 38)
            camera.position.z -= moveAmount;
        else if (event.keyCode == 39)
            camera.position.x += moveAmount;
        else if (event.keyCode == 40)
            camera.position.z += moveAmount;
    });

    var light = new THREE.DirectionalLight(0xaaaaaa);
    light.position.set(0, 0, 1).normalize();
    scene.add(light);

    var geometry = new THREE.SphereGeometry(1, 50, 50);
    var material = new THREE.Material();

    material.vertexShader = document.getElementById('my_vertex_shader').innerHTML;
    material.fragmentShader = document.getElementById('my_fragment_shader').innerHTML;
    material.shading = THREE.SmoothShading;

    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    cube.scale.x = cube.scale.y = cube.scale.z = 2.0;

    function render() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    render();
});
