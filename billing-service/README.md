# Billing Service Folder Structure
billing-service/
│
├── src/
│   ├── controllers/
│   │   └── invoice.controller.js
│   ├── services/
│   │   └── billing.service.js
│   ├── models/
│   │   └── invoice.model.js
│   ├── routes/
│   │   └── invoice.routes.js
│   ├── jobs/
│   │   └── retry.job.js
│   ├── utils/
│   │   └── idempotency.js
│   ├── app.js
│   └── server.js
│
├── tests/
│   └── billing.test.js
└── Dockerfile
