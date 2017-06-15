import { Dict, IPluginLoader, ILogger, IConfig, IButtonManager, IButton } from '@homenet/core';
import { FlicClient } from './client';

export function create(annotate): { FlicPluginLoader: new(...args: any[]) => IPluginLoader } {

  @annotate.plugin()
  class FlicPluginLoader implements IPluginLoader {
    private _logger : ILogger;
    private _config : IConfig;
    private _controllers : Dict<FlicClient>;

    constructor(
            @annotate.service('IButtonManager') buttons: IButtonManager,
            @annotate.service('IConfig') config: IConfig,
            @annotate.service('ILogger') logger: ILogger) {

      this._logger = logger;
      this._config = config;

      this._init();

      buttons.addType('flic', this._createFactory());
    }

    load() : void {
      this._logger.info('Connecting to Flic servers...');
      Object.keys(this._controllers).forEach(key => {
        this._controllers[key].start();
      });
    }

    private _init() : void {
      this._logger.info('Starting Flic plugin');

      const flicConfig = (<any>this._config).flic || {};
      const serversConfigs = flicConfig.servers || [];

      this._controllers = {};
      serversConfigs.forEach(c => {
        const client = new FlicClient(c.id, c.host, c.port);
        this._controllers[c.id] = client;
        client.on('error', (err) => {
          this._logger.warn(`Unable to connect to Flic daemon: ${err.message}`);
        });
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

  return { FlicPluginLoader };
}
