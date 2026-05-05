from confluent_kafka import Producer
from constants import KAFKA_BOOTSTRAP, TOPIC_CORRELATED

_producer = Producer({"bootstrap.servers": KAFKA_BOOTSTRAP})


def send(alert_bytes: bytes, key: str) -> None:
    _producer.produce(
        TOPIC_CORRELATED,
        value=alert_bytes,
        key=key.encode(),
        callback=_delivery_report,
    )
    _producer.poll(0)


def flush() -> None:
    _producer.flush()


def _delivery_report(err, msg) -> None:
    if err:
        print(f"[cep] Kafka delivery error: {err}")