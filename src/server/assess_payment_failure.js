const fatal_error = require('./fatal_error.js');
const payment_error_enum = require('./enum/payment_error_enum.js');
const assess_payment_risk = require('./assess_payment_risk.js');

module.exports = assess_payment_failure = (config, postgres, user, internal_purchase_id, payment_result, mark_failed, mark_fraud, mark_unavailable, cb) => {
    // todo does risk come back as failed? or some other result?
    // this could go into the switch then
    // todo do we even need this is we have the below?
    /*
    const risk_error = assess_payment_risk(payment_result);
    if (risk_error) {
        return cb(risk_error);
    }
    */

    // todo: this could jus tbe error with fraud: 1
    let failure_error = null;
    let fraud_error = null;
    switch (payment_result.errorCode) {
        case payment_error_enum.PAYMENT_FAILED:
        case payment_error_enum.VERIFICATION_FAILED:
            failure_error = {
                error: 'Payment Failed (Unspecified)'
            };
            break;
        case payment_error_enum.PAYMENT_FRAUD_DETECTED:
        case payment_error_enum.VERIFICATION_FRAUD_DETECTED:
            fraud_error = {
                error: 'Fraud Detected (Contact Card Provider)',
                fraud: 1
            };
            break;
        // todo: i think these cases need breakouts
        case payment_error_enum.PAYMENT_DENIED: // todo: faurad? failure/
        case payment_error_enum.RISK_DENIED: // todo: like you should be fraud right?
        case payment_error_enum.VERIFICATION_NOT_SUPPORTED_BY_ISSUER: // todo: is this unavilable?
        case payment_error_enum.THREE_D_SECURE_FAILURE: // todo: fraud?
            failure_error = {
                error: 'Payment Denied (Contact Card Provider)'
            };
            break;
        case payment_error_enum.PAYMENT_NOT_SUPPORTED_BY_ISSUER:
        case payment_error_enum.CARD_NETWORK_UNSUPPORTED:
            failure_error = {
                error: 'Payment Not Supported (Contact Card Provider)'
            };
            break;
        case payment_error_enum.PAYMENT_NOT_FUNDED:
            failure_error = {
                error: 'Insufficient Funds (Contact Card Provider)'
            };
            break;
        case payment_error_enum.PAYMENT_STOPPED_BY_ISSUER:
        case payment_error_enum.VERIFICATION_STOPPED_BY_ISSUER:
            failure_error = {
                error: 'Payment Stopped (Contact Card Provider)'
            };
            break;
        // todo: is this fialure or fraud, i think failure?
        case payment_error_enum.UNAUTHORIZED_TRANSACTION:
            failure_error = {
                error: 'Payment Unauthorized (Contact Card Provider)'
            };
            break;
        case payment_error_enum.CARD_INVALID:
        case payment_error_enum.INVALID_ACCOUNT_NUMBER:
        case payment_error_enum.CARD_CVV_INVALID:
        case payment_error_enum.CARD_ADDRESS_MISMATCH:
        case payment_error_enum.CARD_ZIP_MISMATCH:
        case payment_error_enum.CARD_CVV_REQUIRED:
        case payment_error_enum.CARD_FAILED:
            failure_error = {
                error: 'Invalid Details (Correct Information)'
            };
            break;
        case payment_error_enum.CARD_EXPIRED:
            failure_error = {
                error: 'Card Expired'
            };
            break;
        case payment_error_enum.CARD_LIMIT_VIOLATED:
            failure_error = {
                error: 'Limit Exceeded (Circle Limit)'
            };
            break;
        case payment_error_enum.CARD_NOT_HONORED:
            failure_error = {
                error: 'Card Not Honored (Contact Card Provider)'
            };
            break;
        case payment_error_enum.CREDIT_CARD_NOT_ALLOWED:
            failure_error = {
                error: 'Card Not Allowed (Contact Card Provider)'
            };
            break;
        case payment_error_enum.CARD_ACCOUNT_INELIGIBLE:
        case payment_error_enum.BANK_ACCOUNT_INELIGIBLE:
            failure_error = {
                error: 'Ineligible Account (Contact Card Provider)'
            };
            break;
        case payment_error_enum.PAYMENT_FAILED_BALANCE_CHECK:
            failure_error = {
                error: 'Insufficient Balance (Contact Card Provider)'
            };
            break;
        case payment_error_enum.BANK_TRANSACTION_ERROR:
            failure_error = {
                error: 'Bank Transaction Error (Contact Card Provider)'
            };
            break;
        case payment_error_enum.PAYMENT_CANCELED:
            failure_error = {
                error: 'Payment Cancelled'
            };
            break;
        case payment_error_enum.PAYMENT_UNPROCESSABLE:
            config.cached_circle_key = null;
            failure_error = {
                error: 'Circle Key Failure'
            };
            break;
        case payment_error_enum.THREE_D_SECURE_NOT_SUPPORTED:
            if (!mark_unavailable) {
                return fatal_error({
                    error: 'Function Not Provided: mark_unavailable'
                });
            }
            return mark_unavailable(internal_purchase_id, payment_result.id, (error) => {
                if (error) {
                    return cb(error);
                }
                return cb(null, {
                    unavailable: 1
                });
            });
        case payment_error_enum.THREE_D_SECURE_ACTION_EXPIRED:
            failure_error = {
                error: '3DSecure Expired'
            };
            break;
        case payment_error_enum.PAYMENT_RETURNED:
            return fatal_error({
                error: 'TODO: NOT SUPPORTED YET'
            });
        case payment_error_enum.INVALID_WIRE_RTN:
            // note: we do not use WIRE
            return fatal_error({
                error: 'Received Impossible Error: INVALID_WIRE_RTN'
            });
        case payment_error_enum.INVALID_ACH_RTN:
            // note: we do not use ACH
            return fatal_error({
                error: 'Received Impossible Error: INVALID_ACH_RTN'
            });
        case payment_error_enum.CHANNEL_INVALID:
            // note: we do not use channels
            return fatal_error({
                error: 'Received Impossible Error: CHANNEL_INVALID'
            });
        case payment_error_enum.THREE_D_SECURE_REQUIRED:
            // note: we step down from 3ds -> cvv -> none, receiving this error implies 3ds was skipped or stepped down innapropriately both of which should never happen
            return fatal_error({
                error: 'Received Impossible Error: THREE_D_SECURE_REQUIRED'
            });
        case payment_error_enum.THREE_D_SECURE_INVALID_REQUEST:
            // note: this implies we passed bad redirects or parameters for 3ds, which implies a bad configuration
            return fatal_error({
                error: 'Received Impossible Error: THREE_D_SECURE_INVALID_REQUEST'
            });
        default:
            // todo these arent fatal but a dev should be notified.. i guess any fraud should notify right
            fraud_error = {
                error: 'Unexpected Server Error',
                fraud: 1
            };
    }
    if (failure_error) {
        return mark_failed(internal_purchase_id, payment_result.id, (error) => {
            if (error) {
                return cb(error);
            }
            return cb(failure_error);
        });
    }
    if (fraud_error) {
        return mark_fraud(internal_purchase_id, payment_result.id, (error) => {
            if (error) {
                return cb(error);
            }
            return postgres.user_mark_fraud(user.user_id, (error) => {
                if (error) {
                    return cb(error);
                }
                return cb(fraud_error);
            });
        });
    }
    return cb({
        error: 'Unexpected Result Assess Payment Failure'
    });
};