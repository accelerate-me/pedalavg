/**
 * !READ ME FIRST!
 * Pedal ist noch nicht zu 100% fertig, einige Anpassungen müssn noch gemacht werden: 
 * TODO: 
 *      1) LINE 149 : Winkel des Dreiecks genauer betimmen (ohne switch case) 
 *      2) LINE 51 : ConEff anders berechnen, aktuell zu sehr von geschw. Abhängig (Nutzer kann optimalbereich nie erreichen)
 *                      Lösbar durch:        Durchschnittswert für Beschleunigung von 0 zu 50 
 *                                           Zeitgetriggert?
 *                                           Ableitungsfunktion von ConEff
 *                      
 *      3) General: HintergrundImg anpassen, sodass es nicht über das Interface hinausragt
 *      4) LINE 135, 250 : geringe Prio, Rotate Funktionen zusammenfassen
 *      5) Bei Pedal anzeigen nichts anzeigen anzeigen
 *      6) Bereich nicht springen, sondern bewegen.
 * 
 *       2 , 6 , 1 , 5 , 3 IST EIN MUSS 
 */
'use strict';

var img = document.getElementById("pedalImg");
var svg = document.getElementById("svg");
var canvas = document.getElementById('pedalcanvas');
var text = document.getElementById('textId');
var bBox = svg.getBBox();
var bBoxH = bBox.height.toString();
var bBoxW = bBox.width.toString();

var gewünschtePedalPos;
var conEffSpanne = 1;
var geschwIndex;
var dreieckAngle;

//ConvEfficiency 
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

//Geschwindigkeiten (y-achse von Map)
const mapKeys = [0, 6.75, 13.5, 20.25, 27, 33.75, 40.5, 47.25, 54, 60.75, 67.5, 74.25, 81, 87.75, 94.5, 101.25, 108, 114.75, 121.5, 128.25, 135];

//Pedal Positionen (x-aachse von Map)
const pedalValues = [ 0 , 0.1 , 0.2 , 0.3 , 0.4 , 0.5 , 0.6 , 0.7 , 0.8 , 0.9 ,1 ];


let throttleOrig = 0;
let value = 0;
let speed = 0;
let consumption = 0;
let torque = 0; 

//Berechnet aktuelle ConEff mit unterfunktionen, wird aufgerufen in App.js 
//@PARAM: Geschwindigkeit
document.conEffBerechnen = function(data) {

    var aktuelleGeschw = data.speed;
    var kennlinie;
    var höchsterWert;
    
    //berechnet den Index der aktuellen geschwindigkeit aus constMapKeys (y-Achse von Map) 
    //@PARAM: Geschwindigkeit des Autos @RETURN: Index der Geschwindigkeit
    function getGeschwIndex(aktuelleGeschw){
        for(let i = 0; i<mapKeys.length ; i++){

            var range = 3.375;
            var abstand = Math.abs(aktuelleGeschw - mapKeys[i]);
            if (abstand <= range){
                geschwIndex = i;
                return geschwIndex;
            }
            /*var höher = i+1;
            var difZuHöher = mapKeys[höher] - aktuelleGeschw;
            var difZuIndex = aktuelleGeschw - mapKeys[i];

            if (aktuelleGeschw > 135){
                geschwIndex = 20;
                return 20;
            }

            if (aktuelleGeschw< mapKeys[i+1] && aktuelleGeschw > mapKeys[i] ){
                if (difZuHöher < difZuIndex){
                    geschwIndex = höher;
                    return höher;

                } else if(difZuIndex < difZuHöher){
                    geschwIndex = i;
                    return i;
                }
            }*/
        }
    }

    //ermittelt die Kennline der ConEff abhängig von der aktuellen Geschwindigkeit 
    //@PARAM: Index der Geschwindigkeit aus geschwIndex  @RETURN: Kennline der ConEff als Array
    function getKennlinie(value){
        kennlinie = efficiencyMapValues[value];
        
        return kennlinie;
    }

    // brechnet die Beste CONEFF abhängg von Geschwindigkeit 
    //@PARAM KennlinienArray aus getKennlinie() @RETURN höchst mögliche ConEff per Geschwindigkeit
    function getGewünschteConvEff(kennlinie){
        höchsterWert = 0;

        function getMaxOfArray(numArray) {
            return Math.max.apply(null, numArray);
        }
        
        höchsterWert = getMaxOfArray(kennlinie);
        
        return kennlinie.indexOf(höchsterWert);
    }

    //Ermittlet gewünschtePedalPosition
    //@PARAM: Index der höchsten Con Eff @RETURN: GewünschtePedalPos (als wert zwischen 0 und 1);
    function getGewünschtePedalPos(gewünschteConEffIndex){
        return pedalValues[gewünschteConEffIndex];
    }



    gewünschtePedalPos =  getGewünschtePedalPos(getGewünschteConvEff(getKennlinie(getGeschwIndex(aktuelleGeschw))));
    //console.log("0 " + getKennlinie(geschwIndex));
    //console.log("2 " + getKennlinie(2));
    //funktionsaufrufe
    if (aktuelleGeschw <= mapKeys[8]){
        gewünschtePedalPos = 0.35;
        zeichneIntervall(8);
        rotateCanvas(gewünschtePedalPos);
        
    }else if (aktuelleGeschw > mapKeys[8] && aktuelleGeschw <= mapKeys[10]){
        zeichneIntervall(geschwIndex);
        smoothRotationCanvas(gewünschtePedalPos);
    
    }else  if (aktuelleGeschw > mapKeys[10] && aktuelleGeschw <= mapKeys[13]){
        gewünschtePedalPos = 0.58;
        zeichneIntervall(geschwIndex);
        rotateCanvas(gewünschtePedalPos);
    
    }else if (aktuelleGeschw > mapKeys[13] && aktuelleGeschw <= mapKeys[15]) {
    zeichneIntervall(geschwIndex);
    smoothRotationCanvas(gewünschtePedalPos);
    
    }else if(aktuelleGeschw > mapKeys[15]) {
        
        gewünschtePedalPos = 0.9;
        zeichneIntervall(geschwIndex);
        rotateCanvas(gewünschtePedalPos);
    }

    //what a mess
   function smoothRotationCanvas(data){
        var maxAbstand = 6.75/2;
        var aktuellAbstand =  aktuelleGeschw - mapKeys[geschwIndex];
        var aktuellAbstandinPr = (aktuellAbstand / maxAbstand) * 100; 
        var nextGeschwIndex = geschwIndex + 1 ;

        //pedalPos abstände
        var nextPedalPos = getGewünschtePedalPos(getGewünschteConvEff(getKennlinie(nextGeschwIndex)));
        var abstand = nextPedalPos - gewünschtePedalPos;
        var prIncrease = abstand * (aktuellAbstandinPr / 100);
        var newPedalPos = gewünschtePedalPos + prIncrease;
        
        rotateCanvas(newPedalPos);  
    }
 
}



