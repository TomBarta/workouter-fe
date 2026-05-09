FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir pytest pytest-asyncio psycopg2-binary
COPY requirements*.txt ./
RUN pip install --no-cache-dir -r requirements.txt 2>/dev/null || \
    pip install --no-cache-dir -r requirements.txt || true
COPY . .
ENV PYTHONPATH=/app
CMD ["pytest", "-v", "--tb=short", "--no-header", "-q"]
