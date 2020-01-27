const Color = function(r, g, b) {
    const color = {
        r: r || 0,
        g: g || 0,
        b: b || 0,
        arr: function() {
            return [color.r, color.g, color.b];
        },
        cssRgb: function() {
            return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
        }
    };

    return color;
};

const ColorInterpolator = {
    equiGradient: function(gradientColors, progress) {
        progress = Math.max(0, Math.min(progress, 1));

        let newColor = [];
        
        let startingIndex = Math.floor(progress * (gradientColors.length-1));
        startingIndex = Math.min(gradientColors.length-2, startingIndex);

        let left = gradientColors[startingIndex];
        let right = gradientColors[startingIndex+1];

        let partialProgress = progress*(gradientColors.length-1)-startingIndex;

        let components = ['r', 'g', 'b'];

        for (let j = 0; j < components.length; j++) {
            let c = components[j];
            newColor[c] = Math.round(left[c] + (right[c] - left[c]) * partialProgress);
        }
    
        return Color(newColor['r'], newColor['g'], newColor['b']);
    },
    gradientRYG: function(progress) {
        const red = Color(255, 0, 0);
        const yellow = Color(255, 255, 0);
        const green = Color(0, 255, 50);

        return this.equiGradient([red, yellow, green], progress);
    },
    gradientBO: function(progress) {
        const blue = Color(0, 191, 255);
        const orange = Color(255, 178, 0);

        return this.equiGradient([orange, blue], progress);
    }
};

var createRingBuffer = function(length){
    /* https://stackoverflow.com/a/4774081 */
    var pointer = 0, buffer = []; 
  
    return {
      get  : function(key){
          if (key < 0){
              return buffer[pointer+key];
          } else if (key === false){
              return buffer[pointer - 1];
          } else{
              return buffer[key];
          }
      },
      push : function(item){
        buffer[pointer] = item;
        pointer = (pointer + 1) % length;
        return item;
      },
      avg: function() {
        var sum = 0;
        for (var i = 0; i < buffer.length; i++) {
            sum += buffer[i];
        }
        return sum / length;
      }
    };
  };

function getSmoothedCurve(pts, tension, isClosed, numOfSegments) {

    // use input value if provided, or use a default value   
    tension = (typeof tension != 'undefined') ? tension : 0.5;
    isClosed = isClosed ? isClosed : false;
    numOfSegments = numOfSegments ? numOfSegments : 16;

    var _pts = [], res = [],    // clone array
        x, y,           // our x,y coords
        t1x, t2x, t1y, t2y, // tension vectors
        c1, c2, c3, c4,     // cardinal points
        st, t, i;       // steps based on num. of segments

    // clone array so we don't change the original
    //
    _pts = pts.slice(0);

    // The algorithm require a previous and next point to the actual point array.
    // Check if we will draw closed or open curve.
    // If closed, copy end points to beginning and first points to end
    // If open, duplicate first points to befinning, end points to end
    if (isClosed) {
        _pts.unshift(pts[pts.length - 1]);
        _pts.unshift(pts[pts.length - 2]);
        _pts.unshift(pts[pts.length - 1]);
        _pts.unshift(pts[pts.length - 2]);
        _pts.push(pts[0]);
        _pts.push(pts[1]);
    }
    else {
        _pts.unshift(pts[1]);   //copy 1. point and insert at beginning
        _pts.unshift(pts[0]);
        _pts.push(pts[pts.length - 2]); //copy last point and append
        _pts.push(pts[pts.length - 1]);
    }

    // ok, lets start..

    // 1. loop goes through point array
    // 2. loop goes through each segment between the 2 pts + 1e point before and after
    for (i=2; i < (_pts.length - 4); i+=2) {
        for (t=0; t <= numOfSegments; t++) {

            // calc tension vectors
            t1x = (_pts[i+2] - _pts[i-2]) * tension;
            t2x = (_pts[i+4] - _pts[i]) * tension;

            t1y = (_pts[i+3] - _pts[i-1]) * tension;
            t2y = (_pts[i+5] - _pts[i+1]) * tension;

            // calc step
            st = t / numOfSegments;

            // calc cardinals
            c1 =   2 * Math.pow(st, 3)  - 3 * Math.pow(st, 2) + 1; 
            c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2); 
            c3 =       Math.pow(st, 3)  - 2 * Math.pow(st, 2) + st; 
            c4 =       Math.pow(st, 3)  -     Math.pow(st, 2);

            // calc x and y cords with common control vectors
            x = c1 * _pts[i]    + c2 * _pts[i+2] + c3 * t1x + c4 * t2x;
            y = c1 * _pts[i+1]  + c2 * _pts[i+3] + c3 * t1y + c4 * t2y;

            //store points in array
            res.push(x);
            res.push(y);

        }
    }

    return res;
}