//Rotiert Pedal, wird in App.js aufgerufen
//@Param: engineThrottle (Wert zwischen 0 - 1)
// -53 ist Maximalwert der Rotation
document.rotatePedal = function(data){
    value = data.throttle/100;
    var angle=0;
    var multiplikator = -53;
    var angle = value * multiplikator;
   
    img.style.transform = `rotate(${angle}deg) `;
}

document.pedalReleased = function(value){
    
    if ( value == 0){
        
        img.style.visibility = "hidden"
        canvas.style.visibility = "hidden"
        text.style.visibility = "visible";
    } else {
        text.style.visibility = "hidden";
        img.style.visibility = "visible";
        canvas.style.visibility = "visible";
    }
}




//zeichnet Intervall und bestimmt dessen Größe
//@PARAM: Index der Geschwindigkeit, benötigt um Größe zu ermitteln
function zeichneIntervall(value){
    var fensterBreite = img.clientWidth;
    var fensterHöhe = img.clientHeight;
    canvas.width = fensterBreite;
    canvas.height = fensterHöhe;

    var angle = -10;
    //Hardcode: Bestimmt inneren Winkel des Dreiecks
    //TODO: Werte verbessern, eventuell Algorithmus schreiben
    switch(value){
        case 0:
            angle = 0;
            break;
        case 1: 
            angle = 0;
            break;
        case 2:
            angle = -5;
            break;
        case 3:
            angle = -5;
            break;
        case 4:
            angle = -5;
            break;
        case 5:
            angle = -5;
            break;
        case 6:
            angle = -20; 
            break;
        case 7: 
            angle = -10
            break;
        case 8: 
            angle = -10;
            break;
        case 9: 
            angle =-10;
            break;
        case 10:
            angle =-15;
            break;
        case 11: 
            angle = -10;
            break;
        case 12: 
            angle = -10;
            break;
        case 13:
            angle = -10;
             break;
        case 14: 
            angle = -10;
            break;
        case 15: 
            angle = -10;
            break;
        case 16: 
            angle = -10;
            break;
        case 17: 
            angle = -10;
            break;
        case 18:
            angle = -10;
            break;
        case 19: 
            angle = -10;
            break;
        case 20:
            angle = -10;
            break;
    }
    dreieckAngle = angle;

    // Punkte und Verktoren
    var ursprung = [fensterBreite * 79/100, fensterHöhe  * 83/100];
    var eckeOben = [(fensterBreite/100) * 42.4,(fensterHöhe / 100) * 6.375];
    var eckeObenVektor = [eckeOben[0]-ursprung[0], eckeOben[1]-ursprung[1]];
    var eckeUntenVektor = [Math.cos(degrees_to_radians(angle))* eckeObenVektor[0] - Math.sin(degrees_to_radians(angle))* eckeObenVektor[1], Math.sin(degrees_to_radians(angle))*eckeObenVektor[0] + Math.cos(degrees_to_radians(angle))*eckeObenVektor[1]];
    var eckeUnten = [ursprung[0]+eckeUntenVektor[0],ursprung[1] + eckeUntenVektor[1]];

    //umrechnung degrees to radians 
    function degrees_to_radians(degrees){
        var pi = Math.PI;
        return degrees * (pi/180);
    }
          
   //Ab hier wird endlich gezeichnet
    var context = canvas.getContext('2d');

    context.beginPath();
    context.fillStyle = "#26a699";
    
    context.moveTo(ursprung[0] , ursprung[1]);
    context.lineTo(eckeOben[0],eckeOben[1]);
    context.lineTo(eckeUnten[0],eckeUnten[1]);
    
    context.fill();
    context.closePath();

}

//Rotiert das Canvas und somit auch den optimalen Bereich
//@PARAM: Gewünschte Pedal Position
function rotateCanvas(value){

    var angle;
    var multiplikator = -53;
    
    var angle = value * multiplikator - dreieckAngle /2;
    
    
    canvas.style.transform = `rotate(${angle}deg) `;
    
}
