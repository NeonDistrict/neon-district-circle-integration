const express = require('express');
const body_parser = require('body-parser')
const app = express();
const port = 3000;
const circle_integration = require('./circle_integration_server.js');

app.use(body_parser.json());

// todo there should be some json schema validation here, and error responses, logging etc
// todo generic responders

console.log(circle_integration);


// when the server boots only the aws_sns endpoint is activated, since without the sns callbacks
// from circle we cant confirm cards or payments are working, and thus allowing transactions without
// sns would lead to a giant mess.
// first we create the route which aws will message with the confirmation message, once we receive
// that confirmation all normal routes are then activated.
let routes_activated = false;
app.post('/aws_sns', async (req, res) => {

    // handle the notification from aws sns
    ({ error, notification_confirmed } = await circle_integration.on_notification(req.body));
    // todo error?

    // if this was the notification endpoint confirmation, we can open up the other routes,
    // note that we use routes_activated here to prevent double activations which really
    // fucks up requests
    if (notification_confirmed === 1 && !routes_activated) {
        routes_activated = true;
        app.post('/get_public_key', async (req, res) => {
            const public_key = await circle_integration.get_public_key();
            res.send(public_key);
        });

        app.post('/check_purchase_limit', async (req, res) => {
            const purchase_limit = await circle_integration.check_purchase_limit(req.user_id);
            res.send(purchase_limit);
        });

        app.post('/get_sale_items', async (req, res) => {
            const sale_items = await circle_integration.get_sale_items(req.user_id);
            res.send(sale_items);
        });

        app.post('/purchase', async (req, res) => {
            // todo this card packet needs a lot of detail
            const receipt = await circle_integration.purchase(req.user_id, req.sale_item_id, req.card);
            res.send(receipt);
        });

        app.post('/purchase_history', async (req, res) => {
            const purchase_history_page = await circle_integration.purchase_history(req.user_id, req.after_id);
            res.send(purchase_history_page);
        });
    }
    
    // todo maybe only 200 here if we processed it? that way a failure error might put it back in the queue? maybe not
    res.end();
});

// start the server
app.listen(port, async () => {
    console.log(`circle-integration-server listening at http://localhost:${port}`);

    // setup the aws sns subscription now that the route for confirmation has activated
    console.log('setting up notifications subscription');
    ({ error } = await circle_integration.setup_notifications_subscription());
    // todo error
});