function getClosestCurveValue(arr, value) {
    for(var i = 0; i < arr.length/2; i++) {
        if(value < arr[(i+1)*2]) {
            return arr[(i*2)+1]
        }
    }
}

function getClosestCurveValueGradient(arr, value) {
    for(var i = 0; i < arr.length/2; i++) {
        let rightIndex = arr[(i*2)];
        if(value < 0) {
            return arr[1];
        }
        if(value < rightIndex) {
                let leftIndex = arr[((i-1)*2)];
                let leftVal = arr[((i-1)*2)+1];
                let rightVal = arr[(i*2)+1];

                let val;
                
                if(leftVal != rightVal) {
                    let progress = (value-rightIndex)/(rightIndex-leftIndex);
                    val =  (1-progress)*leftVal + progress*rightVal;
                } else {
                    val =  rightVal;
                }

                return val;
        }
    }
}


const efficiencyMapValues = [
    [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7],
    [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7],
    [0.7, 0.723418186, 0.758787864, 0.767137591, 0.760788743, 0.752388867, 0.746292794, 0.740676241, 0.730818134, 0.726345965, 0.715914639],
    [0.7, 0.753610288, 0.805869295, 0.812431638, 0.809574789, 0.807666017, 0.804359027, 0.800954113, 0.792348594, 0.783343237, 0.769329441],
    [0.7, 0.770920836, 0.823156977, 0.835300484, 0.83394582, 0.83135591, 0.830175772, 0.825524969, 0.821046359, 0.816525129, 0.80674766],
    [0.7, 0.764503009, 0.831899951, 0.849889592, 0.850326979, 0.849962727, 0.848989307, 0.846461075, 0.843426802, 0.839272883, 0.808004859],
    [0.7, 0.777613757, 0.848567847, 0.859580638, 0.861693424, 0.862821504, 0.862885798, 0.861845599, 0.859829962, 0.853571269, 0.808262558],
    [0.7, 0.808042881, 0.850319892, 0.865665409, 0.872209944, 0.873054411, 0.873250529, 0.86966634, 0.863617869, 0.860025992, 0.832559861],
    [0.7, 0.803812249, 0.852288508, 0.867997957, 0.87897319, 0.879970526, 0.88, 0.876692437, 0.869807183, 0.86231639, 0.824829062],
    [0.7, 0.794057161, 0.845510236, 0.867811018, 0.876832838, 0.88, 0.879905765, 0.878130335, 0.868703422, 0.858013941, 0.835850828],
    [0.7, 0.781416499, 0.8358298, 0.865409578, 0.875771178, 0.879614963, 0.877381142, 0.872126578, 0.864439542, 0.854626639, 0.842079536],
    [0.7, 0.771523275, 0.823222905, 0.856227136, 0.867111807, 0.871813911, 0.871654624, 0.866370827, 0.858738168, 0.848549315, 0.836527588],
    [0.7, 0.758920457, 0.808213949, 0.844602443, 0.855385968, 0.86, 0.86, 0.858167374, 0.854393246, 0.84308132, 0.832257636],
    [0.7, 0.745294993, 0.786928395, 0.819136703, 0.838825111, 0.848660086, 0.852228706, 0.853241832, 0.844230008, 0.834784629, 0.824686136],
    [0.7, 0.732714959, 0.765301131, 0.796673543, 0.824574116, 0.837850287, 0.846055324, 0.841710006, 0.83589766, 0.827729053, 0.81875825],
    [0.7, 0.701434479, 0.702868957, 0.733620384, 0.767383996, 0.795928514, 0.823277743, 0.828452945, 0.82502554, 0.818716865, 0.810696405],
    [0.7, 0.7, 0.7, 0.7, 0.7, 0.709997101, 0.738915581, 0.767625779, 0.78531552, 0.803005262, 0.803109749],
    [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.702901421, 0.711488641, 0.720075862],
    [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7],
    [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7],
    [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7]
];

