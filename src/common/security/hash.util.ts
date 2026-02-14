import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
// import {config} from 'dotenv';
// config();

export const hash = async (text: string, saltRound: number = new ConfigService().get('SALT_ROUND')!) => {
    return await bcrypt.hash(text, Number(saltRound));
};

export const compareHash = async (text: string, hash: string) => {
    return await bcrypt.compare(text, hash);
};