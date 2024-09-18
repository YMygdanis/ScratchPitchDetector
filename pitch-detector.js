const Pitchfinder = (function() {
    
  function YINDetector(config) {
    const threshold = (config && config.threshold) || 0.1;
    const sampleRate = (config && config.sampleRate) || 44100;
    return function(float32AudioBuffer) {
      const yinBufferLength = Math.floor(float32AudioBuffer.length / 2);
      const yinBuffer = new Float32Array(yinBufferLength);
      let probability, tau;
      for (let t = 0; t < yinBufferLength; t++) {
        yinBuffer[t] = 0;
      }
      for (let t = 1; t < yinBufferLength; t++) {
        for (let i = 0; i < yinBufferLength; i++) {
          const delta = float32AudioBuffer[i] - float32AudioBuffer[i + t];
          yinBuffer[t] += delta * delta;
        }
      }
      yinBuffer[0] = 1;
        
      let runningSum = 0;
      for (let t = 1; t < yinBufferLength; t++) {
        runningSum += yinBuffer[t];
        yinBuffer[t] *= t / runningSum;
      }
      for (let t = 2; t < yinBufferLength; t++) {
        if (yinBuffer[t] < threshold) {
          while (t + 1 < yinBufferLength && yinBuffer[t + 1] < yinBuffer[t]) {
            t++;
          }
          tau = t;
          break;
        }
      }
      if (tau === undefined) {
        return null;
      }
      const betterTau = tau;
      const frequency = sampleRate / betterTau;
      probability = 1 - yinBuffer[tau];
      if (probability < 0.1 || frequency > 5000) {
        return null;
      }
      return frequency;
    };
  }
  return {
    YIN: YINDetector,
  };
})();

class PitchDetector {
  constructor(runtime) {
    this.runtime = runtime;
    this.frequency = 0;
    this.note = '-'; // Ορισμός αρχικής τιμής σε '-'
    this.noteNumber = 0;
    this.micOpen = false;
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.isListening = false;
    this.pitchDetector = null;
    this.dataArray = null;
  }

  getInfo() {
    return {
      id: 'pitchdetector',
      name: 'Pitch Detector',
      color1: '#AA00FF',
      blocks: [
        {
          opcode: 'startListening',
          blockType: Scratch.BlockType.COMMAND,
          text: 'start listening',
        },
        {
          opcode: 'stopListening',
          blockType: Scratch.BlockType.COMMAND,
          text: 'stop listening',
        },
        {
          opcode: 'getFrequency',
          blockType: Scratch.BlockType.REPORTER,
          text: 'frequency (Hz)',
        },
        {
          opcode: 'getNote',
          blockType: Scratch.BlockType.REPORTER,
          text: 'note',
        },
        {
          opcode: 'getNoteNumber',
          blockType: Scratch.BlockType.REPORTER,
          text: 'note number',
        },
        {
          opcode: 'isMicOpen',
          blockType: Scratch.BlockType.BOOLEAN,
          text: 'mic is open',
        },
      ],
    };
  }

  startListening() {
    if (this.isListening) return;
    this.isListening = true;
    this.micOpen = true;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.dataArray = new Float32Array(this.analyser.fftSize);
      this.microphone.connect(this.analyser);
      this.pitchDetector = Pitchfinder.YIN({ sampleRate: this.audioContext.sampleRate });
      this.updatePitch();
    });
  }

  stopListening() {
    if (!this.isListening) return;
    this.isListening = false;
    this.micOpen = false;
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.pitchDetector = null;
    this.frequency = 0;
    this.note = '-'; // Επαναφορά της τιμής σε '-'
    this.noteNumber = 0;
  }

  getFrequency() {
    return Math.round(this.frequency) || 0;
  }

  getNote() {
    return this.note || '-';
  }

  getNoteNumber() {
    return this.noteNumber || 0;
  }

  isMicOpen() {
    return this.micOpen;
  }

  updatePitch() {
    if (!this.isListening) return;
    const sampleCount = 5;
    const notesArray = [];
    for (let i = 0; i < sampleCount; i++) {
      this.analyser.getFloatTimeDomainData(this.dataArray);
      const frequency = this.pitchDetector(this.dataArray);
      if (frequency) {
        const noteNumber = this.frequencyToMidiNoteNumber(frequency);
        const note = this.midiNoteNumberToNoteName(noteNumber);
        notesArray.push({ note, noteNumber, frequency });
      }
    }
    const noteCounts = {};
    for (const item of notesArray) {
      const noteNum = item.noteNumber;
      if (noteNum !== null && noteNum !== undefined) {
        noteCounts[noteNum] = (noteCounts[noteNum] || 0) + 1;
      }
    }
    let mostFrequentNoteNumber = null;
    let maxCount = 0;
    for (const noteNum in noteCounts) {
      if (noteCounts[noteNum] > maxCount) {
        maxCount = noteCounts[noteNum];
        mostFrequentNoteNumber = parseInt(noteNum);
      }
    }
    if (mostFrequentNoteNumber !== null) {
      this.noteNumber = mostFrequentNoteNumber;
      this.note = this.midiNoteNumberToNoteName(this.noteNumber);
      const frequenciesOfMostFrequentNote = notesArray
        .filter(item => item.noteNumber === this.noteNumber)
        .map(item => item.frequency);
      const sumFrequencies = frequenciesOfMostFrequentNote.reduce((a, b) => a + b, 0);
      this.frequency = sumFrequencies / frequenciesOfMostFrequentNote.length;
    } else {
      this.note = '-'; // Ορισμός της τιμής σε '-'
      this.noteNumber = 0;
      this.frequency = 0;
    }
    requestAnimationFrame(this.updatePitch.bind(this));
  }

  frequencyToMidiNoteNumber(frequency) {
    const noteNumber = 12 * (Math.log2(frequency / 440)) + 69;
    return Math.round(noteNumber);
  }

  midiNoteNumberToNoteName(noteNumber) {
    const noteStrings = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B' ];
    const noteIndex = (noteNumber % 12 + 12) % 12;
    const octave = Math.floor(noteNumber / 12) - 1;
    const note = noteStrings[noteIndex];
    return note + octave;
  }
}

Scratch.extensions.register(new PitchDetector());
