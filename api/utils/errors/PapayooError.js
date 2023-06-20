function PapayooError(message) {
    this.message = message;
    this.name = 'PapayooError';
}

function getErrorMessage(defaultMessage, error) {
    return error instanceof PapayooError ? error.message : defaultMessage;
}

module.exports = { PapayooError, getErrorMessage };