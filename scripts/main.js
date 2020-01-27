// const activateFullscreen = () => {
//     document.documentElement.requestFullscreen();
// }

// const positionCanvas = () => {
//     const canvas = document.querySelector('canvas');
//     let graphRect = document.getElementById('main').getBoundingClientRect();
//     canvas.style.width = graphRect.width + "px";
//     canvas.style.left = graphRect.left + "px";
// }

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js")
        .then(function (registration) {
            console.log("Service Worker registered with scope:", registration.scope);
        }).catch(function (err) {
            console.log("Service worker registration failed:", err);
    });
} else {
    console.log('Service worker not in navigator.');
}

const connect = (url, callback) => {
    wsConnection = new WebSocket(url);

    wsConnection.onopen = () => {
        console.log(`Connection to ${url} successful`);
        callback(null, wsConnection);
    };

    wsConnection.onerror = function (error) {
        callback(error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // const body = document.body;
    // body.addEventListener('click', activateFullscreen);

    // let touchCounter = 0;

    // function increaseTouch() {
    //     touchCounter++;
    //     setTimeout(() => {
    //         touchCounter--;
    //     },400);

    //     if(touchCounter === 4) {
    //         window.location =  './data.html';
    //     }
    // }

    // body.addEventListener('click', increaseTouch);
    // body.addEventListener('touchstart', increaseTouch);

    // let noSleep = new NoSleep();

    // document.addEventListener('click', function enableNoSleep() {
    //     document.removeEventListener('click', enableNoSleep, false);
    //     noSleep.enable();
    //   }, false);

    // const throttleConversionUI = document.ThrottleConversionUI({
    //     throttleArrowHintDistance: 0.1,
    //     throttleBufferSize: 10,
    //     demoAnimation: false,
    //     onlyActiveDuringThrottle: true,
    //     captureData: true
    // });

    // window.throttleConversionUI = throttleConversionUI;

    var throttleConversionUI = document.conEffBerechnen;
    window.throttleConversionUI = throttleConversionUI;
   
    var throttleConversionUI2 = document.rotatePedal;
    window.throttleConversionUI2 = throttleConversionUI2;

    const urlInput = document.querySelector('#input-websocket-url');

    const connectBtn = document.querySelector('#connect-btn');
    connectBtn.addEventListener('click', (e) => {
        e.preventDefault();
        connect(urlInput.value, (err, connection) => {
            if(!err) {
                document.querySelector('.connect').style.display = 'none';
                document.querySelector('.err').style.display = 'none';
                //document.querySelector('.ui').classList.remove('blurry');

                connection.onmessage = (m) => {
                    const data = decodeIncomingMessage(m.data);
                    console.log(data);
                    throttleConversionUI(data);
                    throttleConversionUI2(data);
                }

                connection.onclose = () => {
                    document.querySelector('.connect').style.display = 'flex';
                    document.querySelector('.err').style.display = 'none';
                    //document.querySelector('.ui').classList.add('blurry');
                }
            } else {
                document.querySelector('.err').style.display = 'block';
            }
        });
    });

    // window.addEventListener('resize', () => {
    //     positionCanvas();
    // });
});

// window.addEventListener('load', () => {
//     positionCanvas();
// });