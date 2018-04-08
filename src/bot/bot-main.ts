'use strict';
import Telegraf from 'telegraf';
import { botToken } from '../config/config';

// Create a new bot instance using our token and export it
const bot = new Telegraf(botToken);
export default bot;