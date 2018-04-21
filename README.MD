# zero-width-bot-telegram

[![Telegram](https://img.shields.io/badge/Telegram-Lilith%20Tundrus-blue.svg)](https://telegram.me/lilithtundrus) [![Build Status](https://travis-ci.org/LilithTundrus/zero-width-bot-telegram.svg?branch=master)](https://travis-ci.org/LilithTundrus/zero-width-bot-telegram)

**PLEASE NOTE THIS IS IN BETA DEVELOPMENT PHASE** 


## About

This is a bot for Telegram that will let you detect, clean, encode and deocde zero-width messages. You can use this bot by clicking [This link](https://telegram.me/zero_width_messenger_bot) or by messaging @zero_width_messenger_bot on Telegram.


## What's This Zero-Width Thing?

If you're not sure what zero-width characters are or what they can be used for check out [This Medium Article](https://medium.com/@umpox/be-careful-what-you-copy-invisibly-inserting-usernames-into-text-with-zero-width-characters-18b4e6f17b66)


## Using The Bot


### 🔍 Detect

![Detect Mode](https://github.com/LilithTundrus/zero-width-bot-telegram/blob/master/iamges/detect.png)

The **🔍 Detect** or **/detect** command can help you detect zero-width characters from pasted text or from a (up to 16KB) text file. If a message or set of zero-width characters is detected, the bot will attempt to display the hidden message


### 💊 Clean

![Clean Mode](https://github.com/LilithTundrus/zero-width-bot-telegram/blob/master/iamges/clean.png)

The **💊 Clean** or **/clean** command can help you remove zero-width characters from pasted text or from a (up to 16KB) text file. This command will return a cleaned message or file upon completion


### ✉️ Encode

![Encode Mode](https://github.com/LilithTundrus/zero-width-bot-telegram/blob/master/iamges/encode.png)

The **✉️ Encode** or **/encode** command allows you to encode a hidden message using zero-width chracters inside a file or a **container** (proxy message)


### 📨 Decode

![Clean Mode](https://github.com/LilithTundrus/zero-width-bot-telegram/blob/master/iamges/decode.png)

The **📨 Decode** or **/decode** command will check for zero-width characters in a message of a dile file (up to 16KB) and attempt to decode the message inside the zero-width characters. This means that the bot can **📨 Decode** its own **✉️ Encode** messages!


## History

- **v0.1.1**
    - If an `encode` container has spaces, the first will be used to hide the message, reducing acidental discovery


- **v0.1.0**
    - Initial stable release


## Issues

Do you have any issues or recommendations for this package? Feel free to open an issue in the [issue](https://github.com/LilithTundrus/zero-width-bot-telegram/issues) section. I'm always happy to help :D


## License

This project is licensed under the MIT License - see the LICENSE file for details