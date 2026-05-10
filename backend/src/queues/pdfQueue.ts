// Since, this is an MVP, queue has not been used.
// We should put the PDF parsing logic behind a queue to unblock our core process.

export const pdfQueue: any = {
  add: async () => ({ id: 'sync-job' })
};
