#!/usr/bin/env node

// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const cdk = require("@aws-cdk/core");
const { Neo4jStack } = require("../lib/neo4j-stack");
const { NeptuneStack } = require("../lib/neptune-stack");
const { NetworkStack } = require("../lib/network-stack");
const { BucketStack } = require("../lib/bucket-stack");

const fs = require("fs");

const app = new cdk.App();
const defaultEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};
console.log(defaultEnv);
const networkStack = new NetworkStack(
  app,
  "migrating-neo4j-neptune-blog-network-stack",
  {
    env: defaultEnv
  }
);
const bucketStack = new BucketStack(
  app,
  "migrating-neo4j-neptune-blog-s3-stack",
  {
    env: defaultEnv
  }
);
const neptuneStack = new NeptuneStack(
  app,
  "migrating-neo4j-neptune-blog-neptune-stack",
  {
    env: defaultEnv,
    networkStack: networkStack
  }
);
new Neo4jStack(app, "migrating-neo4j-neptune-blog-ec2-stack", {
  env: defaultEnv,
  neptuneStack: neptuneStack,
  bucketStack: bucketStack,
  networkStack: networkStack
});

fs.writeFile(
  "neptuneStack-shared.json",
  JSON.stringify({
    DBClusterIdentifier: neptuneStack.NeptuneDBClusterIdentifier,
    RoleArn: neptuneStack.NeptuneTrustedRoleArn,
    region: process.env.CDK_DEFAULT_REGION
  }),
  (err, data) => {
    if (err) console.log("Error: ", err);
    // console.log(data);
  }
);
