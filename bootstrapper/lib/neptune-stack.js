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

    const {networkStack} = props;
    const {CustomVpc, NeptuneSg} = networkStack;

    this.NeptunePort = this.node.tryGetContext("neptune_port");
    this.NeptuneTrustedRoleArn =
      "arn:aws:iam::" +
      process.env.CDK_DEFAULT_ACCOUNT +
      ":role/" +
      this.NeptuneTrustedRoleName;

    this.NeptuneDBCluster = this.createNeptuneCluster(CustomVpc, NeptuneSg);
    this.createNeptuneTrustedS3Role();
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

  createNeptuneCluster(customVpc, neptuneSg) {
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
