const decodingValues = {
    SPEED: {
      id: '5d7',
      startBit: 0,
      endBit: 16,
      offset: 0,
      resolution: 0.01,
      key: "speed"
    },
    CONSUMPTION: {
      id: '1fd',
      startBit: 48,
      endBit: 56,
      offset: 80,
      resolution: 1,
      key: "consumption"
    },
    TORQUE: {
      id: '130',
      startBit: 44,
      endBit: 56,
      offset: 4094,
      resolution: -3,
      key: "torque"
    },
    THROTTLE: {
      id: '186',
      startBit: 40,
      endBit: 50,
      offset: 0,
      resolution: 0.125,
      key: "throttle"
    }
  }
  
  const translateDict = {
      "0": "0000", "1": "0001", "2": "0010", "3": "0011", "4": "0100", "5": "0101",
      "6": "0110", "7": "0111", "8": "1000", "9": "1001", "a": "1010", "b": "1011",
      "c": "1100", "d": "1101", "e": "1110", "f": "1111"
  }
  
  // message example
  // decodeIncomingMessage("{\"186\": \"195034d34902e0\", \"5d7\": \"018102cde220d4\", \"1fd\": \"0e4007ff7fc85100\", \"130\": \"00a86ffe009ffe4d\"} ")
  
  function decodeIncomingMessage(inputString) {
    canMessage = JSON.parse(inputString);
    var result = {};
  
    Object.keys(canMessage).forEach(function(key) {
  
      // the message is hex encoded. We want it binary
      message = unhexlify(canMessage[key]);
  
      switch (key) {
        case decodingValues.SPEED.id:
          result[decodingValues.SPEED.key] = decodeMessage(decodingValues.SPEED, message);
          break;
        case decodingValues.CONSUMPTION.id:
          result[decodingValues.CONSUMPTION.key] = decodeMessage(decodingValues.CONSUMPTION, message);
          break;
        case decodingValues.TORQUE.id:
          result[decodingValues.TORQUE.key] = decodeMessage(decodingValues.TORQUE, message);
          break;
        case decodingValues.THROTTLE.id:
          result[decodingValues.THROTTLE.key] = decodeMessage(decodingValues.THROTTLE, message);
          break;
      }
    });
  
    return result;
  }
  
  function decodeMessage(decodingValue, message) {
    // extract relevant information and parse to decimal value
    let rawValue = parseInt(message.substring(decodingValue.startBit, decodingValue.endBit), 2);
    // add offset and multiply resolution
    return ((rawValue + decodingValue.offset) * decodingValue.resolution);
  }
  
  function unhexlify(inputString) {
    var outputString = "";
    for (var i = 0; i < inputString.length; i++) {
      outputString += translateDict[inputString.charAt(i)];
    }
    return outputString;
  }