const consumptionMapValues = [
    [0,0,0,0,0,0,0,0,0,0,0],
    [0, 0.045662207, 0.091324414, 0.136986621, 0.182648828, 0.228311035, 0.273973242, 0.319635449, 0.365297656, 0.410959863, 0.45662207],
    [0, 0.190332845, 0.397061464, 0.601828657, 0.794761174, 0.983118057, 1.170309066, 1.354702699, 1.527941897, 1.708321267, 1.870672037],
    [0, 0.448251696, 0.950409979, 1.435949997, 1.907019095, 2.378823218, 2.842877103, 3.302088901, 3.733008908, 4.152068156, 4.5305124],
    [0, 0.816038452, 1.730249468, 2.629394916, 3.498451274, 4.360276229, 5.224866618, 6.061085502, 6.889479167, 7.707757876, 8.461094411],
    [0, 1.269825288, 2.739336158, 4.187670592, 5.583571316, 6.977377909, 8.363010125, 9.727351672, 11.07697972, 12.39981236, 13.25726807],
    [0, 1.858582844, 4.012317067, 6.087376875, 8.135331826, 10.18195961, 12.21900113, 14.23749292, 16.23418341, 18.12585322, 19.05713898],
    [0, 2.459381123, 5.158973542, 7.872358052, 10.56898934, 13.22369077, 15.87141385, 18.43852443, 20.92693175, 23.44662781, 25.20331779],
    [0, 2.83146965, 5.998462221, 9.15875312, 12.36527429, 15.47175739, 18.56661309, 21.57853151, 24.4662558, 27.28740172, 28.98691576],
    [0, 3.194351748, 6.734216307, 10.318837, 13.88673361, 17.41198981, 20.89183737, 24.31913496, 27.50055797, 30.55340803, 33.05549348],
    [0, 3.510638374, 7.377902574, 11.35806964, 15.30295347, 19.210569, 22.98748301, 26.6512703, 30.18996246, 33.58832563, 36.76602789],
    [0, 3.84178425, 7.991028521, 12.34128094, 16.66096671, 20.92966847, 25.09256867, 29.10805787, 32.95874995, 36.62811525, 40.13924708],
    [0, 4.041600445, 8.332548203, 12.95774732, 17.4656623, 21.92457769, 26.30949323, 30.62092964, 34.83933367, 38.65926062, 42.4043546],
    [0, 4.255957993, 8.681538112, 13.54373296, 18.39169068, 23.22844347, 27.98468591, 32.66700983, 36.91688565, 41.07460406, 45.09349487],
    [0, 4.36969767, 8.805090437, 13.85963218, 18.93188134, 24.07871932, 29.08755916, 33.75487273, 38.30572798, 42.66953418, 46.8952788],
    [0, 4.208159194, 8.416318388, 13.39173984, 18.44599406, 23.99249687, 29.65173547, 34.69342553, 39.49553229, 44.0632532, 48.49172362],
    [0, 4.288163066, 8.576326133, 12.8644892, 17.15265227, 21.86837134, 27.39331997, 32.92168563, 38.63085038, 44.34001512, 49.14442367],
    [0, 4.410884795, 8.821769589, 13.23265438, 17.64353918, 22.05442397, 26.46530877, 30.87619356, 35.47385658, 40.43754156, 45.40122654],
    [0, 4.519891129, 9.039782257, 13.55967339, 18.07956451, 22.59945564, 27.11934677, 31.6392379, 36.15912903, 40.67902016, 45.19891129],
    [0, 4.727682783, 9.455365567, 14.18304835, 18.91073113, 23.63841392, 28.3660967, 33.09377948, 37.82146227, 42.54914505, 47.27682783],
    [0, 5.005310724, 10.01062145, 15.01593217, 20.0212429, 25.02655362, 30.03186435, 35.03717507, 40.0424858, 45.04779652, 50.05310724],
];

