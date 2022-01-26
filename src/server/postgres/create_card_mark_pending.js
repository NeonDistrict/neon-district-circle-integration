const is_valid_uuid = require('../validation/is_valid_uuid.js');
const expect_one_row_count = require('./expect_one_row_count.js');

module.exports = create_card_mark_pending = (config, query, internal_purchase_id, cb) => {
    if (!is_valid_uuid(internal_purchase_id)) {
        return cb({
            error: 'Invalid internal_purchase_id'
        });
    }
    const now = new Date().getTime();
    const text = 
    `
        UPDATE "purchases" SET
            "t_modified_purchase"         = $1,
            "t_modified_create_card"      = $2,
            "create_card_result"          = $3
        WHERE
            "internal_purchase_id"        = $4
        LIMIT 1;
    `;
    const values = [
        now,                         // "t_modified_purchase"
        now,                         // "t_modified_create_card"
        'PENDING',                   // "create_card_result"
        internal_purchase_id         // "internal_purchase_id"
    ];

    return query(text, values, (error, result) => expect_one_row_count(error, result, cb));
};