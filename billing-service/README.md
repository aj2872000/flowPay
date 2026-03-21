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


curl:
curl -X POST http://localhost:4002/api/invoices/generate \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOi..." \
-H "Idempotency-Key: inv-001" \
-d '{
  "subscriptionId": "b6d8b1c4-9c01-4d7e-9b19-55c8a77f1234",
  "amount": 499
}'

