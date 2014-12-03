function puprpic() {
    console.log((window.innerHeight / 2) + "px");
    var cam = document.getElementById("my_camera");
    cam.style.height = ((window.innerHeight / 2) + "px");
    console.log(window.innerHeight / 2);
    Webcam.set({
        width: 720,
        height: 480,
        dest_width: 720,
        dest_height: 480,
        image_format: 'jpeg',
    });
    Webcam.attach('#my_camera');
}


