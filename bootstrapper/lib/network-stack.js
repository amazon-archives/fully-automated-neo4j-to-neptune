// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const cdk = require("@aws-cdk/core");
const {
  Vpc,
  SubnetType,
  SecurityGroup,
  Protocol,
  Port,
  Peer,
  GatewayVpcEndpointAwsService
} = require("@aws-cdk/aws-ec2");

class NetworkStack extends cdk.Stack {
  CustomVpc;
  InstanceSg;
  NeptuneSg;

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

    this.InstanceSg = this.createInstanceSg(this.CustomVpc);
    this.NeptuneSg = this.createNeptuneSg(this.CustomVpc, this.InstanceSg);

  }

  createNeptuneSg(customVpc, instanceSg) {
    const sg = new SecurityGroup(this, "neptune-sg", {
      vpc: customVpc,
      allowAllOutbound: true
    });
    sg.connections.allowFrom(
      instanceSg,
      new Port({
        protocol: Protocol.TCP,
        fromPort: 0,
        toPort: 65535,
        stringRepresentation: "all ports from ec2"
      }),
      "from ec2"
    );
    return sg;
  }

  createInstanceSg(customVpc) {
    const instanceSg = new SecurityGroup(this, "instance-sg", {
      vpc: customVpc,
      allowAllOutbound: true
    });
    instanceSg.addIngressRule(
      Peer.ipv4(this.node.tryGetContext("sg_fromIp")),
      new Port({
        protocol: Protocol.TCP,
        stringRepresentation: "neo4j console",
        fromPort: 7474,
        toPort: 7474
      })
    );
    instanceSg.addIngressRule(
      Peer.ipv4(this.node.tryGetContext("sg_fromIp")),
      new Port({
        protocol: Protocol.TCP,
        stringRepresentation: "neo4j bolt",
        fromPort: 7687,
        toPort: 7687
      })
    );
    instanceSg.addIngressRule(
      Peer.anyIpv4(),
      new Port({
        protocol: Protocol.TCP,
        stringRepresentation: "ssh",
        fromPort: 22,
        toPort: 22
      })
    );
    return instanceSg;
  }

}

module.exports = { NetworkStack };
