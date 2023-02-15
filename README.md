# mcu-programmer

Simple vscode extension to copy firmware.hex to another directory.

## Features

* Copy firmware.hex to another directory
* Saves source and destination path inbetween vscode sessions

## Usage

When opening a platformIO workspace the extension will be active and you simply press the status bar button to copy the firmware.hex to the destination path.

If no source path is set, the extension will try to find the firmware.hex in the current workspace. If this fails, you will be prompted to set the source path.

If no destination path is set, you will be prompted to set the destination path.


## commands
You can also access the following commands via the command palette (Ctrl+Shift+P):

* **MCUProgrammer: Reset stored paths**
    
    Reset the stored paths for source and destination.

* **MCUProgrammer: Set source path for firmware.hex**

    Set the source path for firmware.hex. This is the path to the file that will be copied to the destination path.

* **MCUProgrammer: Set destination path for firmware.hex**

    Set the destination path for firmware.hex. This is the path to the file that will be copied from the source path.

* **MCUProgrammer: Copy firmware.hex to destination**

    Copy firmware.hex from source path to destination path.
