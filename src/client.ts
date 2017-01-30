import { IButton } from '@homenet/core';
import { EventEmitter } from 'events';
import { FlicConnectionChannel, FlicClient as FlicLibClient } from './fliclib';
import { FlicButton } from './button';

export class FlicClient extends EventEmitter {
  public id: string;

  private _client: any;
  private _online: boolean = false;

  constructor(id: string, host: string = 'localhost', port: number = 5551) {
    super();
    this.id = id;
    this._init(host, port); // probably should move this to a start method
  }

  public getButton(id: string, address: string) : IButton {
    var channel = new FlicConnectionChannel(address);
    this._client.addConnectionChannel(channel);
    return new FlicButton(channel);
  }

  public start() : void {

  }

  private _init(host: string, port: number) {
    const client = new FlicLibClient(host, port);

    client.on('ready', () => {
      if (this._online) return;
      this._online = true;
      this.emit('online');
    });

    client.on('error', error => {
      this.emit('error', error);
    });

    client.on('close', hadError => {
      if (!this._online) return;
      this._online = false;
      this.emit('offline');
    });

    // client.on('bluetoothControllerStateChange', state => {
    //   console.log("Bluetooth controller state change: " + state);
    // });

    // client.on("newVerifiedButton", bdAddr => {
    //   console.log("A new button was added: " + bdAddr);
    //   listenToButton(bdAddr);
    // });

    this._client = client;
  }
}

