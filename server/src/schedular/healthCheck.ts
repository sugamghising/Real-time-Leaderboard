import cron from 'node-cron';


const HEALTH_URL = process.env.HEALTH_CHECK_URL || '';

// Schedule a health check ping every 5 minutes

const healthCheckTask = cron.schedule('*/10 * * * *', async () => {
    if (!HEALTH_URL) {
        console.warn('Health check URL not configured.');
        return;
    }
    try {
        const response = await fetch(HEALTH_URL);
        if (!response.ok) {
            console.warn(`Health check failed with status: ${response.status}`);
        } else {
            console.log('Health check successful');
        }
    } catch (error) {
        console.error('Health check error:', error);
    }
});

export default healthCheckTask;