FROM  ubuntu:latest
WORKDIR /app
COPY . /app/
RUN apt-get update && apt-get install python3 python3-pip
CMD ["python3" "hello-word.py"]
