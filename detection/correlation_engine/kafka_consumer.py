from confluent_kafka import Consumer, KafkaError
from constants import KAFKA_BOOTSTRAP, TOPIC_WEB, TOPIC_APP, TOPIC_DB

_consumer = Consumer({
    "bootstrap.servers": KAFKA_BOOTSTRAP,
    "group.id":          "correlation_engine",
    "auto.offset.reset": "latest",
})

_consumer.subscribe([TOPIC_WEB, TOPIC_APP, TOPIC_DB])


def poll(timeout: float = 1.0):
    """Retourne le prochain message ou None."""
    msg = _consumer.poll(timeout)
    if msg is None:
        return None
    if msg.error():
        if msg.error().code() == KafkaError._PARTITION_EOF:
            return None
        raise RuntimeError(f"Kafka consumer error: {msg.error()}")
    return msg.value()


def close() -> None:
    _consumer.close()