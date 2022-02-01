const { v4: uuidv4 } = require('uuid');
const call_circle = require('./call_circle.js');
const assess_create_card_result = require('./assess_create_card_result.js');
const purchase_log = require('./purchase_log.js');

module.exports = create_card = (config, postgres, internal_purchase_id, user_id, circle_public_key_id, encrypted_card_information, name_on_card, city, country, address_line_1, address_line_2, district, postal_zip_code, expiry_month, expiry_year, email, phone_number, metadata_hash_session_id, ip_address, cb) => {
    purchase_log(internal_purchase_id, {
        event: 'create_card'
    });
    
    const create_card_idempotency_key = uuidv4();

    postgres.create_card_start(internal_purchase_id, create_card_idempotency_key, (error) => {
        if (error) {
            return cb(error);
        }
        const request_body = {
            idempotencyKey: create_card_idempotency_key,
            keyId: circle_public_key_id,
            encryptedData: encrypted_card_information,
            billingDetails: {
                name: name_on_card,
                city: city,
                country: country,
                line1: address_line_1,
                line2: address_line_2,
                district: district,
                postalCode: postal_zip_code
            },
            expMonth: expiry_month,
            expYear: expiry_year,
            metadata: {
                email: email,
                phoneNumber: phone_number,
                sessionId: metadata_hash_session_id,
                ipAddress: ip_address
            }
        };
        call_circle(config, [201], 'post', `${config.api_uri_base}cards`, request_body, (error, create_card_result) => {
            if (error) {
                return cb(error);
            }
            assess_create_card_result(config, postgres, internal_purchase_id, user_id, create_card_result, (error, card_id) => {
                if (error) {
                    return cb(error);
                }
                return cb(null, card_id);
            });
        });
    });
};