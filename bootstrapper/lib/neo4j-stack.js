// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const cdk = require("@aws-cdk/core");
const {
	Instance,
	InstanceType,
	AmazonLinuxImage,
	AmazonLinuxGeneration,
	EbsDeviceVolumeType
} = require("@aws-cdk/aws-ec2");
const {
	Policy,
	PolicyStatement,
	Effect,
	ManagedPolicy
} = require("@aws-cdk/aws-iam");

const { StartupScript } = require("./shared/startup-script");
const { EmitOutput } = require("./shared/emit-output");

const { setStartupScript, setupDockerScript } = StartupScript();
const { emit } = EmitOutput();

class Neo4jStack extends cdk.Stack {
	S3Bucket;
	S3bucketPolicy;
	Neo4jEc2;

	constructor(scope, id, props) {
		super(scope, id, props);

		const { neptuneStack, bucketStack, networkStack } = props;

		const { CustomVpc, InstanceSg } = networkStack;
		const { S3Bucket } = bucketStack;
		const { NeptuneDBCluster, NeptuneTrustedRoleArn } = neptuneStack;

		const neo4jEc2 = this.createEc2(CustomVpc, InstanceSg);

		const s3Policy = this.makeS3InlinePolicy(S3Bucket);

		const neptunePolicy = this.makeNeptunePolicy();

		this.attachIamPolicies(neo4jEc2, s3Policy, neptunePolicy);

		setupDockerScript({
			neo4jEc2,
			neo4j_pwd: this.node.tryGetContext("neo4j_pwd"),
			s3Bucket: S3Bucket.bucketName,
			neptune_port: this.node.tryGetContext("neptune_port"),
			neptune_host: NeptuneDBCluster.attrEndpoint
		});

		// setStartupScript(
		//   neo4jEc2,
		//   NeptuneDBCluster,
		//   S3Bucket,
		//   NeptuneTrustedRoleArn,
		//   this.node.tryGetContext("neo4j_uid"),
		//   this.node.tryGetContext("neo4j_pwd"),
		//   this.node.tryGetContext("neptune_port")
		// );

		emit(this, neo4jEc2, neptuneStack, bucketStack, networkStack);
	}

	attachIamPolicies(neo4jEc2, s3Policy, neptunePolicy) {
		neo4jEc2.role.attachInlinePolicy(s3Policy);
		neo4jEc2.role.attachInlinePolicy(neptunePolicy.inlinePolicy);
		neo4jEc2.role.addManagedPolicy(neptunePolicy.managedPolicy);
	}

	makeS3InlinePolicy(s3Bucket) {
		const ec2S3Policy = new PolicyStatement({
			effect: Effect.ALLOW
		});
		ec2S3Policy.addActions("s3:*");
		ec2S3Policy.addResources(s3Bucket.bucketArn);

		const ec2S3ObjectPolicy = new PolicyStatement({
			effect: Effect.ALLOW
		});
		ec2S3ObjectPolicy.addActions("s3:*");
		ec2S3ObjectPolicy.addResources(s3Bucket.bucketArn + "/*");

		return new Policy(this, "ec2S3", {
			statements: [ec2S3Policy, ec2S3ObjectPolicy]
		});
	}

	makeNeptunePolicy() {
		const neptunePolicy = new PolicyStatement({
			effect: Effect.ALLOW
		});
		neptunePolicy.addActions("neptune-db:*");
		neptunePolicy.addResources("arn:aws:neptune-db:*:*:*/database");

		return {
			inlinePolicy: new Policy(this, "ec2Neptune", {
				statements: [neptunePolicy]
			}),
			managedPolicy: ManagedPolicy.fromAwsManagedPolicyName(
				"NeptuneReadOnlyAccess"
			)
		};
	}

	createEc2(customVpc, instanceSg) {
		const neo4jEc2 = new Instance(this, "neo4j", {
			vpc: customVpc,
			instanceType: InstanceType.of(
				this.node.tryGetContext("ec2_class"),
				this.node.tryGetContext("ec2_type")
			),
			machineImage: new AmazonLinuxImage({
				generation: AmazonLinuxGeneration.AMAZON_LINUX_2
			}),
			blockDevices: [
				{
					deviceName: "/dev/xvda",
					volume: {
						ebsDevice: {
							deleteOnTermination: true,
							volumeSize: 50,
							volumeType: EbsDeviceVolumeType.GP2
						}
					}
				}
			],
			vpcSubnets: {
				subnets: customVpc.publicSubnets
			},
			securityGroup: instanceSg,
			keyName: this.node.tryGetContext("ec2_key_pair")
		});
		return neo4jEc2;
	}
}

module.exports = { Neo4jStack };
