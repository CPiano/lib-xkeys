var EventEmitter = require('events').EventEmitter;
var HID = require('node-hid');
var _ = require('lodash');
var util = require('util');

function XR32() {
  EventEmitter.call(this);

  var devices = HID.devices();
  var xkeysPath = _.find(devices, {'vendorId':0x5f3, 'productId':0x4ff,'interface':0}).path;
  this.dev = new HID.HID(xkeysPath);

  this.lastKeyState = 0;
  this.dev.on('data', this.handleInputReport.bind(this));

  this.sendOutputReport(177, []);
  this.sendOutputReport(182, [0, 0]);
  this.sendOutputReport(182, [1, 0]);
}

util.inherits(XR32, EventEmitter);

XR32.prototype.allLightsOff = function () {
  this.sendOutputReport(182, [0, 0]);
  this.sendOutputReport(182, [1, 0]);
};

XR32.prototype.sendOutputReport = function (command, data) {
  var sendData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

  sendData[0] = 0;
  sendData[1] = command;

  for (var i = 0; i < data.length; i++) {
    sendData[i + 2] = data[i];
  }
  
  this.dev.write(sendData);
};

var masks = [
  0x00000001,
  0x00000002,
  0x00000004,
  0x00000008,
  0x00000010,
  0x00000020,
  0x00000040,
  0x00000080,
  0x00000100,
  0x00000200,
  0x00000400,
  0x00000800,
  0x00001000,
  0x00002000,
  0x00004000,
  0x00008000,
  0x00010000,
  0x00020000,
  0x00040000,
  0x00080000,
  0x00100000,
  0x00200000,
  0x00400000,
  0x00800000,
  0x01000000,
  0x02000000,
  0x04000000,
  0x08000000,
  0x10000000,
  0x20000000,
  0x40000000,
  0x80000000
];

XR32.prototype.handleInputReport = function (data) {
  var currentKeyState;
  var changedKeyState;

  if (0 === data[1] || 2 === data[1]) {
    currentKeyState = data.readUInt32LE(2);
    changedKeyState = this.lastKeyState ^ currentKeyState;
    this.lastKeyState = currentKeyState;
    
    for (var i = 0; i < 32; i += 1) {
      if ((changedKeyState & masks[i]) != 0) {
        if ((currentKeyState & masks[i]) != 0) {
          this.emit('keydown', i);
        } else {
          this.emit('keyup', i);
        }
      }
    }
  }
};

XR32.prototype.generateData = function () {
  this.sendOutputReport(177, []);
};

XR32.prototype.requestDescriptor = function () {
  this.sendOutputReport(214, []);
};

XR32.prototype.setBacklightIntensity = function (blue, red) {
  this.sendOutputReport(187, [blue, red]);
};

XR32.prototype.redLightOn = function (button) {
  this.sendOutputReport(181, [button + 32, 1]);
};

XR32.prototype.redLightFlash = function (button) {
  this.sendOutputReport(181, [button + 32, 2]);
};

XR32.prototype.redLightOff = function (button) {
  this.sendOutputReport(181, [button + 32, 0]);
};

XR32.prototype.blueLightOn = function (button) {
  this.sendOutputReport(181, [button, 1]);
};

XR32.prototype.blueLightFlash = function (button) {
  this.sendOutputReport(181, [button, 2]);
};

XR32.prototype.blueLightOff = function (button) {
  this.sendOutputReport(181, [button, 0]);
};

XR32.prototype.redLedOn = function () {
  this.sendOutputReport(179, [7, 1]);
};

XR32.prototype.redLedFlash = function () {
  this.sendOutputReport(179, [7, 2]);
};

XR32.prototype.redLedOff = function () {
  this.sendOutputReport(179, [7, 0]);
};

XR32.prototype.greenLedOn = function () {
  this.sendOutputReport(179, [6, 1]);
};

XR32.prototype.greenLedFlash = function () {
  this.sendOutputReport(179, [6, 2]);
};

XR32.prototype.greenLedOff = function () {
  this.sendOutputReport(179, [6, 0]);
};

XR32.prototype.setFlashRate = function (freq) {
  this.sendOutputReport(180, [freq]);
};

module.exports = new XR32();

