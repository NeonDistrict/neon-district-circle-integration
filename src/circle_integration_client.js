const cofig = require('./config.dev.js');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios').default.create();

module.exports = circle_integration_client = {

    generate_idempotency_key: () => {
        return uuidv4();
    },

    call_circle_api: async (endpoint, data) => {
        // form request
        const request = {
            method: 'post',
            url: `${config.server_url}${endpoint}`,
            headers: {
                'Accept': 'application/json'
            },
            mode: 'cors'
        };
        if (data !== null) {
            request.data = data;
        }
        
        // make request
        let response;
        try {
            response = await axios(request);
        } catch (request_error) {
            // axios wont return the response normally on error codes, associate it here
            response = request_error.response;
        }

        // get the response body from the response
        const response_body = response.data;

        // if our request has an accepted response code
        if (response.status === 200) {

            // return response
            return response_body;
        
        // otherwise we received an error response
        } else {

            // throw the error
            throw new Error(`${response_body.reason}: ${response_body.message}`)
        }
    },

    get_public_key: async (force_refresh) => {
        // we handle the public key on behalf of the client but they still need to make the call to handle any errors
        return await circle_integration_client.call_circle_api('/get_public_key', {force_refresh: force_refresh});
    },

    hash_card_number: (card_number) => {
        // todo, sha?
    },

    encrypt_card_information: async (card_number, card_cvv) => {
        // ensure the user followed the readme and called get public key first
        if (circle_integration_client.public_key === null) {
            throw new Error('You must call circle_integration_client.get_public_key() before calling this function');
        }
        
        // package the card details to be encrypted
        const card_details = {
            number: card_number,
            cvv: card_cvv
        };

        // use openpgp to read and decode the public key
        const decoded_public_key = await readKey({armoredKey: atob(circle_integration_client.public_key.publicKey)});
        
        // use openpgp to create the message (of the card details) for encryption
        const message = await createMessage({text: JSON.stringify(card_details)});
        
        // use openpgp to encrypt
        const cipher_text = await encrypt({
            message: message,
            encryptionKeys: decoded_public_key,
        });

        // return the encrypted card information and key id which will be used to help decrypt it later
        return {
            encryptedMessage: btoa(cipher_text),
            keyId: circle_integration_client.public_key.keyId
        };
    },

    encrypt_card_cvv: async (card_cvv) => {
        // ensure the user followed the readme and called get public key first
        if (circle_integration_client.public_key === null) {
            throw new Error('You must call circle_integration_client.get_public_key() before calling this function');
        }
        
        // package the card cvv to be encrypted
        const card_details = {
            cvv: card_cvv
        };

        // use openpgp to read and decode the public key
        const decoded_public_key = await readKey({armoredKey: atob(circle_integration_client.public_key.publicKey)});
        
        // use openpgp to create the message (of the card details) for encryption
        const message = await createMessage({text: JSON.stringify(card_details)});
        
        // use openpgp to encrypt
        const cipher_text = await encrypt({
            message: message,
            encryptionKeys: decoded_public_key,
        });

        // return the encrypted card cvv and key id which will be used to help decrypt it later
        return {
            encryptedMessage: btoa(cipher_text),
            keyId: circle_integration_client.public_key.keyId
        };
    },

    create_card: async (idempotency_key, card_number, card_cvv, name_on_card, city, country, address_line_1, address_line_2, district, postal_zip_code, expiry_month, expiry_year) => {
        // hash card number
        const hashed_card_number = circle_integration_client.hash_card_number(card_number);
        
        // encrypt card information
        const encrypted_card_information = circle_integration_client.encrypt_card_information(card_number, card_cvv);
    
        // call to create the card, on success we will get {ok: 1}
        // todo theres a boatload of failures here including verification of cards that need to be handled
        const result = await circle_integration_client.call_circle_api('/create_card', {
            idempotency_key: idempotency_key,
            key_id: circle_integration_client.public_key.keyId,
            hashed_card_number: hashed_card_number,
            encrypted_card_information: encrypted_card_information,
            name_on_card: name_on_card,
            city: city,
            country: country,
            address_line_1: address_line_1,
            address_line_2: address_line_2,
            district: district,
            postal_zip_code: postal_zip_code,
            expiry_month: expiry_month,
            expiry_year: expiry_year
        });
    },

    make_purchase: async (idempotency_key, card_id, card_cvv, sale_item_key) => {
        // encrypt card cvv
        const encrypted_card_cvv = circle_integration_client.encrypt_card_cvv(card_cvv);

        // call to make purchase, on success we will get {ok: 1}
        // todo handle errors
        // todo this is going to hang a while while we poll on backend for complete? or maybe we poll right from here?
        // or some kind of poll and hold as long as request lasts for a real response
        const result = await circle_integration_client.call_circle_api('/make_purchase', {
            idempotency_key: idempotency_key,
            card_id: card_id,
            key_id: circle_integration_client.public_key.keyId,
            encrypted_card_cvv: encrypted_card_cvv,
            sale_item_key: sale_item_key
        });
    }
};