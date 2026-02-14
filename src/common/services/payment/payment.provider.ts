import { ConfigService } from "@nestjs/config";
import { STRIPE_CLIENT } from "src/common/constants/constants";
import Stripe from "stripe";


export const StripeProvider = {
    provide: STRIPE_CLIENT,
    useFactory: (configService: ConfigService)=> new Stripe(configService.get('STRIPE_SECRET_KEY')!),
    inject: [ConfigService]
}