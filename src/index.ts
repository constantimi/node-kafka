import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import { Kafka } from 'kafkajs';
import { z } from 'zod';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Kafka client
const kafka = new Kafka({
    clientId: 'payment-exchange-api',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'payment-group' });

// Connect to Kafka
const runKafka = async () => {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: 'payments', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                value: message.value?.toString(),
            });
        },
    });
};

runKafka().catch(console.error);

// Zod schema for payment validation
const paymentSchema = z.object({
    amount: z
        .number()
        .positive()
        .min(1, { message: 'Amount must be a positive number' }),
    from: z.string().min(3, {
        message:
            'Sender information is required and should be a string with at least 3 characters',
    }),
    to: z.string().min(3, {
        message:
            'Receiver information is required and should be a string with at least 3 characters',
    }),
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Server is running' });
});

// Payment route with Zod validation
app.post('/payment', async (req: Request, res: Response) => {
    try {
        // Validate the request body using Zod schema
        const result = paymentSchema.safeParse(req.body);

        // If validation fails, return detailed error messages
        if (!result.success) {
            return res.status(400).json({
                errors: result.error.format(),
            });
        }

        const { amount, from, to } = req.body;

        // Produce a message to Kafka
        await producer.send({
            topic: 'payments',
            messages: [
                {
                    value: JSON.stringify({
                        amount,
                        from,
                        to,
                        timestamp: Date.now(),
                    }),
                },
            ],
        });

        res.status(200).json({ message: 'Payment initiated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
