const { v4: uuidv4 } = require('uuid');
const sha512 = require('./sha512.js');
const sale_items = require('./sale_items.dev.js');
// todo these should be passed in like config maybe?
// maybe literally in the config to keep it simple
const create_card = require('./create_card.js');
const create_payment = require('./create_payment.js');
const postgres = require('./postgres/postgres.js');


// todo we need the circle public key id passed in after all
module.exports = purchase = (client_generated_idempotency_key, verification_type, encrypted_card_information, hashed_card_details, name_on_card, city, country, address_line_1, address_line_2, district, postal_zip_code, expiry_month, expiry_year, email, phone_number, session_id, ip_address, sale_item_key, cb) => {
    // find sale item
    const sale_item = sale_items.find((search_sale_item) => { return search_sale_item.sale_item_key === sale_item_key; });
    if (sale_item === undefined || sale_item === null) {
        return cb({
            error: 'Sale Item Key Not Found'
        });
    }

    const internal_purchase_id               = uuidv4();
    const metadata_hash_email                = sha512(email);
    const metadata_hash_phone                = sha512(phone);
    const metadata_hash_session_id           = sha512(session_id);
    const metadata_hash_ip_address           = sha512(ip_address);
    const metadata_hash_name_on_card         = sha512(name_on_card);
    const metadata_hash_city                 = sha512(city);
    const metadata_hash_country              = sha512(country);
    const metadata_hash_district             = sha512(district);
    const metadata_hash_address_1            = sha512(address_1);
    const metadata_hash_address_2            = sha512(address_2);
    const metadata_hash_postal_zip_code      = sha512(postal_zip_code);
    const metadata_hash_expiry_month         = sha512(expiry_month);
    const metadata_hash_expiry_year          = sha512(expiry_year);
    const metadata_hash_card_number          = sha512(card_number); // todo card number and cvv here need to come from an encrypted exchange
    const metadata_hash_card_cvv             = sha512(card_cvv);    // todo as above
    const metadata_hash_circle_public_key_id = sha512(circle_public_key_id);

    // todo all fraud checks need to happen right here and not be passed through

    postgres.create_purchase(internal_purchase_id, internal_user_id, sale_item.sale_item_key, sale_item.sale_item_price, client_generated_idempotency_key, metadata_hash_email, metadata_hash_phone, metadata_hash_session_id, metadata_hash_ip_address, metadata_hash_name_on_card, metadata_hash_city, metadata_hash_country, metadata_hash_district, metadata_hash_address_1, metadata_hash_address_2, metadata_hash_postal_zip_code, metadata_hash_expiry_month, metadata_hash_expiry_year, metadata_hash_card_number, metadata_hash_card_cvv, metadata_hash_circle_public_key_id, (error) => {
        if (error) {
            return cb(error);
        }
        create_card(internal_purchase_id, encrypted_card_information, name_on_card, city, country, address_line_1, address_line_2, district, postal_zip_code, expiry_month, expiry_year, email, phone_number, session_id, ip_address, (error, assessed_create_card_result) => {
            if (error) {
                return cb(error);
            }
            create_payment(internal_purchase_id, verification_type, assessed_create_card_result.id, encrypted_card_information, email, phone_number, session_id, ip_address, sale_item, (error, assessed_payment_result) => {
                if (error) {
                    return cb(error);
                }
                return cb(null, assessed_payment_result);
            });
        });
    });
};