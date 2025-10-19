// kafkaProducer.js
const { Kafka } = require('kafkajs');

const brokers = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : null;
let producer = null;
if (brokers) {
  const kafka = new Kafka({ brokers });
  producer = kafka.producer();
  (async () => {
    await producer.connect();
    console.log('Kafka producer connected');
  })().catch(err => console.error('kafka connect error', err));
}

async function produce(topic, messageObj) {
  if (!producer) {
    // kafka not configured — stub log
    console.log('[kafka stub] topic=', topic, messageObj);
    return;
  }
  try {
    await producer.send({
      topic,
      messages: [
        { key: messageObj.gameId || null, value: JSON.stringify(messageObj) }
      ]
    });
  } catch (e) {
    console.error('kafka produce error', e);
  }
}

module.exports = { produce };
