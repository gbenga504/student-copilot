import { Injectable } from "@nestjs/common";

@Injectable()
export class ConfigurationService {
  get(name: string): string {
    const value = process.env[name];

    if (value === undefined) {
      throw new Error(`Environment variable "${name}" is not defined`);
    }

    return value;
  }

  getOrDefault<T>(name: string, defaultValue: T): string | T {
    return process.env[name] ?? defaultValue;
  }
}
