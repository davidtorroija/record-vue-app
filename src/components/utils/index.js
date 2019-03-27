function arrayBufferToAudioBuffer(arrayBuffer, context) {
    return new Promise(function (resolve, reject) {
        if (!context) {
            if (typeof window !== "undefined") {
                context = new (window.AudioContext || window.webkitAudioContext);
            }
        }
        if (context) {
            context.decodeAudioData(arrayBuffer, function (data) {
                resolve(data);
            }, reject);
        } else {
            resolve("");
        }
    });
}

export default {
    arrayBufferToAudioBuffer,
};