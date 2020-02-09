// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const cdk = require("@aws-cdk/core");
const { Bucket } = require("@aws-cdk/aws-s3");

class BucketStack extends cdk.Stack {
  S3Bucket;
  constructor(scope, id, props) {
    super(scope, id, props);
    this.S3Bucket = new Bucket(this, "neo4j-neptune-blog");
  }
}

module.exports = { BucketStack };
