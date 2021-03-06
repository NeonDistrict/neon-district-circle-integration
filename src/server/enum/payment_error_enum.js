module.exports = payment_error_enum = {
    PAYMENT_FAILED: 'payment_failed', 
    PAYMENT_FRAUD_DETECTED: 'payment_fraud_detected', 
    PAYMENT_DENIED: 'payment_denied', 
    PAYMENT_NOT_SUPPORTED_BY_ISSUER: 'payment_not_supported_by_issuer', 
    PAYMENT_NOT_FUNDED: 'payment_not_funded', 
    PAYMENT_UNPROCESSABLE: 'payment_unprocessable', 
    PAYMENT_STOPPED_BY_ISSUER: 'payment_stopped_by_issuer', 
    PAYMENT_CANCELED: 'payment_canceled', 
    PAYMENT_RETURNED: 'payment_returned', 
    PAYMENT_FAILED_BALANCE_CHECK: 'payment_failed_balance_check', 
    CARD_FAILED: 'card_failed', 
    CARD_INVALID: 'card_invalid', 
    CARD_ADDRESS_MISMATCH: 'card_address_mismatch', 
    CARD_ZIP_MISMATCH: 'card_zip_mismatch', 
    CARD_CVV_INVALID: 'card_cvv_invalid', 
    CARD_EXPIRED: 'card_expired', 
    CARD_LIMIT_VIOLATED: 'card_limit_violated', 
    CARD_NOT_HONORED: 'card_not_honored', 
    CARD_CVV_REQUIRED: 'card_cvv_required', 
    CREDIT_CARD_NOT_ALLOWED: 'credit_card_not_allowed', 
    CARD_ACCOUNT_INELIGIBLE: 'card_account_ineligible', 
    CARD_NETWORK_UNSUPPORTED: 'card_network_unsupported', 
    CHANNEL_INVALID: 'channel_invalid', 
    UNAUTHORIZED_TRANSACTION: 'unauthorized_transaction', 
    BANK_ACCOUNT_INELIGIBLE: 'bank_account_ineligible', 
    BANK_TRANSACTION_ERROR: 'bank_transaction_error', 
    INVALID_ACCOUNT_NUMBER: 'invalid_account_number', 
    INVALID_WIRE_RTN: 'invalid_wire_rtn', 
    INVALID_ACH_RTN: 'invalid_ach_rtn',

    VERIFICATION_FAILED: 'verification_failed',
    VERIFICATION_FRAUD_DETECTED: 'verification_fraud_detected',
    RISK_DENIED: 'risk_denied',
    VERIFICATION_NOT_SUPPORTED_BY_ISSUER: 'verification_not_supported_by_issuer',
    VERIFICATION_STOPPED_BY_ISSUER: 'verification_stopped_by_issuer',
    THREE_D_SECURE_NOT_SUPPORTED: 'three_d_secure_not_supported',
    THREE_D_SECURE_REQUIRED: 'three_d_secure_required',
    THREE_D_SECURE_FAILURE: 'three_d_secure_failure',
    THREE_D_SECURE_ACTION_EXPIRED: 'three_d_secure_action_expired',
    THREE_D_SECURE_INVALID_REQUEST: 'three_d_secure_invalid_request',

    //todo need to add these: https://developers.circle.com/docs/entity-errors#card-verification-error-codes
};