module.exports = api_error_enum = {
    UNKNOWN_ERROR: -1,        
    MALFORMED_AUTHORIZATION: 1,        
    INVALID_ENTITY: 2,        
    FORBIDDEN: 3,        
    ACCOUNT_NUMBER_INVALID: 1032,        
    PAYMENT_NOT_FOUND: 1051,        
    MECHANT_ACCOUNT_NOT_ASSOCIATED: 1068,        
    WALLET_ACCOUNT_NOT_FOUND: 1069,        
    MARKETPLACE_INFO_REQUIRED: 1070,        
    PAYMENT_EXCEEDS_MERCHANT_LIMIT: 1076,        
    PAYMENT_AMOUNT_INVALID: 1077,        
    CURRENCY_NOT_SUPPORTED: 1078,        
    IDEMPOTENCY_KEY_ALREADY_USED: 1083,        
    CANNOT_BE_CANCELLED: 1084,        
    CANNOT_BE_REFUNDED: 1085,        
    ALREADY_CANCELLED: 1086,        
    REFUND_EXCEEDS_PAYMENT: 1087,        
    INVALID_SOURCE_ACCOUNT: 1088,        
    SOURCE_ACCOUNT_NOT_FOUND: 1089,        
    INVALID_WIRE_ROUTING_NUMBER: 1091,        
    INVALID_WIRE_IBAN: 1092,        
    SOURCE_ACCOUNT_INSUFFICIENT_FUNDS: 1093,        
    LAST_NAME_REQUIRED: 1094,        
    PUBLIC_KEY_ID_NOT_FOUND: 1096,        
    ORIGINAL_PAYMENT_FAILED: 1097,        
    WIRE_PAYMENT_AMOUNT_FAILED: 1098,        
    MERCHANT_WALLET_ID_MISSING: 1099,        
    INVALID_FIAT_ACCOUNT_TYPE: 1100,        
    INVALID_COUNTRY_FORMAT: 1101,        
    IBAN_COUNTRY_MISMATCH: 1102,        
    IBAN_REQUIRED: 1103,        
    ADDITIONAL_BANK_DETAILS_REQUIRED: 1104,        
    ADDITIONAL_BILLING_DETAILS_REQUIRED: 1105,        
    INVALID_DISTRICT_FORMAT: 1106,        
    PAYOUT_LIMIT_EXCEEDED: 1107,        
    UNSUPPORTED_COUNTRY: 1108,        
    INVALID_BIN_RANGE: 1109,        
    INVALID_CARD_NUMBER: 1110,        
    RECIPIENT_ADDRESS_ALREADY_EXISTS: 2003,        
    ADDRESS_NOT_VERIFIED_FOR_WITHDRAWAL: 2004,        
    ADDRESS_ON_UNSUPPORTED_BLOCKCHAIN: 2005,        
    WALLET_TYPE_NOT_SUPPORTED: 2006,        
    UNSUPPORTED_TRANSFER: 2007
};
// todo these need to go in where we check response code