'use strict';
import { mainMenuKeyboard } from "../keyboardMarkups";

export default async function menuHandler(ctx) {
    return ctx.reply(`Main Menu`, mainMenuKeyboard);
}