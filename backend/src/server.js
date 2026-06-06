import { app } from './app.js';
import { config, realTradingGateIsOpen } from './config.js';

app.listen(config.port, () => {
  console.log(`Cidentia Market Intelligence & Risk Engine running on port ${config.port}`);
  console.log(`Trading mode: ${config.tradingMode}`);
  console.log(`Real trading gate open: ${realTradingGateIsOpen()}`);
});
