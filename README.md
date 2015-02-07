Donkey
======

Donkey provides a HTTP server that allows you to query and control stuff in your home.
The idea is that the server provides generic functions that a customized client can call.
I created a AngularJS client which can be found in /public/ui/.
This is customized to my home, so it only serves as an example. Hopefully you're not in my LAN so I'm safe. ;-)

I put together some crude [Server API documentation](http://docs.donkey.apiary.io).

![Screenshot](https://thunderklaus.github.com/donkey/images/ScreenShot01.png)

This is a screenshot of my customized UI. If a box has a green background, that system was pinged successfully. Yellow means ping failed.

## Features
* **Switches** (sockets) can be triggered on and off.
Requirement for this is that you have a 433 MHz transmitter attached to your Pi.
[Here is a link to a guide](http://ninjablocks.com/blogs/how-to/7506204-adding-433-to-your-raspberry-pi).
You will also need a *send* command in your Pi's path, see these projects: [https://github.com/WiringPi](https://github.com/WiringPi), [https://github.com/ninjablocks/433Utils](https://github.com/ninjablocks/433Utils)
* **WOL** (Wake on Lan) allows you to wake up devices using their MAC address
* **Ping** any hosts to see if they are online

## Running
You need to have node and npm installed on your Pi.

* npm install
* npm start (does a sudo because the ping module is required to open a raw socket)

## See also:
This project has many similarities to [heimcontrol.js](http://ni-c.github.io/heimcontrol.js/)
