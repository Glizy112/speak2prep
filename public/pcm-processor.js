//pcm-processor.js
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input.length > 0 && input[0]) {
      const channelData = input[0]; //Channel 1 (Mono)

      //Convert Float32 samples to Int16 PCM array
      const pcm16 = new Int16Array(channelData.length);
      for (let i = 0; i < channelData.length; i++) {
        pcm16[i] = Math.max(-1, Math.min(1, channelData[i])) * 0x7fff;
      }

      //Send the Int16 buffer array back to the main UI thread
      this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
    }
    return true; //Keep the processor alive
  }
}

registerProcessor('pcm-processor', PCMProcessor);