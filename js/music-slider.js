// Create array of albums with song data stored
var albums;

// Objects to store the album data
var objects = [];
var map = {};
var songList = [];

// Object to store the current tracks on the custom album
var customAlbum = [];
var customCost = 0;

// Object to store items added to the basket
var basket = [];

// Three js variables
var canvas;
var scene;
var camera;
var renderer;
var composer;
var renderPass;
var outlinePass;
var group;
var controls;

var albumCanvas;
var albumScene;
var albumCamera;
var albumRenderer;
var albumControls;
var albumObject;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var offset = new THREE.Vector3();
var intersection = new THREE.Vector3();
var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
var selected = null;
var hovered = null;
var lastX = null;
var lastChange = null;
var mouseDown = false;
var scope = this;
var lastAlbum = null;

var leftDown = false;
var rightDown = false;
var leftReleased = false;
var rightReleased = false;
var inVelocity = false;
var loop = null;
var toMove = 0;
var toStep = 0;

var buttonAdded = false;

THREE.MusicSlider = function (selector, source) {
    // Retrieve the canvas from the DOM and validate it exists
    canvas = $(selector)[0];
    if (!canvas) {
        console.error("Failed to bind canvas for slider!");
        return;
    }

    // Attempt to load the album details from the JSON file
    $.getJSON(source, function (data) {
        albums = data.albums;
        main();
    }).fail(function (err) {
        console.error("An error occured while loading the JSON data!");
        console.error(err);
    });

    // Jquery button events
    $("#listen-spotify").click(function () {
        openSongProperty("spotify");
    });

    $("#listen-soundcloud").click(function () {
        openSongProperty("soundcloud");
    });

    $("#listen-youtube").click(function () {
        openSongProperty("youtube");
    });

    $("#custom-add").click(function () {
        var json = map[lastAlbum.uuid];
        var index = customAlbum.indexOf(json);
        if (index > -1) {
            customAlbum.splice(index, 1);
            $("#custom-add").removeClass("custom-remove").addClass("custom-add").html("+<br>Click to add");
            updateCustomAlbum();
        } else {
            if (customAlbum.length >= 10) {
                alert("You can only have a maximum of 10 tracks in one album!");
                return;
            }
            customAlbum.push(json);
            $("#custom-add").removeClass("custom-add").addClass("custom-remove").html("-<br>Click to remove");
            updateCustomAlbum();
        }
    });

    $("#album-input").change(function () {
        var loader = new THREE.TextureLoader();
        var reader = new FileReader();
        reader.onload = function (e) {
            loader.load(e.target.result, function (texture) {
                albumObject.material[4].map = texture;
                renderCustom();
            });
        };
        reader.readAsDataURL($("#album-input")[0].files[0]);
    });
};

