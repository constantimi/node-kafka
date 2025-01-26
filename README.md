# Payment Exchange API (Node.js + Kafka)

###### This repository provides an **Express.js API** built with **TypeScript** and **Apache Kafka** for a distributed event streaming platform focused on payment exchange.

## Prerequisites

-   **Node.js** (v14 or later)
-   **Apache Kafka** (for local development)
-   **Zookeeper** (required by Kafka, but often installed alongside Kafka)
-   Docker (optional, for containerization)
-   Kubernetes (optional, for deploying in a Kubernetes environment)

#### Clone the repository

Start by cloning this repository to your local machine:

```bash
git clone <repo-url>
cd <repo-folder>
```

## Usage

1.  **Set up the environment variables**:\
    Create a `.env` file in the root directory and add the following:

    ```env
    KAFKA_BROKER=localhost:9092
    PORT=3000
    ```

2.  **Install dependencies**:\
    Run the following command to install the necessary dependencies:

    `npm install`

## Running the Application

1. **Install Kafka and Zookeeper using Homebrew**

    If you don't have Apache Kafka and Zookeeper installed yet, you can install them using **Homebrew**.

    ###### Install Kafka and Zookeeper:

    - Run the following commands to install both Kafka and Zookeeper:

        ```bash
        brew install kafka
        ```

    - **Start Zookeeper**:
      Kafka requires Zookeeper, so start it first:

        ```bash
        zookeeper-server-start /usr/local/etc/kafka/zookeeper.properties
        ```

    - **Start Kafka**:
      Start Kafka in a new terminal window:

        ```bash
        kafka-server-start /usr/local/etc/kafka/server.properties
        ```

        Kafka will now be running on `localhost:9092` (by default).

## Running the Application Locally

1. **Start Kafka and Zookeeper**

    If you have installed Kafka using Homebrew, you can start the services with `brew services`:

    ```bash
    brew services start zookeeper  # Start Zookeeper
    brew services start kafka     # Start Kafka
    ```

    If Kafka and Zookeeper are already running, skip this step.

2. **Run the Application**

    Start the Express app in development mode with hot-reloading:

    ```bash
    npm run dev
    ```

    This will launch the server at `http://localhost:3000` and listen for incoming payment requests.

3. **Stopping Kafka and Zookeeper**

    To stop Kafka and Zookeeper:

    ```bash
    brew services stop kafka     # Stop Kafka
    brew services stop zookeeper # Stop Zookeeper
    ```

    Alternatively, you can manually stop them using `Ctrl + C` in the terminal windows where they are running.

## Examples:

-   Successful Payment

    ###### Request:

    ```bash
    curl -X POST http://localhost:3000/payment \
    -H "Content-Type: application/json" \
    -d '{
        "amount": 100.50,
        "from": "user123",
        "to": "merchant456"
    }'
    ```

    ###### Response:

    ```json
    {
        "message": "Payment initiated"
    }
    ```

-   Invalid Payment Request (Amount as String)

    ###### Request:

    ```bash
    curl -X POST http://localhost:3000/payment \
    -H "Content-Type: application/json" \
    -d '{
        "amount": "invalid",
        "from": "user123"
    }'
    ```

    ###### Response:

    ```json
    {
        "error": "Expected number, received string, Required"
    }
    ```

-   Server Health Check

    ###### Request:

    ```bash
    curl -X GET http://localhost:3000/health
    ```

    ###### Response:

    ```json
    {
        "message": "Server is running"
    }
    ```

## Running the Application with Docker (Optional)

1. **Build the Docker Image**

    Build the Docker image for your app:

    ```bash
    docker build -t payment-exchange-api .
    ```

2. **Run the Docker Container**

    Run the application inside a Docker container. Make sure to specify the correct Kafka broker URL (`host.docker.internal:9092` if running Kafka locally on the host machine):

    ```bash
    docker run -p 3000:3000 -e KAFKA_BROKER=host.docker.internal:9092 payment-exchange-api
    ```

    This will start the application and expose it on port `3000`.

## Running the Application with Kubernetes (Optional)

1. **Apply the Kubernetes Configuration**

    If you are using Kubernetes for deployment, apply the Kubernetes configuration:

    ```bash
    kubectl apply -f kubernetes-deployment.yaml
    ```

2. **Get the External IP of the Service**

    Check the external IP assigned to your service:

    ```bash
    kubectl get services
    ```

    Once the service is running, you should be able to access it via the external IP or through a load balancer.

## Additional Notes

###### Kafka Consumer and Producer

-   The Kafka consumer listens to the `payments` topic and logs the payment details whenever a new message is received.
-   The Kafka producer sends payment data as messages to the Kafka topic when a new payment is initiated via the API.

###### Environment Variables

-   **KAFKA_BROKER**: Set the Kafka broker URL (defaults to `localhost:9092`).
-   **PORT**: Set the port the Express app should run on (defaults to `3000`).

###### Docker and Kubernetes

The application is containerized with **Docker**, allowing you to easily deploy it in a containerized environment. You can also deploy it to a **Kubernetes cluster** for scalable and robust deployment.
