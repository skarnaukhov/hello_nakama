Nakama Hello world project
===

### !!!This is not a production ready code!!!

Points to improve:

* Better understand how to package typescript projects => Split logic by modules
* Better understand how to work with types for example I used string for all types for simplicity
* Better errors in http responses
* Better understand the auth mechanism
* Make tests as a part of build pipeline
* Better understand node.js packaging & modules
* Discover integration tests

### Prerequisites

The codebase requires these development tools:

* Docker Engine: 19.0.0 or greater.
* Node v14 (active LTS) or greater.

### Usage
Run in docker:
```shell
docker-compose up -d --build nakama
```

Manual tests:
* ./Postman contains a postman collection which could be imported
* Collections consists of 2 methods:
  * Authenticate to retrieve Bearer token
  * RPC_Call to execute server back-end call using previously obtained token (copy value to authentication tab)

Run unit tests:
```shell
npm run test
```