function main() {
    // Load the threejs scene and properties
    scene = new THREE.Scene();
    camera = loadCamera(scene);
    renderer = loadRenderer(canvas);
    composer = new THREE.EffectComposer(renderer);
    renderPass = loadRenderPass(scene, camera, composer);
    renderPass = loadRenderPass(scene, camera, composer);
    loadGround(scene);
    loadLighting(scene);

    // Group items
    group = new THREE.Group();

    // Bind events
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    renderer.domElement.addEventListener('mouseup', onMouseUp, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('mouseleave', onMouseLeave, false);

    // Load content
    var loader = new THREE.TextureLoader();
    var promiseList = [];

    // Iterate all albums and load each track in each album
    for (var i = 0; i < albums.length; i++) {
        var album = albums[i];
        for (var j = 0; j < album.tracks.length; j++) {
            promiseList.push(loadObject(loader, album, album.tracks[j])
                .then(function (res) {
                    var obj = res.object;
                    var resAlbum = res.album;
                    var resTrack = res.track;
                    map[obj.uuid] = {
                        album: resAlbum,
                        song: resTrack
                    };
                    songList.push(resTrack);
                    objects.push(obj);
                    group.add(obj);
                }));
        }
    }

    // Once all promises resolve
    Promise.all(promiseList)
        .then(function () {
            var itemCount = objects.length;
            var halfCount = Math.floor(objects.length / 2);
            for (var i = 0; i < itemCount; i++) {
                objects[i].position.x = ((i - halfCount) * 36);
            }
            scene.add(group);
            updateAlbum(group, true);
            tick();
        });

    albumCanvas = $("#album-picture")[0];
    if (!albumCanvas) return;
    albumScene = new THREE.Scene();
    albumCamera = new THREE.PerspectiveCamera(75, 2, 1, 1000);
    albumCamera.position.set(0, 0, 30);
    albumCamera.lookAt(new THREE.Vector3(0, 0, 0));
    albumRenderer = loadRenderer(albumCanvas);
    albumRenderer.setClearColor(0x000000, 0);
    albumControls = new THREE.OrbitControls(albumCamera, albumCanvas);
    albumControls.enableZoom = false;
    albumControls.enablePan = false;
    albumControls.addEventListener('change', renderCustom);
    loadGround(albumScene);
    loadLighting(albumScene);
    var loader = new THREE.TextureLoader();
    loader.load("assets/theone.jpg", function (texture) {
        var objGeometry = new THREE.BoxGeometry(30, 30, 0.5);
        var objMaterial = [
                new THREE.MeshPhongMaterial({
                color: 0x000000
            }),
                new THREE.MeshPhongMaterial({
                color: 0x000000
            }),
                new THREE.MeshPhongMaterial({
                color: 0x000000
            }),
                new THREE.MeshPhongMaterial({
                color: 0x000000
            }),
                new THREE.MeshPhongMaterial({
                color: 0x6F6F6F,
                specular: 0x000000,
                shininess: 0,
                map: texture
            }),
                new THREE.MeshPhongMaterial({
                color: 0x000000
            }),
        ];
        albumObject = new THREE.Mesh(objGeometry, objMaterial);
        albumObject.rotation.x = 0;
        albumObject.castShadow = true;
        albumObject.receiveShadow = true;
        albumScene.add(albumObject);

        renderCustom();

        $("#custom-tracklist").sortable({
            axis: 'y',
            containment: "#custom-container"
        }).disableSelection();
    });
}

function resize() {
    const canv = renderer.domElement;
    const width = canv.clientWidth;
    const height = canv.clientHeight;
    if (canv.width !== width || canv.height !== height) {
        renderer.setSize(width, height, false);
        composer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    if (albumCanvas && albumRenderer) {
        const albumCanv = albumRenderer.domElement;
        const albumWidth = albumCanv.clientWidth;
        const albumHeight = albumCanv.clientHeight;
        if (albumCanv.width !== albumWidth || albumCanv.height !== albumHeight) {
            albumRenderer.setSize(albumWidth, albumHeight, false);
            albumCamera.aspect = albumWidth / albumHeight;
            albumCamera.updateProjectionMatrix();
        }
    }
}

function render() {
    renderer.render(scene, camera);
    composer.render();
}

function renderCustom() {
    albumRenderer.render(albumScene, albumCamera);
}

function tick() {
    resize();
    requestAnimationFrame(tick);
    render();
}

function loadCamera(scene) {
    // Create a new camera
    var camera = new THREE.PerspectiveCamera(75, 2, 0.1, 1000);
    camera.position.set(0, 4, 25);
    camera.lookAt(new THREE.Vector3(0, 1, 0));
    return camera;
}

function loadRenderer(canvas) {
    // Create a new renderer
    var renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0xFFFFFF, 0);
    renderer.setPixelRatio(4);
    return renderer;
}

function loadRenderPass(scene, camera, composer) {
    var renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    return composer;
}

function loadGround(scene) {
    var groundMaterial = new THREE.ShadowMaterial({
        color: 0x000000,
        opacity: 0.3
    });
    var groundPlane = new THREE.Mesh(new THREE.PlaneGeometry(512, 256), groundMaterial);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -15;
    groundPlane.receiveShadow = true;
    groundPlane.castShadow = true;
    scene.add(groundPlane);
}

function loadLighting(scene) {
    var ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    var light = new THREE.SpotLight(0xDFEBFF, 3);
    light.position.set(0, 35, 55);
    light.position.multiplyScalar(1.3);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.left = -100;
    light.shadow.camera.right = 100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    light.shadow.camera.far = 1000;
    scene.add(light);
}

function loadObject(loader, album, track) {
    var promise = new Promise(function (resolve, reject) {
        loader.load("assets/" + album.cover, function (texture) {
            var objGeometry = new THREE.BoxGeometry(30, 30, 0.5);
            var blankSide = new THREE.MeshPhongMaterial({
                color: 0x000000,
                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 1
            });
            var objMaterial = [
                blankSide,
                blankSide,
                blankSide,
                blankSide,
                new THREE.MeshPhongMaterial({
                    color: 0x6F6F6F,
                    specular: 0x000000,
                    shininess: 0,
                    map: texture,
                    polygonOffset: true,
                    polygonOffsetFactor: 1,
                    polygonOffsetUnits: 1
                }),
                blankSide
            ];
            var obj = new THREE.Mesh(objGeometry, objMaterial);
            var geo = new THREE.EdgesGeometry(obj.geometry);
            var mat = new THREE.LineBasicMaterial({
                color: 0x000000,
                linewidth: 2
            });
            var wireframe = new THREE.LineSegments(geo, mat);
            obj.add(wireframe);
            obj.castShadow = true;
            obj.receiveShadow = true;
            track["object"] = obj;
            resolve({
                object: obj,
                album: album,
                track: track
            });
        });
    });
    return promise;
}

function onKeyDown(event) {
    if (inVelocity)
        return;
    if (event.key === "ArrowLeft")
        leftDown = true;
    else if (event.key === "ArrowRight")
        rightDown = true;
    if (rightDown && rightReleased) {
        toMove -= 36;
        toStep = -0.5;
        rightReleased = false;
    } else if (leftDown && leftReleased) {
        toMove += 36;
        toStep = 0.5;
        leftReleased = false;
    }
    if (!loop) {
        loop = window.setInterval(function () {
            var box = new THREE.Box3().setFromObject(group);
            var size = box.getSize(new THREE.Vector3());
            var stopSize = (size.x / 2) + 3;
            if (!(group.position.x + toStep > stopSize || group.position.x + toStep < (-stopSize + 36))) {
                if (mouseDown) {
                    window.clearInterval(loop);
                    loop = null;
                    return;
                } else if (toMove === 0) {
                    if (rightDown) {
                        toMove -= 36;
                        toStep = -0.5;
                    } else if (leftDown) {
                        toMove += 36;
                        toStep = 0.5;
                    } else {
                        toMove = 0;
                        window.clearInterval(loop);
                        loop = null;
                        return;
                    }
                } else {
                    group.position.x += toStep;
                    updateAlbum(group, false);
                    toMove -= toStep;
                }
            } else {
                toMove = 0;
                window.clearInterval(loop);
                loop = null;
                return;

            }
        }, 1);
    }
}

function onKeyUp(event) {
    if (event.key === "ArrowLeft") {
        leftDown = false;
        leftReleased = true;
    } else if (event.key === "ArrowRight") {
        rightDown = false;
        rightReleased = true;
    }
}

function onMouseDown(event) {
    event.preventDefault();
    raycaster.setFromCamera(mouse, camera);
    var inter = raycaster.intersectObjects(objects);
    if (inter.length > 0) {
        inVelocity = true;
        mouseDown = true;
        selected = inter[0].object;
        lastX = event.pageX;
        lastChange = 0;
    }
}

function onMouseUp(event) {
    event.preventDefault();
    if (selected) {
        mouseDown = false;
        var parent = selected.parent;
        var maxInertia = 5;
        if (lastChange > maxInertia)
            lastChange = maxInertia;
        else if (lastChange < -maxInertia)
            lastChange = -maxInertia;
        lastChange *= 2;
        var inertia = function (x) {
            updateAlbum(parent, false);
            if (mouseDown)
                return;
            var box = new THREE.Box3().setFromObject(parent);
            var size = box.getSize(new THREE.Vector3());
            var stopSize = (size.x / 2);
            if (!(parent.position.x + x > stopSize || parent.position.x + x < (-stopSize + 36))) {
                if (x < 0) {
                    parent.position.x += x;
                    x *= 0.98;
                    if (x > -0.05)
                        x = 0;
                    setTimeout(function () {
                        inertia(x);
                    }, 5);
                } else if (x > 0) {
                    parent.position.x += x;
                    x *= 0.95;
                    if (x < 0.05)
                        x = 0;
                    setTimeout(function () {
                        inertia(x);
                    }, 2);
                } else {
                    updateAlbum(parent, true);
                    return;
                }
            } else {
                inVelocity = false;
                updateAlbum(parent, true);
            }
        };
        inertia(lastChange);
        selected = null;
        lastX = null;
    }
}

function onMouseMove(event) {
    event.preventDefault();
    var rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    raycaster.setFromCamera(mouse, camera);
    if (selected && lastX) {
        var parent = selected.parent;
        var newX = event.pageX;
        var xChange = (newX - lastX) / 10;
        var newPos = parent.position.x + xChange;
        var box = new THREE.Box3().setFromObject(parent);
        var size = box.getSize(new THREE.Vector3());
        var stopSize = (size.x / 2);
        if (!(newPos > stopSize || newPos < (-stopSize + 36))) {
            parent.position.x += xChange;
            lastChange = xChange;
            lastX = newX;
            updateAlbum(parent);
            inVelocity = true;
        }
    } else {
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(objects);
        if (intersects.length > 0) {
            var object = intersects[0].object;
            if (hovered !== object) {
                hovered = object;
            }
        } else {
            if (hovered !== null) {
                hovered = null;
            }
        }
    }
}

function onMouseLeave(event) {
    if (hovered !== null) {
        hovered = null;
    }
}

function updateAlbum(parent, snap) {
    if (snap) {
        var nearestAlbum = Math.round((parent.position.x - 2) / 36) * 36;
        parent.position.x = Math.round(parent.position.x);
        var loop = setInterval(function () {
            if (mouseDown) {
                window.clearInterval(loop);
                return;
            }
            if (parent.position.x < nearestAlbum) {
                parent.position.x += 0.5;
            } else if (parent.position.x > nearestAlbum) {
                parent.position.x -= 0.5;
            } else {
                inVelocity = false;
                window.clearInterval(loop);
                updateAlbum(parent, false);
                return;
            }
        }, 1);
    }
    var box = new THREE.Box3().setFromObject(parent);
    var size = box.getSize(new THREE.Vector3());
    var objIndex = Math.floor(objects.length + 0.5 - ((parent.position.x + (size.x / 2)) / 36));
    var obj = objects[objIndex];
    if (obj !== lastAlbum) {
        var data = map[obj.uuid];
        $("#album").html(data.album.album + "<br>" + data.song.title + "<br>" + data.song.artist + "<br>" + data.song.runtime);
        data.song.spotify ? $("#listen-spotify").show() : $("#listen-spotify").hide();
        data.song.soundcloud ? $("#listen-soundcloud").show() : $("#listen-soundcloud").hide();
        data.song.youtube ? $("#listen-youtube").show() : $("#listen-youtube").hide();
        if (customAlbum.indexOf(data) > -1) {
            $("#custom-add").removeClass("custom-add").addClass("custom-remove").html("-<br>Click to remove");
        } else {
            $("#custom-add").removeClass("custom-remove").addClass("custom-add").html("+<br>Click to add");
        }
    }
    lastAlbum = obj;
}

function openSongProperty(property) {
    var json = map[lastAlbum.uuid];
    if (json.song[property]) {
        var target = window.open(json.song[property], "_blank");
        target.focus();
    }
}

function clearCustomAlbum() {
    // Set the custom album to be empty
    customAlbum = [];
    // Reset the button
    if ($("#custom-add.custom-remove").length > 0)
        $("#custom-add").removeClass("custom-remove").addClass("custom-add").html("+<br>Click to add");
    // Call the update album function
    updateCustomAlbum();
}

function updateCustomAlbum() {
    // Calculate album cost based on number of tracks
    customCost = customAlbum.length * 1 - 0.01;
    // If the album has a track added
    if (customAlbum.length > 0) {
        // If the button has not been added
        if (!buttonAdded) {
            buttonAdded = true;
            // Add the button and append a click event
            $("<button></button>").addClass("custom-order").html("Buy<br>£" + customCost.toFixed(2)).appendTo("#custom-album").click(function (event) {
                // Grab the track order from the display and store as the description with line breaks
                var desc = $("#custom-tracklist").children().text().split(")-").join(")<br>");
                // Create a new basket and add a new item with the correct data
                var basket = new Basket();
                basket.addItem({ name: "Custom Album", desc: desc, cost: customCost, qty: 1 });
                // Clear the custom album
                clearCustomAlbum();
            });
        } else {
            // Update the cost on the button
            $(".custom-order").html("Buy<br>£" + customCost.toFixed(2));
        }
    } else {
        // Remove the button as no tracks are added
        buttonAdded = false;
        $(".custom-order").remove();
    }
    $("#custom-tracklist").children().remove();
    for (var i = 0; i < customAlbum.length; i++) {
        var item = customAlbum[i];
        var div = $("<li></li>");
        var track = $("<span></span>").addClass("track-info").text(item.song.title + ", " + item.song.artist + " (" + item.song.runtime + ")");
        var del = $("<button></button>").addClass("track-delete").text("-").data("id", customAlbum[i].song.id).click(function (event) {
            var target = $(event.target);
            var id = target.data("id");
            target.parent().remove();
            var activeIndex = customAlbum.findIndex(function (album) {
                return album.song.id == id;
            });
            if (map[lastAlbum.uuid].song.id == id)
                $("#custom-add").removeClass("custom-remove").addClass("custom-add").html("+<br>Click to add");
            customAlbum.splice(activeIndex, 1);
        });
        track.appendTo(div)
        del.appendTo(div);
        div.appendTo("#custom-tracklist");
    }
    var xPos = null;
}
