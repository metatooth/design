import * as AWS from 'aws-sdk';

/**
 * Description: a wrapper for the AWS S3 SDK
 * @constructor
 */
function S3() {
  this.type = 'S3';

  AWS.config.update({
    region: process.env.VUE_APP_AWS_REGION,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: process.env.VUE_APP_AWS_REGION + ':' +
          process.env.VUE_APP_AWS_IDENTITY_POOL_ID,
    }),
  });
}

Object.assign( S3.prototype, {
  constructor: S3,

  isS3: true,

  upload: function(blob, name) {
    const params = {
      Bucket: process.env.VUE_APP_S3_BUCKET_NAME,
      Key: name,
      Body: Buffer.from(JSON.stringify(blob)),
      ACL: 'public-read',
    };

    const s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      params: {Bucket: process.env.VUE_APP_S3_BUCKET_NAME},
    });

    return s3.upload(params).promise();
  },
});

export {S3};
