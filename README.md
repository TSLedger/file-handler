# handler-template

An is an addon for the [Ledger](https://github.com/TSLedger/ledger) Project. Ledger is a customizable interface for logging written in TypeScript. This add is designed to work with only Ledger's TypeScript-based, batteries-included API. We focus on giving you a powerful and extensible solution for your projects.

## Ledger Features

- **Flexible Logging**: Supports multiple formats, destinations, and levels of logging, all tailored to your needs.
- **TypeScript Support**: Fully typed for ease of use and developer experience.
- **Seamless Integration**: Directly integrates with the Ledger API, leveraging its built-in features for consistency.

## Addon Features

- TODO: Change
- **Log Filtering**: Filter events based on the the severity.
- **Log Format**: Utilize template string variables to customize the output to files.

### Basic Usage

```ts
import { Ledger } from 'jsr:@ledger/ledger';

const ledger = new Ledger({
  useAsyncDispatchQueue: true,
})
  .register({
    definition: 'jsr:@ledger/transport-name@0.0.1', // Version is Important
  });

// ledger.trace, ledger.information, ledger.warning, ledger.severe
ledger.information('Hello, world');
```

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [ledger](https://github.com/TSLedger/ledger): The core logging framework that powers this addon.
