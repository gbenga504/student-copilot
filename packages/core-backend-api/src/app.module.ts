import { Module } from "@nestjs/common";

import { ConfigurationModule } from "./global/configuration/configuration.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [ConfigurationModule],
  controllers: [HealthController],
})
export class AppModule {}
