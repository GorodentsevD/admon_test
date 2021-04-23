'use strict';

const bufferImplementations = {
    'native': require('./native'),
    'redis': require('./redis')
}


module.exports = (impl) => {
    if (!bufferImplementations[impl]) throw new Error('Unknown buffer implementation');

    return bufferImplementations[impl];
}
