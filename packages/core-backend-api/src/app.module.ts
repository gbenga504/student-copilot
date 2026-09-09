import { Module } from "@nestjs/common";

import { HealthController } from "./health.controller";
import { ConfigurationModule } from "./utils/configuration/configuration.module";

@Module({
  imports: [ConfigurationModule],
  controllers: [HealthController],
})
export class AppModule {}
