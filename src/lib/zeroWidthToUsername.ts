const zeroWidthToBinary = (stringToCOnvert: string) => (
    stringToCOnvert.split('﻿').map((char) => { // invisible &#65279;
        if (char === '​') { // invisible &#8203;
            return '1';
        } else if (char === '‌') { // invisible &#8204;
            return '0';
        }
        return ' '; // split up binary with spaces;
    }).join('')
);

const binaryToText = (stringToCOnvert: string) => (
    stringToCOnvert.split(' ').map(num => String.fromCharCode(parseInt(num, 2))).join('')
);

const zeroWidthToString = (zeroWidthUsername) => {
    const binaryUsername = zeroWidthToBinary(zeroWidthUsername);
    const textUsername = binaryToText(binaryUsername);
    return textUsername;
};

export default zeroWidthToString;
