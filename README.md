# Pitch Detector Scratch Extension

A custom Scratch extension that uses the microphone to detect pitch and convert it into musical notes. This extension allows Scratch projects to interact with live audio input, providing real-time frequency analysis and note recognition.

## Features

-   **Start and Stop Listening**: Control when the extension listens to the microphone.
-   **Frequency Detection**: Reports the detected frequency in Hertz.
-   **Note Recognition**: Converts the frequency to a musical note (e.g., C4, D#5).
-   **MIDI Note Number**: Provides the MIDI note number corresponding to the detected note.
-   **Microphone Status**: Indicates whether the microphone is currently open.

## Installation

### Prerequisites

-   **Scratch Editor**: You need access to the Scratch editor, preferably the offline version or a version that allows loading custom extensions.
-   **Web Browser**: A modern web browser that supports the Web Audio API (e.g., Chrome, Firefox).

### Steps

1.  **Clone or Download the Repository**
    
    -   Clone the repository using Git:
        
        bash
        
        Copy code
        
        `git clone https://github.com/yourusername/pitch-detector-scratch-extension.git `
        
    -   Or download the ZIP file from GitHub and extract it to a folder.
        
2.  **Locate the Extension File**
    
    -   The main extension file is `pitch-detector.js`.
3.  **Open Scratch Editor**
    
    -   Open the Scratch editor in your web browser.
4.  **Load the Extension**
    
    -   In the Scratch editor, click on the "Extensions" button (the icon with the plus sign at the bottom left).
    -   Scroll to the bottom and click on "Load from your computer".
    -   Navigate to the folder where `pitch-detector.js` is located and select it.
5.  **Grant Microphone Access**
    
    -   Your browser will prompt you to allow microphone access. Click "Allow" to enable the extension to use the microphone.

## Usage

### Blocks Provided

The extension adds a new category called **"Pitch Detector"** with the following blocks:

-   **start listening**
    
    -   **Block Type**: Command
    -   **Description**: Begins listening to the microphone for pitch detection.
-   **stop listening**
    
    -   **Block Type**: Command
    -   **Description**: Stops listening to the microphone.
-   **frequency (Hz)**
    
    -   **Block Type**: Reporter
    -   **Description**: Reports the detected frequency in Hertz.
-   **note**
    
    -   **Block Type**: Reporter
    -   **Description**: Reports the musical note corresponding to the detected frequency (e.g., "C4"). Returns `'-'` if no note is detected.
-   **note number**
    
    -   **Block Type**: Reporter
    -   **Description**: Reports the MIDI note number corresponding to the detected note.
-   **mic is open**
    
    -   **Block Type**: Boolean
    -   **Description**: Returns `true` if the microphone is currently open and listening, `false` otherwise.

### Example Project

Here is a simple example of how to use the extension in a Scratch project:

scratch

Copy code

`when green flag clicked 
start listening forever   
if <(mic is open) = [true]> then     
say (join [Note: ] (note)) for (0.5) seconds   else     
say [Microphone is closed] for (0.5) seconds  
end 
end `

This script starts listening to the microphone when the green flag is clicked and continuously displays the detected note.

### Notes

-   **Initial Values**: When the extension starts, the frequency is set to `0`, and the note is set to `'-'`.
-   **No Detected Note**: If no note is detected, the `note` reporter block will return `'-'`.

## Dependencies

The extension uses the following technologies:

-   **Web Audio API**: For accessing the microphone and audio data.
-   **YIN Algorithm**: Utilizes the YIN pitch detection algorithm for accurate pitch detection.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

-   **YIN Pitch Detection**: The extension implements the YIN algorithm for pitch detection, inspired by the [Pitchfinder](https://github.com/peterkhayes/pitchfinder) library by Peter Hayes.

## Contact
For any questions or suggestions, please open an issue on the GitHub repository or contact me at yannis.mygdanis@icloud.com.
