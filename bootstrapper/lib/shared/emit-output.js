// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const cdk = require("@aws-cdk/core");

const EmitOutput = () => {
  const emitNetworkStackOutputs = (scope, networkStack) => {
    new cdk.CfnOutput(scope, "VpcId", {
      value: networkStack.CustomVpc.vpcId,
      description: "VPC Id"
    });
  };

  const emitBucketStackOutputs = (scope, bucketStack) => {
    new cdk.CfnOutput(scope, "S3BucketArn", {
      value: bucketStack.S3Bucket.bucketArn,
      description: "Bucket Arn"
    });
    new cdk.CfnOutput(scope, "S3BucketName", {
      value: bucketStack.S3Bucket.bucketName,
      description: "Bucket name"
    });
  };

  const emitNeptuneStackOutputs = (scope, neptuneStack) => {
    new cdk.CfnOutput(scope, "NeptuneDbClusterIdentifier", {
      value: neptuneStack.NeptuneDBClusterIdentifier,
      description: "Neptune cluster"
    });
    new cdk.CfnOutput(scope, "LoaderEndpoint", {
      value:
        "https://" +
        neptuneStack.NeptuneDBCluster.attrEndpoint +
        ":" +
        neptuneStack.NeptunePort +
        "/loader",
      description: "Neptune cluster"
    });
    new cdk.CfnOutput(scope, "NeptuneTrustedRole", {
      value: neptuneStack.NeptuneTrustedRoleArn,
      description: "Neptune cluster IAM role"
    });
  };

  const emitNeo4jStackOutputs = (scope, neo4jEc2) => {
    new cdk.CfnOutput(scope, "Neo4jEc2Instance", {
      value: neo4jEc2.instanceId,
      description: "EC2 instance for Neo4j"
    });
    new cdk.CfnOutput(scope, "Neo4jBrowser", {
      value: "http://" + neo4jEc2.instancePublicDnsName + ":7474",
      description: "neo4jBrowser"
    });
    new cdk.CfnOutput(scope, "Neo4jCredentials", {
      value: JSON.stringify({
        username: scope.node.tryGetContext("neo4j_uid"),
        password: scope.node.tryGetContext("neo4j_pwd")
      }),
      description: "Neo4jCredentials"
    });
  };

  const emit = (scope, neo4jEc2, neptuneStack, bucketStack, networkStack) => {
    emitNeo4jStackOutputs(scope, neo4jEc2);
    emitNeptuneStackOutputs(scope, neptuneStack);
    emitBucketStackOutputs(scope, bucketStack);
    emitNetworkStackOutputs(scope, networkStack);
  };

  return { emit };
};

module.exports = { EmitOutput };
