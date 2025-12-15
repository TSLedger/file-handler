import type { Level } from 'ledger/struct';

export interface FileHandlerOptions {
  /** If level is less than or equal to this specified level, the even will be logged. */
  level?: Level;

  /** The configuration for File Rotation Handling. */
  configured: {
    path: string;
    fileName: string;
    maxFileCount?: number;
    roughMaxSizeMB?: number;
    compress?: 'none' | 'tar.gz';
  };
}
