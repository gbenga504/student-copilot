import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { ConfigurationService } from "./utils/configuration/configuration.service";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configuration = app.get(ConfigurationService);

  await app.listen(configuration.getOrDefault("PORT", 3000));
}

bootstrap();
