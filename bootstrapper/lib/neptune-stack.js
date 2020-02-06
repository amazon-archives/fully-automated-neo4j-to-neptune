// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const cdk = require("@aws-cdk/core");

const { Role, ServicePrincipal, ManagedPolicy } = require("@aws-cdk/aws-iam");
const {
  CfnDBCluster,
  CfnDBSubnetGroup,
  CfnDBInstance,
  CfnDBParameterGroup,
  CfnDBClusterParameterGroup
} = require("@aws-cdk/aws-neptune");
const { SecurityGroup, Peer, Port, Protocol } = require("@aws-cdk/aws-ec2");
const { Output } = require("./shared/output");

class NeptuneStack extends cdk.Stack {
  NeptuneDBClusterIdentifier = "NeptuneDBCluster";
  NeptuneDBCluster;
  NeptuneTrustedRoleName = "NeptuneTrustedS3Role";
  NeptuneTrustedRoleArn;
  NeptunePort;

  constructor(scope, id, props) {
    super(scope, id, props);

    this.NeptunePort = this.node.tryGetContext("neptune_port");
    this.NeptuneTrustedRoleArn =
      "arn:aws:iam::" +
      process.env.CDK_DEFAULT_ACCOUNT +
      ":role/" +
      this.NeptuneTrustedRoleName;

    const { customVpc } = props;

    this.NeptuneDBCluster = this.createNeptuneCluster(customVpc);
    this.createNeptuneTrustedS3Role();
    // this.emitOutput();
  }

  emitOutput() {
    const output = new Output();
    const data = output.load();
    data.NeptuneDbClusterIdentifier = this.NeptuneDBClusterIdentifier;
    data.GremlinEndpoint =
      "http://" +
      this.NeptuneDBCluster.attrEndpoint +
      ":" +
      this.NeptunePort +
      "/gremlin";
    data.LoaderEndpoint =
      "http://" +
      this.NeptuneDBCluster.attrEndpoint +
      ":" +
      this.NeptunePort +
      "/loader";
    data.NeptuneTrustedRole = this.NeptuneTrustedRoleName;
    output.write(data);
  }

  createNeptuneTrustedS3Role() {
    return new Role(this, "NeptuneTrustedS3Role", {
      assumedBy: new ServicePrincipal("rds.amazonaws.com"),
      roleName: this.NeptuneTrustedRoleName,
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess")
      ]
    });
  }

  createNeptuneCluster(customVpc) {
    const neptuneSg = new SecurityGroup(this, "NeptuneSG", {
      vpc: customVpc,
      allowAllOutbound: true
    });

    neptuneSg.addIngressRule(
      Peer.ipv4(this.node.tryGetContext("sg_fromIp")),
      new Port({
        protocol: Protocol.TCP,
        stringRepresentation: "neptune console",
        fromPort: this.NeptunePort,
        toPort: this.NeptunePort
      })
    );
    neptuneSg.addIngressRule(
      Peer.ipv4(this.node.tryGetContext("sg_fromIp")),
      new Port({
        protocol: Protocol.TCP,
        stringRepresentation: "neptune ssh",
        fromPort: 22,
        toPort: 22
      })
    );
    const subnetIds = [];
    customVpc.publicSubnets.forEach(x => {
      subnetIds.push(x.subnetId);
    });
    const neptuneDsg = new CfnDBSubnetGroup(this, "NeptuneDBSubnetGroup", {
      dbSubnetGroupDescription: "vpc subnets for Neptune cluster",
      subnetIds: subnetIds
    });
    const dbcpg = new CfnDBClusterParameterGroup(
      this,
      "NeptuneDBClusterParameterGroup",
      {
        family: "neptune1",
        parameters: {
          neptune_enable_audit_log: 1
        },
        description: "some dbcpg"
      }
    );
    const dbCluster = new CfnDBCluster(this, "NeptuneDBCluster", {
      dbSubnetGroupName: neptuneDsg.dbSubnetGroupName,
      dbClusterIdentifier: this.NeptuneDBClusterIdentifier,
      iamAuthEnabled: false,
      dbClusterParameterGroupName: dbcpg.dbClusterParameterGroupName,
      vpcSecurityGroupIds: [neptuneSg.securityGroupName]
    });
    dbCluster.addOverride("Properties.DBClusterParameterGroupName", {
      Ref: "NeptuneDBClusterParameterGroup"
    });
    dbCluster.addOverride("Properties.DBSubnetGroupName", {
      Ref: "NeptuneDBSubnetGroup"
    });
    const dbpg = new CfnDBParameterGroup(this, "NeptuneDBParameterGroup", {
      family: "neptune1",
      parameters: {
        neptune_query_timeout: 20000
      },
      description: "some dbpg"
    });
    const neptuneDb = new CfnDBInstance(this, "NeptuneDBInstance", {
      dbInstanceClass: "db.r5.large",
      dbParameterGroupName: dbpg.dbParameterGroupName
    });
    neptuneDb.addOverride("Properties.DBClusterIdentifier", {
      Ref: "NeptuneDBCluster"
    });
    neptuneDb.addOverride("Properties.DBParameterGroupName", {
      Ref: "NeptuneDBParameterGroup"
    });

    return dbCluster;
  }
}

module.exports = { NeptuneStack };
