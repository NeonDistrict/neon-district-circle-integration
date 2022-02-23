const call_circle = require('../../../call_circle.js');

module.exports = crm_get_payment = async (body) => {
    const circle_response = await call_circle('none', [200], 'get', `/payments/${body.payment_id}`, null);
    return circle_response;
};