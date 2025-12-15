import type { Level } from 'ledger/struct';

export interface FileHandlerOptions {
  /** If level is less than or equal to this specified level, the even will be logged. */
  level?: Level;

  /** The configuration for File Rotation Handling. */
  configured: {
    /** The absolute path to store logged files. Use `new URL('./ledger/', import.meta.url).href` as an example. */
    path: string;
    /** The name of the file only. Eg, `ledger.log`. Default: 'ledger.log'. */
    fileName: string;
    /** The max amount of files to be stored. Default: 10. */
    maxFileCount?: number;
    /** The rough maximum file size to begin rotation. Default: 100. */
    roughMaxSizeMB?: number;
    /** The rate, in seconds, to poll if a file should be rotated. Min 5, max 60. Default: 15. */
    fileSizePollRate?: number;
    /** If tar.gz compression should be used. Default: 'tar.gz'. */
    compress?: 'none' | 'tar.gz';
  };
}
