# design.metatooth.com

Dental CAD with Vue.js & Three.js

## Getting Started

### Prerequisites

#### Ubuntu 20.04

```
$ sudo apt-get update
$ sudo apt-get install nodejs npm
```

### Install & Configure & Run

#### api.metatooth.com

An instance of https://github.com/metatooth/api needs to be available.

#### the rest

```
$ git clone https://github.com/metatooth/design.git
$ cd design
$ npm install
$ echo "VUE_APP_API_URL=http://localhost:9393" >> .env
$ echo "VUE_APP_API_KEY=169:2570ed9e29cc97fe84f642f653053c2e" >> .env
$ echo "VUE_APP_VERSION=development" >> .env
$ echo "VUE_APP_COMMIT=1974" >> .env
$ echo "VUE_APP_DEFAULT_ASSET=ee98" >> .env
$ echo "VUE_APP_DEFAULT_PLAN=9f0a" >> .env
$ echo "VUE_APP_AWS_REGION=us-east-1" >> .env
$ echo "VUE_APP_AWS_IDENTITY_POOL_ID=your-pool-id" >> .env
$ echo "VUE_APP_S3_BUCKET_NAME=your-bucket-name" >> .env
$ npm run serve
```

## License

Copyright 2020 Metatooth LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
