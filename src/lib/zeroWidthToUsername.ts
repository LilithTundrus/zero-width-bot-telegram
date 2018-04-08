const zeroWidthToBinary = (stringToConvert: string) => (
    stringToConvert.split('﻿').map((char) => { // invisible &#65279;
        if (char === '​') { // invisible &#8203;
            return '1';
        } else if (char === '‌') { // invisible &#8204;
            return '0';
        }
        return ' '; // split up binary with spaces;
    }).join('')
);

const binaryToText = (stringToConvert: string) => (
    stringToConvert.split(' ').map(num => String.fromCharCode(parseInt(num, 2))).join('')
);

const zeroWidthToString = (zeroWidthString) => {
    const binaryString = zeroWidthToBinary(zeroWidthString);
    const textString = binaryToText(binaryString);
    return textString;
};

export default zeroWidthToString;
