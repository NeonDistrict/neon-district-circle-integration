const log = require('../../../../utilities/log.js');
const call_circle = require('../../../../utilities/call_circle.js');
const parking = require('../../../../utilities/parking.js');
const find_purchase_by_internal_purchase_id = require('../../../../postgres/find_purchase_by_internal_purchase_id.js');
const purchase_mark_cancelled = require('../../../../postgres/purchase_mark_cancelled.js');

module.exports = async (body) => {
    log({
        event: 'crm payment cancel',
        body: body
    });
    const purchase = await find_purchase_by_internal_purchase_id(body.internal_purchase_id);
    if (purchase === null) {
        log({
            event: 'crm payment cancel could not find purchase',
            body: body
        });
        throw new Error('Purchase Not Found');
    }
    let circle_response = await call_circle(null, [200, 201], 'post', `/payments/${body.payment_id}/cancel`, {
        idempotencyKey: body.idempotency_key,
        reason: body.reason
    });
    if (circle_response.status === 'pending') {
        circle_response = await new Promise((resolve, reject) => {
            parking.park_callback(body.payment_id, (error, circle_response) => {
                if (error) {
                    return reject(error);
                }
                return resolve(circle_response);
            });
        });
    }
    if (circle_response.status !== 'confirmed') {
        log({
            event: 'crm payment cancel failed',
            body: body,
            circle_response: circle_response
        });
        throw new Error('Cancel Failed');
    }
    await purchase_mark_cancelled(internal_purchase_id);
    return {cancelled: 1};
};