#!/usr/bin/bash

if [ "$#" -ne 3 ]; then
  echo "usage: deploy.sh <key> <app> <version>"
  echo
  echo "  Packages current HEAD for deployment to Heroku"
  echo "  with API <key> to <app>, marked as <version>"
  echo
  echo "  for example, deploy.sh 700fa157-e0c0-4fbd-b988-8c18c21aab54 sleepy-depths-21550 DEV"
  exit
fi

COMMIT=`git rev-parse --verify --short HEAD`
API_KEY=$1
APP_NAME=$2
APP_VERSION=$3

echo $APP_VERSION > ./VERSION
echo $COMMIT > ./COMMIT

echo "VUE_APP_VERSION=$APP_VERSION" > ./.env
echo "VUE_APP_COMMIT=$COMMIT" >> ./.env

git archive --format=tar -o deploy.tar $COMMIT .

tar rvf deploy.tar ./VERSION ./COMMIT ./.env

gzip deploy.tar

mv deploy.tar.gz deploy.tgz

echo "Deploying Version $APP_VERSION"
echo "          Commit $COMMIT"

URL_BLOB=`curl -s -n -X POST https://api.heroku.com/apps/$APP_NAME/sources \
-H 'Accept: application/vnd.heroku+json; version=3' \
-H "Authorization: Bearer $API_KEY"`

PUT_URL=`echo $URL_BLOB | jq -r .source_blob.put_url`
GET_URL=`echo $URL_BLOB | jq -r .source_blob.get_url`

curl $PUT_URL  -X PUT -H 'Content-Type:' --data-binary @deploy.tgz

REQ_DATA="{\"source_blob\": {\"url\":\"$GET_URL\", \"version\": \"$APP_VERSION\"}}"

BUILD_OUTPUT=`curl -s -n -X POST https://api.heroku.com/apps/$APP_NAME/builds \
-d "$REQ_DATA" \
-H 'Accept: application/vnd.heroku+json; version=3' \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $API_KEY"`

STREAM_URL=`echo $BUILD_OUTPUT | jq -r .output_stream_url`

curl $STREAM_URL
