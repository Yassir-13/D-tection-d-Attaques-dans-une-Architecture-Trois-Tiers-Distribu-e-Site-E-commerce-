FROM python:3.11-alpine

RUN apk add --no-cache gcc musl-dev librdkafka-dev

ENV COMPILE_RDKAFKA_FROM_SOURCE=False
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY shared/constants.py     ./constants.py
COPY shared/kafka_schemas.py ./kafka_schemas.py

COPY correlation_engine/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY correlation_engine/ .

CMD ["python", "engine.py"]