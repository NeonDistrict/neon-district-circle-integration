const is_valid_uuid = require('../validation/is_valid_uuid.js');

module.exports = create_card_mark_fraud = (
    config, 
    query, 
    internal_purchase_id,
    cb
) => {
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
            "create_card_result"          = $3,
            "purchase_result"             = $4
        WHERE
            "internal_purchase_id"        = $5;
    `;
    const values = [
        now,                         // "t_modified_purchase"
        now,                         // "t_modified_create_card"
        'FRAUD',                     // "create_card_result"
        'FRAUD',                     // "purchase_result"
        internal_purchase_id         // "internal_purchase_id"
    ];

    // todo this query should run then puke if not exactly 1 row is updated
    return query(text, values, cb);
};