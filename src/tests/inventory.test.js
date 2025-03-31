const redisPubSubService = require('../services/redisPubSub.service');

class InventoryServiceTest {
    constructor() {
        redisPubSubService.subscribe('purchase_events', (channel, message) => {
            console.log(`Received message::: ${message}`);
            const parsedMessage = JSON.parse(message); 
            InventoryServiceTest.updateInventory(parsedMessage);
        });
    }

    static updateInventory({productId, quantity}) {
        // update inventory logic ...
        console.log(`Update inventory ${productId} with quantity ${quantity}`);
    }
}

module.exports = new InventoryServiceTest();
