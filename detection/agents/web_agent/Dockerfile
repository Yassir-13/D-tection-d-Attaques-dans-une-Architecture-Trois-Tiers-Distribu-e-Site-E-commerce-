FROM python:3.11-alpine

RUN apk add --no-cache gcc musl-dev librdkafka-dev

ENV COMPILE_RDKAFKA_FROM_SOURCE=False
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Le context Docker est detection/ (défini dans docker-compose.yml)
# On copie d'abord shared/ puis le code de l'agent
COPY shared/constants.py     ./constants.py
COPY shared/kafka_schemas.py ./kafka_schemas.py

COPY agents/web_agent/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY agents/web_agent/ .

CMD ["python", "agent.py"]