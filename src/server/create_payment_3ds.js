const { v4: uuidv4 } = require('uuid');
const call_circle = require('./call_circle.js');
const assess_payment_result = require('./assess_payment_result.js');
const purchase_log = require('./purchase_log.js');

module.exports = create_payment_3ds = (config, postgres, internal_purchase_id, user_id, card_id, circle_public_key_id, encrypted_card_information, email, phone_number, metadata_hash_session_id, ip_address, sale_item, cb) => {
    purchase_log(internal_purchase_id, {
        event: 'create_payment_3ds'
    });
    
    const payment_3ds_idempotency_key = uuidv4();
    postgres.payment_3ds_start(internal_purchase_id, payment_3ds_idempotency_key, (error) => {
        if (error) {
            return cb(error);
        }
        const request_body = {
            idempotencyKey: payment_3ds_idempotency_key,
            keyId: circle_public_key_id,
            metadata: {
                email: email,
                phoneNumber: phone_number,
                sessionId: metadata_hash_session_id,
                ipAddress: ip_address,
            },
            amount: {
                amount: sale_item.sale_item_price,
                currency: sale_item.currency
            },
            autoCapture: true,
            verification: 'three_d_secure',
            verificationSuccessUrl: config.three_d_secure_success_url,
            verificationFailureUrl: config.three_d_secure_failure_url,
            source: {
                id: card_id,
                type: 'card'
            },
            description: sale_item.statement_description,
            encryptedData: encrypted_card_information
        };
        call_circle(config, [201], 'post', `${config.api_uri_base}payments`, request_body, (error, payment_result) => {
            if (error) {
                return cb(error);
            }
            const mark_failed      = postgres.payment_3ds_mark_failed;
            const mark_fraud       = postgres.payment_3ds_mark_fraud;
            const mark_unavailable = postgres.payment_3ds_mark_unavailable;
            const mark_redirected  = postgres.payment_3ds_mark_redirected;
            const mark_pending     = postgres.payment_3ds_mark_pending;
            const mark_completed   = postgres.payment_3ds_mark_completed;
            assess_payment_result(config, postgres, user_id, internal_purchase_id, payment_result, mark_failed, mark_fraud, mark_unavailable, mark_redirected, mark_pending, mark_completed, cb);
        });
    });
};