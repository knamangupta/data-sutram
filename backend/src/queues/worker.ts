// Redis Worker disabled.
// This file should be deleted and its initialization removed from your main app entry point.
export const pdfWorker: any = null;

pdfWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} has completed!`);
});

pdfWorker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} has failed with ${err.message}`);
});