const mapKeys = [0, 6.75, 13.5, 20.25, 27, 33.75, 40.5, 47.25, 54, 60.75, 67.5, 74.25, 81, 87.75, 94.5, 101.25, 108, 114.75, 121.5, 128.25, 135];

function getInterpolatedCurve(currentMapValues, speed) {
    let curve = {
        max:0,
        maxIndex:0,
        maxThrottle:0,
        scaledMax:0
    };

    let index = 0;
    // Find the right index for the specified speed
    while(typeof mapKeys[index+1] !== undefined && mapKeys[index+1] < speed) {
        index++;
    }

    let lower = currentMapValues[index];
    let higher = currentMapValues[index+1];

    let interpolated = [];

    if(higher) {
        let differenceFactor = (speed - mapKeys[index]) / (mapKeys[index+1] - mapKeys[index]);
        
        for(let i = 0; i < currentMapValues[0].length; i++) {
            interpolated[i] = lower[i] + (higher[i] - lower[i])*differenceFactor;
            if(curve.max < interpolated[i]) {
                curve.max = interpolated[i];
                curve.maxIndex = i;
                curve.maxThrottle = i / (currentMapValues[0].length-2);
            }
        }
    } else {
        interpolated = lower;
        curve.max = interpolated[0];
    }

    curve.values = interpolated;

    return curve;
}

// Root element
const root = document.getElementsByTagName('svg')[0];

const ElementWrapper = function(selector, xOffset, yOffset) {
    const elementWrapper = {};

    const element = document.querySelector(selector);

    let offsetX = xOffset || 0;
    let offsetY = yOffset || 0;
    let transformX = 0;
    let transformY = 0;

    let matrix = root.createSVGMatrix();
    matrix.e = offsetX;
    matrix.f = offsetY;

    let transform = root.createSVGTransform();
    transform.setMatrix(matrix);
    element.transform.baseVal.appendItem(transform);

    function updateTransform() {
        matrix.e = offsetX + transformX;
        matrix.f = offsetY + transformY;
        element.transform.baseVal.getItem(0).setMatrix(matrix);
    }

    elementWrapper.setOffset = (x, y) => {
        offsetX = x;
        offsetY = y;
        updateTransform();
    }

    elementWrapper.setTransform = (x, y) => {
        transformX = x;
        transformY = y;
        updateTransform();
    }

    elementWrapper.getElement = () => element;

    return elementWrapper;
};

