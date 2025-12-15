# file-handler

An is an addon for the [Ledger](https://github.com/TSLedger/ledger) Project. Ledger is a customizable interface for logging written in TypeScript. This add is designed to work with only Ledger's TypeScript-based, batteries-included API. We focus on giving you a powerful and extensible solution for your projects.

Please refer to [Ledger](https://github.com/TSLedger/ledger) Documentation for usage.

## Add-on Focus Features

- **File-based Storage**: This addon is primary focused on provided a file handler backend to store log entries to local disk.
- **File Rotation**: Files can be rotated based on the file size and archived to a tar.gz for optimization.
- **Async Locking**: This handler employs [async-mutex](https://www.npmjs.com/package/async-mutex) to handle interrupting logging to rotate the file.

## Ledger Features

- **Flexible Logging**: Supports multiple formats, destinations, and levels of logging, all tailored to your needs.
- **TypeScript Support**: Fully typed for ease of use and developer experience.
- **Seamless Integration**: Directly integrates with the Ledger API, leveraging its built-in features for consistency.

## Addon Features

- **Log Filtering**: Filter events based on the the severity.
- **Log Format**: Utilize template string variables to customize the output to files.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [ledger](https://github.com/TSLedger/ledger): The core logging framework that powers this addon.
