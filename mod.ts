import type { BinderOption, DispatchMessageContext, WorkerHandler } from './deps.ts';
import type { TemplateHandlerOptions } from './lib/option.ts';

export class Handler implements WorkerHandler {
  private readonly options: TemplateHandlerOptions;

  public constructor(options: BinderOption) {
    this.options = options;
    // deno-lint-ignore no-console
    console.info(this.options);
  }

  // deno-lint-ignore require-await
  public async receive({ context }: DispatchMessageContext): Promise<void> {
    // deno-lint-ignore no-console
    console.info(context);
  }
}
