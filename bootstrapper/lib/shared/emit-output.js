// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const cdk = require("@aws-cdk/core");

const EmitOutput = () => {
	const emitNetworkStackOutputs = (scope, networkStack) => {
		new cdk.CfnOutput(scope, "VPC_ID", {
			value: networkStack.CustomVpc.vpcId,
			description: "VPC Id"
		});
	};

	const emitBucketStackOutputs = (scope, bucketStack) => {
		new cdk.CfnOutput(scope, "S3BucketName", {
			value: bucketStack.S3Bucket.bucketName,
			description: "Bucket name"
		});
	};

	const emitNeptuneStackOutputs = (scope, neptuneStack) => {
		new cdk.CfnOutput(scope, "NeptuneLoaderEndpoint", {
			value:
				"https://" +
				neptuneStack.NeptuneDBCluster.attrEndpoint +
				":" +
				neptuneStack.NeptunePort +
				"/loader",
			description: "Neptune cluster"
		});
	};

	const emitNeo4jStackOutputs = (scope, neo4jEc2, neptuneStack) => {
		new cdk.CfnOutput(scope, "EC2Instance", {
			value: neo4jEc2.instanceId,
			description: "EC2 instance for Neo4j"
		});
		new cdk.CfnOutput(scope, "AWSAccount", {
			value: process.env.CDK_DEFAULT_ACCOUNT,
			description: "AWS account"
		});
		new cdk.CfnOutput(scope, "AWSRegion", {
			value: process.env.CDK_DEFAULT_REGION,
			description: "AWS region"
		});
		new cdk.CfnOutput(scope, "NeptuneEndpoint", {
			value: `${neptuneStack.NeptuneDBCluster.attrEndpoint}`,
			description: "Neptune cluster endpoint"
		});
		new cdk.CfnOutput(scope, "Neo4jCredentials", {
			value: JSON.stringify({
				username: process.env.neo4j_uid,
				password: process.env.neo4j_pwd
			}),
			description: "Neo4jCredentials"
		});
	};

	const emit = (scope, neo4jEc2, neptuneStack, bucketStack, networkStack) => {
		emitNeo4jStackOutputs(scope, neo4jEc2, neptuneStack);
		emitNeptuneStackOutputs(scope, neptuneStack);
		emitBucketStackOutputs(scope, bucketStack);
		emitNetworkStackOutputs(scope, networkStack);
	};

	return { emit };
};

module.exports = { EmitOutput };
