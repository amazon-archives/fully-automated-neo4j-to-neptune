// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const cdk = require("@aws-cdk/core");
const {
  Vpc,
  SubnetType,

  GatewayVpcEndpointAwsService
} = require("@aws-cdk/aws-ec2");

class NetworkStack extends cdk.Stack {
  CustomVpc;

  constructor(scope, id, props) {
    super(scope, id, props);

    this.CustomVpc = new Vpc(this, "vpc", {
      cidr: this.node.tryGetContext("vpc_cidr"),
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "public",
          subnetType: SubnetType.PUBLIC
        }
      ]
    });
    this.CustomVpc.addGatewayEndpoint("s3-vpc", {
      service: GatewayVpcEndpointAwsService.S3,
      subnets: this.CustomVpc.publicSubnets
    });
  }
}

module.exports = { NetworkStack };
