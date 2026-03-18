FROM python:3.11-slim

WORKDIR /app

# Create a non-root user
RUN addgroup --system aiuser && adduser --system --group aiuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Set ownership and switch to user
RUN chown -R aiuser:aiuser /app
USER aiuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
