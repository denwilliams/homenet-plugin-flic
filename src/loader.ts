import { plugin, service, Dict, IPluginLoader, ILogger, IConfig, IButtonManager, IButton } from 'homenet-core';
import { FlicClient } from './client';

@plugin()
export class FlicPluginLoader implements IPluginLoader {
  private _logger : ILogger;
  private _config : IConfig;
  private _controllers : Dict<FlicClient>;

  constructor(
          @service('IButtonManager') buttons: IButtonManager,
          @service('IConfig') config: IConfig,
          @service('ILogger') logger: ILogger) {

    this._logger = logger;
    this._config = config;

    this._init();

    buttons.addType('flic', this._createFactory());
    // sensors.addType('zway', sensorFactory);
  }

  load() : void {
    this._logger.info('Connecting to Flic servers...');
    Object.keys(this._controllers).forEach(key => {
      this._controllers[key].start();
    });
  }

  private _init() : void {
    this._logger.info('Starting Flic plugin');

    const zwayConfig = (<any>this._config).zway || {};
    const controllersConfigs = zwayConfig.controllers || [];

    this._controllers = {};
    controllersConfigs.forEach(c => {
      this._controllers[c.id] = new FlicClient(c.id, c.host, c.port);
    });
  }

  private _createFactory() {
    return (id: string, opts: {address: string, controller: string}) : IButton => {
      this._logger.info(`Adding Flic button: ${id}`);
      const client: FlicClient = this._controllers[opts.controller];
      return client.getButton(id, opts.address);
    };
  }
}