document.ThrottleConversionUI = function(config) {
    // Main Object
    const throttleConversionUI = {
        root: root
    };

    if(typeof config !== 'object') {
        config = {};
    }

    // Config default values
    if(typeof config.throttleArrowHintDistance !== 'number') {
        config.throttleArrowHintDistance = 0.1;
    }
    config.throttleBufferSize = config.throttleBufferSize || 10;
    config.demoAnimation = config.demoAnimation || false;
    config.captureData = config.captureData || false;

    if(typeof config.onlyActiveDuringThrottle !== 'boolean') {
        config.onlyActiveDuringThrottle = true;
    }

    let capturedData = [];

    // Buffer for smoothing the throttle input
    let throttleBuffer = createRingBuffer(config.throttleBufferSize);

    // Input for the throttle from BeamNG
    let throttleInput = 0;

    // Actual throttle value that is used for display
    let throttle = 0;

    // Actual speed value that is used for display
    let speed = 0;

    let consumption = 0;
     
    let torque = 0;

    let throttleOrig = 0;

    // The graph curve that is displayed in the current iteration
    let currentCurve;

    // Current color of the indicator dot
    let defaultDotColor = Color(127,196,91);

    // Gradient type
    let gradientType = config.defaultGradientType || 0;

    // Selected gradient function
    let gradientFunction;

    // Current mode
    let mode = config.defaultMode || 0;

    let graphOpacity = 1;

    let db;

    // Svg elements cache
    let elements = {
        indicatorXGroup: ElementWrapper('#group-indicator-x', -300, 0),
        indicatorY: ElementWrapper('#indicator-y', 0, 177),
        indicatorCircle: ElementWrapper('#indicator-circle', -300, 177),
        speed: document.querySelector('#curve-speed-text'),
        arrIncrease: document.querySelector('#arr-increase'),
        arrDecrease: document.querySelector('#arr-decrease'),
        gradientSelectorOff: document.querySelector('#gradient-selector-off'),
        gradientSelectorGR: document.querySelector('#gradient-selector-g-r'),
        gradientSelectorBO: document.querySelector('#gradient-selector-b-o'),
        modeSelectorEfficiency: document.querySelector('#mode-selector-efficiency'),
        modeSelectorConsumption: document.querySelector('#mode-selector-consumption'),
        textInactive: document.querySelector('#text-inactive'),
        sideLabel: document.querySelector('#side-label')
    }

    // Canvas and config for displaying the graph
    let canvas = document.getElementById('graph-canvas');
    let context = canvas.getContext('2d');

    let graphBounds = {
        top:0,
        right:0,
        left:0,
        bottom:0,
        height:280,
        width:640
    }

    function drawThrottleIndicator() {
        elements.indicatorXGroup.setTransform(graphBounds.width*throttle,0);
        if(config.onlyActiveDuringThrottle) {
            elements.indicatorXGroup.getElement().style.opacity = graphOpacity;
        }
    }

    function drawDotIndicator() {
        let yval = -getClosestCurveValue(currentCurve.smoothCurve, throttle*graphBounds.width);
        elements.indicatorCircle.setTransform(640*throttle, yval);

        
        if(gradientType > 0 && mode != 1) {
            // console.log(yval, currentCurve.scaledMax);
            elements.indicatorCircle.getElement().style.fill = 
                ColorInterpolator[gradientFunction](Math.pow(yval/currentCurve.scaledMax,4)).cssRgb();
        } else {
            elements.indicatorCircle.getElement().style.fill = defaultDotColor.cssRgb();
        }

        elements.indicatorY.setTransform(0, yval);

        if(config.onlyActiveDuringThrottle) {
            elements.indicatorCircle.getElement().style.opacity = graphOpacity;
            elements.indicatorY.getElement().style.opacity = graphOpacity;
        }
    }

    function scale(value) {
        let min, max;
        if(mode === 0) {
            min = 0.68;
            max = 0.9;
        } else {
            min = 0;
            max = 306.18;
        }

        return Math.min(max, (value-min)*(1/(max-min)))*graphBounds.height;
    }

    function getGradientMap() {
        let imagedata = context.createImageData(graphBounds.width, graphBounds.height);

        for (var x=0; x<graphBounds.width; x++) {

            let curveValue = getClosestCurveValueGradient(currentCurve.smoothCurve, x+4);
            let color = ColorInterpolator[gradientFunction](Math.pow(curveValue/currentCurve.scaledMax,4));

            for (var y=0; y<graphBounds.height; y++) {
                // Get the pixel index
                let pixelindex = (y * graphBounds.width + x) * 4;

                // Set the pixel data
                imagedata.data[pixelindex] = color.r;     // Red
                imagedata.data[pixelindex+1] = color.g; // Green
                imagedata.data[pixelindex+2] = color.b;  // Blue

                let aboveAlpha = y*0.3;
                let belowAlpha = graphBounds.height-y;
                
                let graphLineThresholdFactor = y > graphBounds.height - curveValue ? 1 : 0;
                let alpha = belowAlpha*graphLineThresholdFactor + aboveAlpha * (1-graphLineThresholdFactor);

                imagedata.data[pixelindex+3] = graphOpacity * alpha;   // Alpha
            }
        }

        return imagedata;
    }

    function drawGraph() {
        context.clearRect(0,0,graphBounds.width, graphBounds.height);

        let mapValues = mode === 1 ? consumptionMapValues : efficiencyMapValues;

        let curve = getInterpolatedCurve(mapValues, speed);

        curve.scaledMax = scale(curve.max);
        
        // if(gradientType === 1) {
        //     console.log(curve.max, curve.scaledMax);
        // }
            

        let preparedCurve = new Array(curve.values.length*2);

        for(let j = 0; j < curve.values.length; j++) {
            preparedCurve[j*2] = (graphBounds.width / (curve.values.length-2)*j );
            preparedCurve[(j*2)+1] = scale(curve.values[j]);
        }

        let smoothCurve = getSmoothedCurve(preparedCurve, 0.5);
        // let smoothCurve = preparedCurve;
        curve.smoothCurve = smoothCurve;

        currentCurve = curve;

        context.beginPath();
        context.strokeStyle = 'rgba(255,255,255,' + graphOpacity + ')';
        context.lineWidth=2;

        context.moveTo(
            graphBounds.left,
            graphBounds.height - smoothCurve[1] + graphBounds.top);

        for(let i = 0; i < smoothCurve.length/2; i++) {
            context.lineTo(
                smoothCurve[i*2] + graphBounds.left, 
                graphBounds.height - smoothCurve[i*2+1] + graphBounds.top);
        }

        if(mode !== 1 && gradientType > 0) {
            context.putImageData(getGradientMap(), 0, 0);
        }

        context.stroke();
    }

    function updateSpeed() {
        elements.speed.textContent = Math.round(speed.toString()) + ' km/h';
    }

    function updateArrows() {
        elements.arrDecrease.style.opacity = 0;
        elements.arrIncrease.style.opacity = 0;

        if(currentCurve.max > 0.71 && throttle > 0 && mode === 0) {
            if(throttle < currentCurve.maxThrottle - config.throttleArrowHintDistance) {
                elements.arrIncrease.style.opacity = 1;
            } else if(throttle > currentCurve.maxThrottle + config.throttleArrowHintDistance) {
                elements.arrDecrease.style.opacity = 1;
            }
        }
    }

    throttleConversionUI.setMode = function(modeVal) {
        mode = modeVal;
        elements.modeSelectorEfficiency.classList.remove('active');
        elements.modeSelectorConsumption.classList.remove('active');
        if(mode === 0) {
            elements.modeSelectorEfficiency.classList.add('active');
            elements.sideLabel.textContent = 'Conversion Efficiency';
            elements.textInactive.textContent = 'Pedal released';
        } else if(mode === 1) {
            elements.modeSelectorConsumption.classList.add('active');
            elements.sideLabel.textContent = 'Momentary Consumption';
            elements.textInactive.textContent = 'No Consumption';
        }
    };

    throttleConversionUI.setGradient = function(gradientVal) {
        gradientType = gradientVal;
        elements.gradientSelectorGR.classList.remove('active');
        elements.gradientSelectorBO.classList.remove('active');
        elements.gradientSelectorOff.classList.remove('active');

        if(gradientType === 0) {
            elements.gradientSelectorOff.classList.add('active');
        } else if(gradientType === 1) {
            elements.gradientSelectorGR.classList.add('active');
        } else if(gradientType === 2) {
            elements.gradientSelectorBO.classList.add('active');
        }
    };

    throttleConversionUI.setCANData = function(data) {
        throttleOrig = data.throttle;
        throttleInput = data.throttle/100;
        speed = data.speed;
        consumption = data.consumption;
        torque = data.torque;

        if(config.captureData) {
            capture();
        }
    }

    throttleConversionUI.getCapturedData = function() {
        return capturedData;
    };

    throttleConversionUI.exportCapturedData = function() {
        let blob = new Blob([JSON.stringify(capturedData)], { type: 'text/plain' })
        let anchor = document.createElement('a');

        anchor.download = new Date().toISOString() + "_ThrottleConsumption.json";
        anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
        anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
        anchor.click();
    }

    function capture() {
        const date = new Date().toISOString();
        
        var request = db.transaction(['capturePoints'], 'readwrite')
        .objectStore('capturePoints')
        .add({
            date: date,
            speed: speed,
            throttleInput: throttleInput,
            throttleAvg: throttle,
            curve: currentCurve.values,
            consumption: consumption,
            torque: torque,
            throttleOrig: throttleOrig
        });
    }

    function update() {
        if(config.demoAnimation) {
            speed += 0.25;
            if(speed > 150) speed = 0;

            throttleInput += 0.0025;
            if(throttleInput > 1) throttleInput = 0;
        }

        // Push the last set throttle input onto the buffer and calculate
        // the buffer average to display
        throttleBuffer.push(throttleInput);
        throttle = throttleBuffer.avg();

        if(config.onlyActiveDuringThrottle) {
            if(throttle > 0) {
                if(graphOpacity < 1) {
                    elements.textInactive.style.opacity = 0;
                    graphOpacity += 0.1;
                }
            } else {
                if(graphOpacity > 0) {
                    elements.textInactive.style.opacity = 1;
                    graphOpacity -= 0.1;
                }
            }
            if(graphOpacity < 0) {
                graphOpacity = 0;
            } else if(graphOpacity > 1) {
                graphOpacity = 1;
            }
        }

        if(gradientType === 1) {
            gradientFunction = 'gradientRYG';
        } else if(gradientType === 2) {
            gradientFunction = 'gradientBO';
        }

        drawGraph();
        drawThrottleIndicator();
        drawDotIndicator();
        updateSpeed();
        updateArrows();
    }
    

    const tick = now => {
        update();
        requestAnimationFrame(tick);
    };
      
    requestAnimationFrame(tick);

    elements.modeSelectorEfficiency.addEventListener('click', function() {
        throttleConversionUI.setMode(0);
    });

    elements.modeSelectorConsumption.addEventListener('click', function() {
        throttleConversionUI.setMode(1);
    });

    elements.gradientSelectorOff.addEventListener('click', function() {
        throttleConversionUI.setGradient(0);
    });

    elements.gradientSelectorGR.addEventListener('click', function() {
        throttleConversionUI.setGradient(1);
    });

    elements.gradientSelectorBO.addEventListener('click', function() {
        throttleConversionUI.setGradient(2);
    });

    if(config.captureData) {
        let request = window.indexedDB.open('capture', 3);
        request.onerror = function (event) {
            console.error('Database could not be opened');
        };

        request.onsuccess = function (event) {
            db = request.result;
            console.log('Database opened successfully');
        };

        request.onupgradeneeded = function(event) {
            db = event.target.result;

            if (!db.objectStoreNames.contains('capturePoints')) {
                objectStore = db.createObjectStore('capturePoints', { keyPath: 'date' });
                // objectStore.createIndex('date', 'date', { unique: true });
                console.log('Created new database');
            }
        }
    }

    return throttleConversionUI;
}